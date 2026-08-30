from datetime import datetime, timezone

from app.extensions import db


class Payment(db.Model):
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)

    booking_id = db.Column(
        db.Integer,
        db.ForeignKey("bookings.id"),
        nullable=False,
        unique=True,
    )

    student_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
    )

    amount = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    currency = db.Column(db.String(10), nullable=False, default="KES")
    status = db.Column(db.String(30), nullable=False, default="pending")
    provider = db.Column(db.String(50), nullable=False, default="flutterwave")
    reference = db.Column(db.String(120), nullable=False, unique=True)
    transaction_id = db.Column(db.String(120), nullable=True)
    gateway_response = db.Column(db.Text, nullable=True)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    booking = db.relationship("Booking", backref="payment", uselist=False)
    student = db.relationship("User", backref="payments")
