from datetime import datetime, timezone

from app.extensions import db


class Property(db.Model):
    __tablename__ = "properties"

    id = db.Column(db.Integer, primary_key=True)

    title = db.Column(db.String(255), nullable=False)
    area = db.Column(db.String(120), nullable=False)
    city = db.Column(db.String(100), nullable=False)

    description = db.Column(db.Text, nullable=False)

    price_per_month = db.Column(db.Numeric(10, 2), nullable=False)

    property_type = db.Column(db.String(50), nullable=False)

    bedrooms = db.Column(db.Integer, default=1)
    bathrooms = db.Column(db.Integer, default=1)

    furnished = db.Column(db.Boolean, default=True)

    image = db.Column(db.Text)

    distance_km = db.Column(db.Numeric(5, 2), default=0)

    rating = db.Column(db.Numeric(3, 2), default=0)

    verified_host = db.Column(db.Boolean, default=False)

    host_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
    )

    university_id = db.Column(
        db.Integer,
        db.ForeignKey("universities.id"),
        nullable=False,
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    host = db.relationship(
        "User",
        back_populates="properties",
    )

    university = db.relationship(
        "University",
        back_populates="properties",
    )

    bookings = db.relationship(
        "Booking",
        back_populates="property",
        lazy=True,
    )
