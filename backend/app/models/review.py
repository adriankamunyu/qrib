from datetime import datetime, timezone

from app.extensions import db


class Review(db.Model):
    __tablename__ = "reviews"

    id = db.Column(db.Integer, primary_key=True)

    property_id = db.Column(
        db.Integer,
        db.ForeignKey("properties.id"),
        nullable=False,
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
    )

    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=True)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    property = db.relationship("Property", back_populates="reviews")
    user = db.relationship("User", back_populates="reviews")
