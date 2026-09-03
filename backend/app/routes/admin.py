from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, desc
from datetime import datetime, timezone

from app.extensions import db
from app.models import User, Property, Booking, Review, Notification, HostVerification, Payment

admin_bp = Blueprint(
    "admin",
    __name__,
    url_prefix="/api/admin",
)


# ============================================================
# MIDDLEWARE: ADMIN AUTHORIZATION
# ============================================================

def require_admin():
    """Decorator to ensure user is an admin"""
    def decorator(f):
        @jwt_required()
        def decorated_function(*args, **kwargs):
            user_id = int(get_jwt_identity())
            user = db.session.get(User, user_id)
            
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            if user.role != "admin":
                return jsonify({"error": "Admin access required"}), 403
            
            return f(*args, **kwargs)
        
        decorated_function.__name__ = f.__name__
        return decorated_function
    return decorator


# ============================================================
# DASHBOARD STATISTICS
# GET /api/admin/dashboard/stats
# ============================================================

@admin_bp.get("/dashboard/stats")
@require_admin()
def get_dashboard_stats():
    """Get platform-wide statistics for admin dashboard"""
    
    total_users = db.session.query(func.count(User.id)).scalar()
    total_students = db.session.query(func.count(User.id)).filter(User.role == "student").scalar()
    total_hosts = db.session.query(func.count(User.id)).filter(User.role == "host").scalar()
    
    total_properties = db.session.query(func.count(Property.id)).scalar()
    verified_properties = db.session.query(func.count(Property.id)).filter(Property.verified_host == True).scalar()
    
    total_bookings = db.session.query(func.count(Booking.id)).scalar()
    completed_bookings = db.session.query(func.count(Booking.id)).filter(Booking.status == "completed").scalar()
    pending_bookings = db.session.query(func.count(Booking.id)).filter(Booking.status == "pending").scalar()
    
    total_revenue = db.session.query(func.sum(Payment.amount)).scalar() or 0
    
    pending_verifications = db.session.query(func.count(HostVerification.id)).filter(
        HostVerification.status == "pending"
    ).scalar()
    
    return jsonify({
        "users": {
            "total": total_users,
            "students": total_students,
            "hosts": total_hosts,
        },
        "properties": {
            "total": total_properties,
            "verified": verified_properties,
            "unverified": total_properties - verified_properties,
        },
        "bookings": {
            "total": total_bookings,
            "completed": completed_bookings,
            "pending": pending_bookings,
        },
        "revenue": float(total_revenue),
        "pending_verifications": pending_verifications,
    }), 200


# ============================================================
# USER MANAGEMENT
# ============================================================

@admin_bp.get("/users")
@require_admin()
def list_users():
    """Get paginated list of all users"""
    
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 20, type=int)
    role_filter = request.args.get("role", None)
    search = request.args.get("search", None)
    
    query = User.query
    
    if role_filter and role_filter in ("student", "host", "admin"):
        query = query.filter(User.role == role_filter)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            db.or_(
                User.name.ilike(search_term),
                User.email.ilike(search_term),
                User.username.ilike(search_term),
            )
        )
    
    pagination = query.paginate(page=page, per_page=limit, error_out=False)
    
    users_data = []
    for user in pagination.items:
        users_data.append({
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "auth_provider": user.auth_provider,
            "created_at": user.created_at.isoformat(),
            "properties_count": len(user.properties) if user.role == "host" else 0,
            "bookings_count": len(user.bookings) if user.role == "student" else 0,
        })
    
    return jsonify({
        "data": users_data,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": pagination.total,
            "pages": pagination.pages,
        }
    }), 200


