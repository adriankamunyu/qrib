from datetime import datetime, timezone

from app.extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    username = db.Column(
        db.String(80),
        unique=True,
        nullable=False
    )

    email = db.Column(
        db.String(255),
        unique=True,
        nullable=False
    )

    name = db.Column(
        db.String(120),
        nullable=False
    )

    role = db.Column(
        db.String(20),
        nullable=False,
        default="student"
    )

    hashed_password = db.Column(
        db.String(255),
        nullable=True
    )

    google_id = db.Column(
        db.String(255),
        unique=True,
        nullable=True
    )

    auth_provider = db.Column(
        db.String(20),
        nullable=False,
        default="local"
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    properties = db.relationship(
        "Property",
        back_populates="host",
        lazy=True
    )

    bookings = db.relationship(
        "Booking",
        back_populates="student",
        lazy=True
    )

    payments = db.relationship(
        "Payment",
        back_populates="student",
        lazy=True,
    )

    sent_messages = db.relationship(
        "Message",
        foreign_keys="Message.sender_id",
        back_populates="sender",
        lazy=True,
    )

    received_messages = db.relationship(
        "Message",
        foreign_keys="Message.receiver_id",
        back_populates="receiver",
        lazy=True,
    )

    notifications = db.relationship(
        "Notification",
        back_populates="user",
        lazy=True,
    )

    verification = db.relationship(
        "HostVerification",
        back_populates="host",
        uselist=False,
        lazy=True,
    )

    reviews = db.relationship(
        "Review",
        back_populates="user",
        lazy=True,
    )