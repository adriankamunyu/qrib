from datetime import datetime, timezone

from app.extensions import db


class Booking(db.Model):
    __tablename__ = "bookings"

    id = db.Column(db.Integer, primary_key=True)

    property_id = db.Column(
        db.Integer,
        db.ForeignKey("properties.id"),
        nullable=False,
    )

    student_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
    )

    status = db.Column(
        db.String(30),
        nullable=False,
        default="pending",
    )

    move_in_date = db.Column(db.Date)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    property = db.relationship(
        "Property",
        back_populates="bookings",
    )

    student = db.relationship(
        "User",
        back_populates="bookings",
    )
