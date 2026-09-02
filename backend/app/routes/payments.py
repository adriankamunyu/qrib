import os
import uuid
from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.models import Booking, Payment, Property, User


payments_bp = Blueprint("payments", __name__, url_prefix="/api/payments")


def payment_to_dict(payment):
    return {
        "id": payment.id,
        "booking_id": payment.booking_id,
        "student_id": payment.student_id,
        "property_id": payment.property_id,
        "amount": float(payment.amount),
        "currency": payment.currency,
        "provider": payment.provider,
        "status": payment.status,
        "reference": payment.reference,
        "transaction_id": payment.transaction_id,
        "gateway_response": payment.gateway_response,
        "created_at": payment.created_at.isoformat() if payment.created_at else None,
        "updated_at": payment.updated_at.isoformat() if payment.updated_at else None,
    }


@payments_bp.post("/initiate")
@jwt_required()
def initiate_payment():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)

    if not user or user.role != "student":
        return jsonify({"error": "Only students can initiate payments"}), 403

    data = request.get_json(silent=True) or {}
    booking_id = data.get("booking_id")
    amount = data.get("amount")
    currency = (data.get("currency") or "KES").upper()

    if booking_id in (None, ""):
        return jsonify({"error": "booking_id is required"}), 400

    try:
        booking_id = int(booking_id)
    except (TypeError, ValueError):
        return jsonify({"error": "booking_id must be an integer"}), 400

    booking = db.session.get(Booking, booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if booking.student_id != user_id:
        return jsonify({"error": "You can only pay for your own booking"}), 403

    property_id = booking.property_id
    property = db.session.get(Property, property_id)
    if not property:
        return jsonify({"error": "Property not found"}), 404

    parsed_amount = float(amount) if amount not in (None, "") else float(property.price_per_month)
    if parsed_amount <= 0:
        return jsonify({"error": "Payment amount must be greater than zero"}), 400

    existing_payment = Payment.query.filter_by(booking_id=booking.id).first()
    if existing_payment:
        return jsonify({
            "message": "A payment already exists for this booking",
            "payment": payment_to_dict(existing_payment),
            "provider": "flutterwave",
            "sandbox": True,
            "demo_mode": not all([
                os.getenv("FLUTTERWAVE_PUBLIC_KEY"),
                os.getenv("FLUTTERWAVE_SECRET_KEY"),
                os.getenv("FLUTTERWAVE_ENCRYPTION_KEY"),
            ]),
            "checkout": {
                "public_key": os.getenv("FLUTTERWAVE_PUBLIC_KEY", ""),
                "amount": float(existing_payment.amount),
                "currency": existing_payment.currency,
                "reference": existing_payment.reference,
            },
        }), 200

    reference = f"QRIB-{uuid.uuid4().hex[:12].upper()}"
    now = datetime.now(timezone.utc)

    payment = Payment(
        booking_id=booking.id,
        student_id=user_id,
        property_id=property_id,
        amount=parsed_amount,
        currency=currency,
        provider="flutterwave",
        status="pending",
        reference=reference,
        created_at=now,
        updated_at=now,
    )

    db.session.add(payment)
    db.session.commit()

    public_key = os.getenv("FLUTTERWAVE_PUBLIC_KEY", "")
    secret_key = os.getenv("FLUTTERWAVE_SECRET_KEY", "")
    encryption_key = os.getenv("FLUTTERWAVE_ENCRYPTION_KEY", "")
    has_real_keys = all([public_key, secret_key, encryption_key])

    return jsonify({
        "message": "Payment session created successfully",
        "provider": "flutterwave",
        "sandbox": True,
        "demo_mode": not has_real_keys,
        "payment": payment_to_dict(payment),
        "checkout": {
            "public_key": public_key,
            "amount": float(payment.amount),
            "currency": payment.currency,
            "reference": payment.reference,
            "customer": {
                "email": user.email,
                "name": user.name,
            },
            "customizations": {
                "title": "Qrib Accommodation",
                "description": "Student housing payment",
            },
            "payment_options": "card,mobilemoney,ussd",
        },
        "note": (
            "Flutterwave sandbox is ready for Kenya-friendly student payments. "
            "Set FLUTTERWAVE_PUBLIC_KEY, FLUTTERWAVE_SECRET_KEY and "
            "FLUTTERWAVE_ENCRYPTION_KEY to enable live checkout."
            if not has_real_keys else ""
        ),
    }), 201


@payments_bp.get("/<int:payment_id>")
@jwt_required()
def get_payment(payment_id):
    user_id = int(get_jwt_identity())
    payment = db.session.get(Payment, payment_id)

    if not payment:
        return jsonify({"error": "Payment not found"}), 404

    if payment.student_id != user_id:
        return jsonify({"error": "Access denied"}), 403

    return jsonify({"payment": payment_to_dict(payment)}), 200


@payments_bp.patch("/<int:payment_id>/status")
@jwt_required()
def update_payment_status(payment_id):
    user_id = int(get_jwt_identity())
    payment = db.session.get(Payment, payment_id)

    if not payment:
        return jsonify({"error": "Payment not found"}), 404

    if payment.student_id != user_id:
        return jsonify({"error": "Access denied"}), 403

    data = request.get_json(silent=True) or {}
    status = data.get("status")

    if not status:
        return jsonify({"error": "status is required"}), 400

    allowed_statuses = ["pending", "successful", "failed", "cancelled"]
    if status not in allowed_statuses:
        return jsonify({"error": "Invalid status", "allowed_statuses": allowed_statuses}), 400

    payment.status = status
    payment.gateway_response = data.get("gateway_response") or payment.gateway_response
    payment.transaction_id = data.get("transaction_id") or payment.transaction_id
    payment.updated_at = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify({
        "message": "Payment status updated",
        "payment": payment_to_dict(payment),
    }), 200
