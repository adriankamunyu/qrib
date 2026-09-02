from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import desc, or_
from datetime import datetime, timezone

from app.extensions import db
from app.models import Message, User, Property, Notification

messages_bp = Blueprint(
    "messages",
    __name__,
    url_prefix="/api/messages",
)


# ============================================================
# SEND MESSAGE
# POST /api/messages
# ============================================================

@messages_bp.post("")
@jwt_required()
def send_message():
    """Send a message to another user"""
    
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    
    required_fields = ["receiver_id", "message"]
    missing = [field for field in required_fields if data.get(field) in (None, "")]
    
    if missing:
        return jsonify({"error": "Missing required fields", "fields": missing}), 400
    
    try:
        receiver_id = int(data["receiver_id"])
    except (ValueError, TypeError):
        return jsonify({"error": "receiver_id must be an integer"}), 400
    
    message_text = data.get("message", "").strip()
    booking_id = data.get("booking_id")
    property_id = data.get("property_id")
    
    if len(message_text) < 1:
        return jsonify({"error": "Message cannot be empty"}), 400
    
    if len(message_text) > 5000:
        return jsonify({"error": "Message is too long (max 5000 characters)"}), 400
    
    sender_id = int(get_jwt_identity())
    
    # Prevent sending messages to yourself
    if sender_id == receiver_id:
        return jsonify({"error": "Cannot send messages to yourself"}), 400
    
    # Verify receiver exists
    receiver = db.session.get(User, receiver_id)
    if not receiver:
        return jsonify({"error": "Receiver not found"}), 404
    
    # Validate booking_id if provided
    if booking_id:
        try:
            booking_id = int(booking_id)
        except (ValueError, TypeError):
            booking_id = None
    
    # Validate property_id if provided
    if property_id:
        try:
            property_id = int(property_id)
            prop = db.session.get(Property, property_id)
            if not prop:
                return jsonify({"error": "Property not found"}), 404
        except (ValueError, TypeError):
            property_id = None
    
    # Create message
    message = Message(
        sender_id=sender_id,
        receiver_id=receiver_id,
        message=message_text,
        booking_id=booking_id,
        property_id=property_id,
    )
    
    db.session.add(message)
    db.session.commit()
    
    # Send notification to receiver
    sender = db.session.get(User, sender_id)
    notification = Notification(
        user_id=receiver_id,
        title="New Message",
        body=f"New message from {sender.name}",
    )
    db.session.add(notification)
    db.session.commit()
    
    return jsonify({
        "message_id": message.id,
        "status": "sent",
        "timestamp": message.created_at.isoformat(),
    }), 201


# ============================================================
# GET CONVERSATIONS
# GET /api/messages/conversations
# ============================================================

@messages_bp.get("/conversations")
@jwt_required()
def get_conversations():
    """Get list of all conversations for current user"""
    
    user_id = int(get_jwt_identity())
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 20, type=int)
    
    # Get all users the current user has messaged with
    message_partners = db.session.query(
        db.case(
            (Message.sender_id == user_id, Message.receiver_id),
            else_=Message.sender_id
        ).label("partner_id")
    ).filter(
        or_(Message.sender_id == user_id, Message.receiver_id == user_id)
    ).distinct().all()
    
    partner_ids = [mp[0] for mp in message_partners]
    
    # Get last message with each partner
    conversations = []
    for partner_id in partner_ids:
        last_message = Message.query.filter(
            or_(
                (Message.sender_id == user_id) & (Message.receiver_id == partner_id),
                (Message.sender_id == partner_id) & (Message.receiver_id == user_id)
            )
        ).order_by(desc(Message.created_at)).first()
        
        if last_message:
            partner = db.session.get(User, partner_id)
            conversations.append({
                "partner_id": partner_id,
                "partner_name": partner.name if partner else "Unknown",
                "last_message": last_message.message,
                "last_message_at": last_message.created_at.isoformat(),
                "sender": "you" if last_message.sender_id == user_id else partner.name,
            })
    
    # Sort by most recent
    conversations.sort(key=lambda x: x["last_message_at"], reverse=True)
    
    # Paginate
    total = len(conversations)
    start = (page - 1) * limit
    end = start + limit
    paginated_conversations = conversations[start:end]
    
    return jsonify({
        "data": paginated_conversations,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit,
        }
    }), 200


# ============================================================
# GET CONVERSATION WITH USER
# GET /api/messages/user/<user_id>
# ============================================================

