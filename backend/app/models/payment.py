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

    property_id = db.Column(
        db.Integer,
        db.ForeignKey("properties.id"),
        nullable=False,
    )

    amount = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(10), nullable=False, default="KES")
    provider = db.Column(db.String(50), nullable=False, default="flutterwave")
    status = db.Column(db.String(30), nullable=False, default="pending")
    reference = db.Column(db.String(255), unique=True, nullable=False)

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

    booking = db.relationship("Booking", back_populates="payments")
    student = db.relationship("User", back_populates="payments")
    property = db.relationship("Property", back_populates="payments")