@admin_bp.get("/users/<int:user_id>")
@require_admin()
def get_user_details(user_id):
    """Get detailed information about a specific user"""
    
    user = db.session.get(User, user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    user_data = {
        "id": user.id,
        "username": user.username,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "auth_provider": user.auth_provider,
        "created_at": user.created_at.isoformat(),
    }
    
    if user.role == "host":
        user_data["verification"] = None
        if user.verification:
            user_data["verification"] = {
                "id": user.verification.id,
                "status": user.verification.status,
                "created_at": user.verification.created_at.isoformat(),
                "updated_at": user.verification.updated_at.isoformat(),
            }
        
        user_data["properties"] = [
            {
                "id": p.id,
                "title": p.title,
                "city": p.city,
                "verified_host": p.verified_host,
                "created_at": p.created_at.isoformat(),
            }
            for p in user.properties
        ]
        user_data["properties_count"] = len(user.properties)
    
    if user.role == "student":
        user_data["bookings"] = [
            {
                "id": b.id,
                "property_id": b.property_id,
                "status": b.status,
                "created_at": b.created_at.isoformat(),
            }
            for b in user.bookings
        ]
        user_data["bookings_count"] = len(user.bookings)
    
    return jsonify(user_data), 200


@admin_bp.patch("/users/<int:user_id>/role")
@require_admin()
def update_user_role(user_id):
    """Update user's role"""
    
    data = request.get_json()
    
    if not data or "role" not in data:
        return jsonify({"error": "Role is required"}), 400
    
    new_role = data["role"].strip().lower()
    
    if new_role not in ("student", "host", "admin"):
        return jsonify({"error": "Invalid role"}), 400
    
    user = db.session.get(User, user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    user.role = new_role
    db.session.commit()
    
    return jsonify({
        "message": "User role updated successfully",
        "user_id": user.id,
        "new_role": new_role,
    }), 200


@admin_bp.delete("/users/<int:user_id>")
@require_admin()
def delete_user(user_id):
    """Delete a user and their associated data"""
    
    # Prevent deleting yourself
    admin_id = int(get_jwt_identity())
    if admin_id == user_id:
        return jsonify({"error": "Cannot delete your own account"}), 400
    
    user = db.session.get(User, user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Delete related data
    Message.query.filter(
        db.or_(Message.sender_id == user_id, Message.receiver_id == user_id)
    ).delete()
    
    Notification.query.filter(Notification.user_id == user_id).delete()
    
    if user.role == "host":
        Property.query.filter(Property.host_id == user_id).delete()
        HostVerification.query.filter(HostVerification.host_id == user_id).delete()
    
    if user.role == "student":
        Booking.query.filter(Booking.student_id == user_id).delete()
    
    Review.query.filter(Review.user_id == user_id).delete()
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({"message": "User deleted successfully"}), 200


# ============================================================
# PROPERTY MODERATION
# ============================================================

@admin_bp.get("/properties/moderation")
@require_admin()
def get_moderation_queue():
    """Get properties awaiting moderation/verification"""
    
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 20, type=int)
    
    unverified_properties = Property.query.filter(
        Property.verified_host == False
    ).order_by(desc(Property.created_at)).paginate(page=page, per_page=limit, error_out=False)
    
    properties_data = []
    for prop in unverified_properties.items:
        properties_data.append({
            "id": prop.id,
            "title": prop.title,
            "area": prop.area,
            "city": prop.city,
            "price_per_month": float(prop.price_per_month),
            "property_type": prop.property_type,
            "bedrooms": prop.bedrooms,
            "bathrooms": prop.bathrooms,
            "verified_host": prop.verified_host,
            "host_id": prop.host_id,
            "host_name": prop.host.name if prop.host else "Unknown",
            "image": prop.image or "",
            "created_at": prop.created_at.isoformat(),
        })
    
    return jsonify({
        "data": properties_data,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": unverified_properties.total,
            "pages": unverified_properties.pages,
        }
    }), 200


@admin_bp.patch("/properties/<int:property_id>/verify")
@require_admin()
def verify_property(property_id):
    """Approve/verify a property listing"""
    
    data = request.get_json()
    approved = data.get("approved", False) if data else False
    
    prop = db.session.get(Property, property_id)
    
    if not prop:
        return jsonify({"error": "Property not found"}), 404
    
    prop.verified_host = approved
    db.session.commit()
    
    # Send notification to host
    message = f"Your property '{prop.title}' has been {'approved' if approved else 'rejected'}"
    notification = Notification(
        user_id=prop.host_id,
        title="Property Verification",
        body=message,
    )
    db.session.add(notification)
    db.session.commit()
    
    return jsonify({
        "message": f"Property {'approved' if approved else 'rejected'} successfully",
        "property_id": property_id,
    }), 200


@admin_bp.delete("/properties/<int:property_id>")
@require_admin()
def delete_property(property_id):
    """Delete a property listing"""
    
    prop = db.session.get(Property, property_id)
    
    if not prop:
        return jsonify({"error": "Property not found"}), 404
    
    # Delete related data
    Message.query.filter(Message.property_id == property_id).delete()
    Review.query.filter(Review.property_id == property_id).delete()
    Booking.query.filter(Booking.property_id == property_id).delete()
    
    db.session.delete(prop)
    db.session.commit()
    
    # Notify host
    notification = Notification(
        user_id=prop.host_id,
        title="Property Deleted",
        body=f"Your property '{prop.title}' has been removed from the platform",
    )
    db.session.add(notification)
    db.session.commit()
    
    return jsonify({"message": "Property deleted successfully"}), 200


# ============================================================
# HOST VERIFICATION MANAGEMENT
# ============================================================

@admin_bp.get("/verifications/pending")
@require_admin()
def get_pending_verifications():
    """Get list of pending host verifications"""
    
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 20, type=int)
    
    pending_verifications = HostVerification.query.filter(
        HostVerification.status == "pending"
    ).order_by(desc(HostVerification.created_at)).paginate(page=page, per_page=limit, error_out=False)
    
    verifications_data = []
    for verification in pending_verifications.items:
        verifications_data.append({
            "id": verification.id,
            "host_id": verification.host_id,
            "host_name": verification.host.name if verification.host else "Unknown",
            "host_email": verification.host.email if verification.host else "Unknown",
            "id_number": verification.id_number or "",
            "document_url": verification.document_url or "",
            "status": verification.status,
            "notes": verification.notes or "",
            "created_at": verification.created_at.isoformat(),
        })
    
    return jsonify({
        "data": verifications_data,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": pending_verifications.total,
            "pages": pending_verifications.pages,
        }
    }), 200


