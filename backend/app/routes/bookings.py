from datetime import date

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import Booking, Property, User


bookings_bp = Blueprint(
    "bookings",
    __name__,
    url_prefix="/api/bookings"
)


# ============================================================
# CREATE BOOKING
# POST /api/bookings
# ============================================================

@bookings_bp.post("")
@jwt_required()
def create_booking():
    user_id = int(get_jwt_identity())

    user = db.session.get(User, user_id)

    if not user or user.role != "student":
        return jsonify({
            "error": "Only students can create bookings"
        }), 403

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    required_fields = [
        "property_id",
        "move_in_date",
    ]

    missing = [
        field
        for field in required_fields
        if data.get(field) in (None, "")
    ]

    if missing:
        return jsonify({
            "error": "Missing required fields",
            "fields": missing
        }), 400

    # Check property exists
    property = db.session.get(
        Property,
        data["property_id"]
    )

    if not property:
        return jsonify({
            "error": "Property not found"
        }), 404

    # Validate date
    try:
        move_in_date = date.fromisoformat(
            data["move_in_date"]
        )
    except (ValueError, TypeError):
        return jsonify({
            "error": "Invalid move_in_date format. Use YYYY-MM-DD"
        }), 400

    # Create booking
    booking = Booking(
        property_id=data["property_id"],
        student_id=user_id,
        move_in_date=move_in_date,
        status="pending",
    )

    db.session.add(booking)
    db.session.commit()

    return jsonify({
        "message": "Booking created successfully",
        "booking": booking_to_dict(booking)
    }), 201


# ============================================================
# GET ALL BOOKINGS
# GET /api/bookings
# ============================================================

@bookings_bp.get("")
@jwt_required()
def get_bookings():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)

    if user.role == "student":
        bookings = (
            Booking.query
            .filter_by(student_id=user_id)
            .order_by(Booking.id.desc())
            .all()
        )
    else:
        # Host sees bookings for their properties
        bookings = (
            Booking.query
            .join(Property)
            .filter(Property.host_id == user_id)
            .order_by(Booking.id.desc())
            .all()
        )

    return jsonify([
        booking_to_dict(booking)
        for booking in bookings
    ]), 200


# ============================================================
# GET SINGLE BOOKING
# GET /api/bookings/<booking_id>
# ============================================================

@bookings_bp.get("/<int:booking_id>")
@jwt_required()
def get_booking(booking_id):
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)

    booking = db.session.get(Booking, booking_id)

    if not booking:
        return jsonify({
            "error": "Booking not found"
        }), 404

    if user.role == "student" and booking.student_id != user_id:
        return jsonify({"error": "Access denied"}), 403

    if user.role == "host" and booking.property.host_id != user_id:
        return jsonify({"error": "Access denied"}), 403

    return jsonify({
        "booking": booking_to_dict(booking)
    }), 200


# ============================================================
# UPDATE BOOKING
# PATCH /api/bookings/<booking_id>
# ============================================================

@bookings_bp.patch("/<int:booking_id>")
@jwt_required()
def update_booking(booking_id):
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)

    booking = db.session.get(Booking, booking_id)

    if not booking:
        return jsonify({
            "error": "Booking not found"
        }), 404

    # Students can only cancel their own bookings
    if user.role == "student":
        if booking.student_id != user_id:
            return jsonify({"error": "Access denied"}), 403
    # Hosts can only update bookings on their properties
    elif user.role == "host":
        if booking.property.host_id != user_id:
            return jsonify({"error": "Access denied"}), 403

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    allowed_statuses = ["pending", "approved", "rejected", "cancelled"]

    if "status" in data:
        status = data["status"]

        # Students can only cancel
        if user.role == "student" and status != "cancelled":
            return jsonify({
                "error": "Students can only cancel bookings"
            }), 403

        if status not in allowed_statuses:
            return jsonify({
                "error": "Invalid status",
                "allowed_statuses": allowed_statuses
            }), 400

        booking.status = status

    if "move_in_date" in data:
        try:
            booking.move_in_date = date.fromisoformat(
                data["move_in_date"]
            )
        except (ValueError, TypeError):
            return jsonify({
                "error": "Invalid move_in_date format. Use YYYY-MM-DD"
            }), 400

    db.session.commit()

    return jsonify({
        "message": "Booking updated successfully",
        "booking": booking_to_dict(booking)
    }), 200


# ============================================================
# SERIALIZE BOOKING
# ============================================================

def booking_to_dict(booking):
    return {
        "id": booking.id,
        "property_id": booking.property_id,
        "student_id": booking.student_id,
        "move_in_date": (
            str(booking.move_in_date)
            if booking.move_in_date
            else None
        ),
        "status": booking.status,
        "created_at": (
            booking.created_at.isoformat()
            if booking.created_at
            else None
        ),
    }