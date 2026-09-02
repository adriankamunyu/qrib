from datetime import datetime, timezone

from app.extensions import db


class Message(db.Model):
    __tablename__ = "messages"

    id = db.Column(db.Integer, primary_key=True)

    booking_id = db.Column(
        db.Integer,
        db.ForeignKey("bookings.id"),
        nullable=True,
    )

    property_id = db.Column(
        db.Integer,
        db.ForeignKey("properties.id"),
        nullable=True,
    )

    sender_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
    )

    receiver_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
    )

    message = db.Column(db.Text, nullable=False)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    sender = db.relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    receiver = db.relationship("User", foreign_keys=[receiver_id], back_populates="received_messages")
    booking = db.relationship("Booking", back_populates="messages")
    property = db.relationship("Property", back_populates="messages")