@admin_bp.patch("/verifications/<int:verification_id>/approve")
@require_admin()
def approve_verification(verification_id):
    """Approve a host verification request"""
    
    data = request.get_json()
    notes = data.get("notes", "") if data else ""
    
    verification = db.session.get(HostVerification, verification_id)
    
    if not verification:
        return jsonify({"error": "Verification not found"}), 404
    
    verification.status = "approved"
    verification.notes = notes
    verification.updated_at = datetime.now(timezone.utc)
    db.session.commit()
    
    # Notify host
    notification = Notification(
        user_id=verification.host_id,
        title="Verification Approved",
        body="Your account has been verified! You can now list unlimited properties.",
    )
    db.session.add(notification)
    db.session.commit()
    
    return jsonify({
        "message": "Verification approved successfully",
        "verification_id": verification_id,
    }), 200


@admin_bp.patch("/verifications/<int:verification_id>/reject")
@require_admin()
def reject_verification(verification_id):
    """Reject a host verification request"""
    
    data = request.get_json()
    notes = data.get("notes", "") if data else ""
    
    if not notes:
        return jsonify({"error": "Rejection reason is required"}), 400
    
    verification = db.session.get(HostVerification, verification_id)
    
    if not verification:
        return jsonify({"error": "Verification not found"}), 404
    
    verification.status = "rejected"
    verification.notes = notes
    verification.updated_at = datetime.now(timezone.utc)
    db.session.commit()
    
    # Notify host
    notification = Notification(
        user_id=verification.host_id,
        title="Verification Rejected",
        body=f"Your verification was rejected. Reason: {notes}",
    )
    db.session.add(notification)
    db.session.commit()
    
    return jsonify({
        "message": "Verification rejected successfully",
        "verification_id": verification_id,
    }), 200


