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
        "amount": float(payment.amount),
        "currency": payment.currency,
        "status": payment.status,
        "provider": payment.provider,
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

    if not booking_id:
        return jsonify({"error": "booking_id is required"}), 400

    booking = db.session.get(Booking, booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if booking.student_id != user_id:
        return jsonify({"error": "Access denied"}), 403

    if booking.property is None:
        return jsonify({"error": "Booking property not found"}), 404

    try:
        amount_value = float(amount if amount is not None else booking.property.price_per_month)
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid amount"}), 400

    reference = f"QRIB-{uuid.uuid4().hex[:12].upper()}"
    now = datetime.now(timezone.utc)

    payment = Payment(
        booking_id=booking.id,
        student_id=user_id,
        amount=amount_value,
        currency="KES",
        status="pending",
        provider="flutterwave",
        reference=reference,
        created_at=now,
        updated_at=now,
    )

    db.session.add(payment)
    db.session.commit()

    flutterwave_public_key = os.getenv("FLUTTERWAVE_PUBLIC_KEY", "demo")
    return jsonify({
        "message": "Payment initiated",
        "payment": payment_to_dict(payment),
        "provider": "flutterwave",
        "sandbox_mode": True,
        "public_key": flutterwave_public_key,
        "reference": reference,
        "amount": amount_value,
        "currency": "KES",
        "redirect_url": "/payment/" + str(booking.id),
    }), 200


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

    return jsonify({"message": "Payment status updated", "payment": payment_to_dict(payment)}), 200