@messages_bp.get("/user/<int:other_user_id>")
@jwt_required()
def get_conversation(other_user_id):
    """Get all messages in a conversation with a specific user"""
    
    user_id = int(get_jwt_identity())
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 50, type=int)
    
    # Verify other user exists
    other_user = db.session.get(User, other_user_id)
    if not other_user:
        return jsonify({"error": "User not found"}), 404
    
    # Get messages between the two users
    messages_query = Message.query.filter(
        or_(
            (Message.sender_id == user_id) & (Message.receiver_id == other_user_id),
            (Message.sender_id == other_user_id) & (Message.receiver_id == user_id)
        )
    ).order_by(desc(Message.created_at))
    
    messages_pagination = messages_query.paginate(page=page, per_page=limit, error_out=False)
    
    # Reverse to show oldest first
    messages_data = []
    for msg in reversed(messages_pagination.items):
        messages_data.append({
            "id": msg.id,
            "sender_id": msg.sender_id,
            "receiver_id": msg.receiver_id,
            "message": msg.message,
            "booking_id": msg.booking_id,
            "property_id": msg.property_id,
            "created_at": msg.created_at.isoformat(),
            "is_own_message": msg.sender_id == user_id,
        })
    
    return jsonify({
        "other_user": {
            "id": other_user.id,
            "name": other_user.name,
        },
        "data": messages_data,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": messages_pagination.total,
            "pages": messages_pagination.pages,
        }
    }), 200


# ============================================================
# GET MESSAGES BY PROPERTY
# GET /api/messages/property/<property_id>
# ============================================================

@messages_bp.get("/property/<int:property_id>")
@jwt_required()
def get_property_messages(property_id):
    """Get all messages related to a property"""
    
    user_id = int(get_jwt_identity())
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 50, type=int)
    
    prop = db.session.get(Property, property_id)
    if not prop:
        return jsonify({"error": "Property not found"}), 404
    
    # Get messages for this property
    messages_pagination = Message.query.filter_by(
        property_id=property_id
    ).order_by(desc(Message.created_at)).paginate(page=page, per_page=limit, error_out=False)
    
    messages_data = []
    for msg in messages_pagination.items:
        messages_data.append({
            "id": msg.id,
            "sender_id": msg.sender_id,
            "sender_name": msg.sender.name if msg.sender else "Unknown",
            "receiver_id": msg.receiver_id,
            "message": msg.message,
            "created_at": msg.created_at.isoformat(),
        })
    
    return jsonify({
        "property": {
            "id": prop.id,
            "title": prop.title,
        },
        "data": messages_data,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": messages_pagination.total,
            "pages": messages_pagination.pages,
        }
    }), 200


# ============================================================
# GET MESSAGE BY ID
# GET /api/messages/<message_id>
# ============================================================

@messages_bp.get("/<int:message_id>")
@jwt_required()
def get_message(message_id):
    """Get a single message by ID"""
    
    message = db.session.get(Message, message_id)
    
    if not message:
        return jsonify({"error": "Message not found"}), 404
    
    user_id = int(get_jwt_identity())
    
    # Only sender or receiver can view the message
    if message.sender_id != user_id and message.receiver_id != user_id:
        return jsonify({"error": "You don't have permission to view this message"}), 403
    
    return jsonify({
        "id": message.id,
        "sender_id": message.sender_id,
        "sender_name": message.sender.name if message.sender else "Unknown",
        "receiver_id": message.receiver_id,
        "receiver_name": message.receiver.name if message.receiver else "Unknown",
        "message": message.message,
        "booking_id": message.booking_id,
        "property_id": message.property_id,
        "created_at": message.created_at.isoformat(),
    }), 200


# ============================================================
# DELETE MESSAGE
# DELETE /api/messages/<message_id>
# ============================================================

@messages_bp.delete("/<int:message_id>")
@jwt_required()
def delete_message(message_id):
    """Delete a message (only by sender or admin)"""
    
    message = db.session.get(Message, message_id)
    
    if not message:
        return jsonify({"error": "Message not found"}), 404
    
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    
    # Only sender or admin can delete
    if message.sender_id != user_id and user.role != "admin":
        return jsonify({"error": "You can only delete your own messages"}), 403
    
    db.session.delete(message)
    db.session.commit()
    
    return jsonify({"message": "Message deleted successfully"}), 200


# ============================================================
# SEARCH MESSAGES
# GET /api/messages/search
# ============================================================

@messages_bp.get("/search")
@messages_bp.get("/search/<query>")
@jwt_required()
def search_messages(query=None):
    """Search messages by content"""
    
    query_param = request.args.get("q", query or "")
    
    if not query_param:
        return jsonify({"error": "Search query is required"}), 400
    
    user_id = int(get_jwt_identity())
    
    search_term = f"%{query_param}%"
    messages = Message.query.filter(
        (Message.message.ilike(search_term)) & (
            (Message.sender_id == user_id) | (Message.receiver_id == user_id)
        )
    ).order_by(desc(Message.created_at)).limit(50).all()
    
    messages_data = []
    for msg in messages:
        messages_data.append({
            "id": msg.id,
            "sender_id": msg.sender_id,
            "sender_name": msg.sender.name if msg.sender else "Unknown",
            "receiver_id": msg.receiver_id,
            "receiver_name": msg.receiver.name if msg.receiver else "Unknown",
            "message": msg.message,
            "created_at": msg.created_at.isoformat(),
        })
    
    return jsonify({"data": messages_data}), 200