# ============================================================
# BOOKING MANAGEMENT
# ============================================================

@admin_bp.get("/bookings")
@require_admin()
def list_all_bookings():
    """Get paginated list of all bookings"""
    
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 20, type=int)
    status_filter = request.args.get("status", None)
    
    query = Booking.query
    
    if status_filter:
        query = query.filter(Booking.status == status_filter)
    
    bookings_pagination = query.order_by(desc(Booking.created_at)).paginate(page=page, per_page=limit, error_out=False)
    
    bookings_data = []
    for booking in bookings_pagination.items:
        bookings_data.append({
            "id": booking.id,
            "property_id": booking.property_id,
            "property_title": booking.property.title if booking.property else "Unknown",
            "student_id": booking.student_id,
            "student_name": booking.student.name if booking.student else "Unknown",
            "status": booking.status,
            "move_in_date": booking.move_in_date.isoformat() if booking.move_in_date else None,
            "created_at": booking.created_at.isoformat(),
        })
    
    return jsonify({
        "data": bookings_data,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": bookings_pagination.total,
            "pages": bookings_pagination.pages,
        }
    }), 200


# ============================================================
# REPORTS & DISPUTES
# ============================================================

@admin_bp.get("/reports")
@require_admin()
def get_reports():
    """Get list of reported properties/users"""
    
    # This would require a Reports model to be added
    # For now, we can get properties with low ratings as potential issues
    
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 20, type=int)
    
    problematic_properties = Property.query.filter(
        Property.rating < 2.5
    ).order_by(Property.rating).paginate(page=page, per_page=limit, error_out=False)
    
    properties_data = []
    for prop in problematic_properties.items:
        properties_data.append({
            "id": prop.id,
            "title": prop.title,
            "city": prop.city,
            "rating": float(prop.rating or 0),
            "host_name": prop.host.name if prop.host else "Unknown",
            "review_count": len(prop.reviews),
        })
    
    return jsonify({
        "data": properties_data,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": problematic_properties.total,
            "pages": problematic_properties.pages,
        }
    }), 200


# ============================================================
# ACTIVITY LOGS
# ============================================================

@admin_bp.get("/activity-logs")
@require_admin()
def get_activity_logs():
    """Get recent activity logs"""
    
    # Get recent bookings, reviews, and properties created
    recent_bookings = Booking.query.order_by(desc(Booking.created_at)).limit(5).all()
    recent_reviews = Review.query.order_by(desc(Review.created_at)).limit(5).all()
    recent_properties = Property.query.order_by(desc(Property.created_at)).limit(5).all()
    
    activity_log = []
    
    for booking in recent_bookings:
        activity_log.append({
            "type": "booking_created",
            "description": f"{booking.student.name} created booking for {booking.property.title}",
            "timestamp": booking.created_at.isoformat(),
        })
    
    for review in recent_reviews:
        activity_log.append({
            "type": "review_created",
            "description": f"{review.user.name} reviewed {review.property.title}",
            "timestamp": review.created_at.isoformat(),
        })
    
    for prop in recent_properties:
        activity_log.append({
            "type": "property_created",
            "description": f"{prop.host.name} created property '{prop.title}'",
            "timestamp": prop.created_at.isoformat(),
        })
    
    # Sort by timestamp descending
    activity_log.sort(key=lambda x: x["timestamp"], reverse=True)
    
    return jsonify({
        "data": activity_log[:20],  # Return latest 20 activities
    }), 200
