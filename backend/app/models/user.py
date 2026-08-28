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