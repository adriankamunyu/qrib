from datetime import date

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.models import Booking, Property, User


bookings_bp = Blueprint(
    "bookings",
    __name__,
    url_prefix="/api/bookings",
)


@bookings_bp.post("")
@jwt_required()
def create_booking():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)

    if not user:
        return jsonify({"error": "Authenticated user not found"}), 404

    if user.role not in {"student", "admin"}:
        return jsonify({"error": "Only students can create bookings"}), 403

    data = request.get_json(silent=True) or {}

    if not data:
        return jsonify({"error": "Request body is required"}), 400

    property_id = data.get("property_id")
    student_id = data.get("student_id", user_id)

    if property_id in (None, ""):
        return jsonify({"error": "Missing required field", "field": "property_id"}), 400

    try:
        property_id = int(property_id)
        student_id = int(student_id)
    except (TypeError, ValueError):
        return jsonify({"error": "property_id and student_id must be integers"}), 400

    if student_id != user_id and user.role != "admin":
        return jsonify({"error": "You can only create a booking for your own account"}), 403

    property = db.session.get(Property, property_id)
    if not property:
        return jsonify({"error": "Property not found"}), 404

    student = db.session.get(User, student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404

    move_in_date = data.get("move_in_date")
    if not move_in_date:
        return jsonify({"error": "Missing required field", "field": "move_in_date"}), 400

    try:
        move_in_date = date.fromisoformat(str(move_in_date))
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid move_in_date format. Use YYYY-MM-DD"}), 400

    booking = Booking(
        property_id=property_id,
        student_id=student_id,
        move_in_date=move_in_date,
        status="pending",
    )

    db.session.add(booking)
    db.session.commit()

    return jsonify({
        "message": "Booking created successfully",
        "booking": booking_to_dict(booking),
    }), 201


@bookings_bp.get("")
@jwt_required()
def get_bookings():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.role == "student":
        bookings = (
            Booking.query
            .filter_by(student_id=user_id)
            .order_by(Booking.id.desc())
            .all()
        )
    elif user.role == "host":
        bookings = (
            Booking.query
            .join(Property)
            .filter(Property.host_id == user_id)
            .order_by(Booking.id.desc())
            .all()
        )
    else:
        bookings = []

    return jsonify([booking_to_dict(booking) for booking in bookings]), 200


@bookings_bp.get("/<int:booking_id>")
@jwt_required()
def get_booking(booking_id):
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)

    booking = db.session.get(Booking, booking_id)

    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if user.role == "student" and booking.student_id != user_id:
        return jsonify({"error": "Access denied"}), 403

    if user.role == "host" and booking.property.host_id != user_id:
        return jsonify({"error": "Access denied"}), 403

    return jsonify({"booking": booking_to_dict(booking)}), 200


@bookings_bp.patch("/<int:booking_id>")
@jwt_required()
def update_booking(booking_id):
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)

    booking = db.session.get(Booking, booking_id)

    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if user.role == "student":
        if booking.student_id != user_id:
            return jsonify({"error": "Access denied"}), 403
    elif user.role == "host":
        if booking.property.host_id != user_id:
            return jsonify({"error": "Access denied"}), 403

    data = request.get_json(silent=True) or {}

    if not data:
        return jsonify({"error": "Request body is required"}), 400

    allowed_statuses = ["pending", "approved", "rejected", "cancelled"]

    if "status" in data:
        status = data["status"]

        if user.role == "student" and status != "cancelled":
            return jsonify({"error": "Students can only cancel bookings"}), 403

        if status not in allowed_statuses:
            return jsonify({"error": "Invalid status", "allowed_statuses": allowed_statuses}), 400

        booking.status = status

    if "move_in_date" in data:
        try:
            booking.move_in_date = date.fromisoformat(data["move_in_date"])
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid move_in_date format. Use YYYY-MM-DD"}), 400

    db.session.commit()

    return jsonify({
        "message": "Booking updated successfully",
        "booking": booking_to_dict(booking),
    }), 200


def booking_to_dict(booking):
    return {
        "id": booking.id,
        "property_id": booking.property_id,
        "student_id": booking.student_id,
        "move_in_date": (str(booking.move_in_date) if booking.move_in_date else None),
        "status": booking.status,
        "created_at": (booking.created_at.isoformat() if booking.created_at else None),
    }
