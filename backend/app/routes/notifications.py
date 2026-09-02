from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import desc
from datetime import datetime

from ..models.notification import Notification
from ..models.user import User
from ..extensions import db

notifications_bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")


@notifications_bp.before_request
@jwt_required()
def before_request():
    """Require JWT for all notification routes."""
    pass


@notifications_bp.route("", methods=["GET"])
@jwt_required()
def get_notifications():
    """
    Get user's notifications with pagination.
    
    Query Parameters:
    - page (int, default=1): Page number for pagination
    - limit (int, default=20): Number of notifications per page
    - is_read (bool, optional): Filter by read status
    
    Returns:
    {
        "notifications": [...],
        "total": 50,
        "pages": 3,
        "current_page": 1
    }
    """
    try:
        user_id = get_jwt_identity()
        page = request.args.get("page", 1, type=int)
        limit = request.args.get("limit", 20, type=int)
        is_read = request.args.get("is_read", type=lambda x: x.lower() == "true", default=None)

        # Validate pagination
        page = max(1, page)
        limit = min(100, max(1, limit))

        # Build query
        query = Notification.query.filter_by(user_id=user_id)

        # Filter by read status if provided
        if is_read is not None:
            query = query.filter_by(is_read=is_read)

        # Sort by newest first
        query = query.order_by(desc(Notification.created_at))

        # Paginate
        paginated = query.paginate(page=page, per_page=limit, error_out=False)

        notifications = [
            {
                "id": notification.id,
                "title": notification.title,
                "body": notification.body,
                "type": notification.type,
                "is_read": notification.is_read,
                "data": notification.data or {},
                "created_at": notification.created_at.isoformat() if notification.created_at else None,
            }
            for notification in paginated.items
        ]

        return jsonify({
            "notifications": notifications,
            "total": paginated.total,
            "pages": paginated.pages,
            "current_page": page,
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@notifications_bp.route("/<int:notification_id>", methods=["GET"])
@jwt_required()
def get_notification(notification_id):
    """Get a single notification by ID."""
    try:
        user_id = get_jwt_identity()
        
        notification = Notification.query.filter_by(
            id=notification_id,
            user_id=user_id
        ).first()

        if not notification:
            return jsonify({"error": "Notification not found"}), 404

        return jsonify({
            "id": notification.id,
            "title": notification.title,
            "body": notification.body,
            "type": notification.type,
            "is_read": notification.is_read,
            "data": notification.data or {},
            "created_at": notification.created_at.isoformat() if notification.created_at else None,
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@notifications_bp.route("/<int:notification_id>/read", methods=["PATCH"])
@jwt_required()
def mark_as_read(notification_id):
    """Mark a notification as read."""
    try:
        user_id = get_jwt_identity()
        
        notification = Notification.query.filter_by(
            id=notification_id,
            user_id=user_id
        ).first()

        if not notification:
            return jsonify({"error": "Notification not found"}), 404

        notification.is_read = True
        db.session.commit()

        return jsonify({
            "message": "Notification marked as read",
            "id": notification.id,
            "is_read": notification.is_read,
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@notifications_bp.route("/<int:notification_id>", methods=["DELETE"])
@jwt_required()
def delete_notification(notification_id):
    """Delete a notification."""
    try:
        user_id = get_jwt_identity()
        
        notification = Notification.query.filter_by(
            id=notification_id,
            user_id=user_id
        ).first()

        if not notification:
            return jsonify({"error": "Notification not found"}), 404

        db.session.delete(notification)
        db.session.commit()

        return jsonify({"message": "Notification deleted"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@notifications_bp.route("/mark-all-read", methods=["PATCH"])
@jwt_required()
def mark_all_as_read():
    """Mark all user's notifications as read."""
    try:
        user_id = get_jwt_identity()
        
        count = Notification.query.filter_by(
            user_id=user_id,
            is_read=False
        ).update({Notification.is_read: True})
        
        db.session.commit()

        return jsonify({
            "message": f"Marked {count} notifications as read",
            "count": count,
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@notifications_bp.route("/unread-count", methods=["GET"])
@jwt_required()
def get_unread_count():
    """Get count of unread notifications."""
    try:
        user_id = get_jwt_identity()
        
        count = Notification.query.filter_by(
            user_id=user_id,
            is_read=False
        ).count()

        return jsonify({"unread_count": count}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def create_notification(user_id, title, body, notification_type="info", data=None):
    """
    Internal function to create a notification for a user.
    Called by other routes (e.g., admin approval, booking confirmation).
    
    Args:
        user_id (int): Target user ID
        title (str): Notification title
        body (str): Notification body/message
        notification_type (str): Type of notification (info, warning, success, error)
        data (dict): Additional data/metadata
    
    Returns:
        Notification: The created notification object
    """
    try:
        notification = Notification(
            user_id=user_id,
            title=title,
            body=body,
            type=notification_type,
            data=data or {},
        )
        db.session.add(notification)
        db.session.commit()
        return notification
    except Exception as e:
        db.session.rollback()
        print(f"Error creating notification: {e}")
        return None
