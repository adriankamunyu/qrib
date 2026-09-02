from datetime import datetime, timezone

from app.extensions import db


class PropertyImage(db.Model):
    __tablename__ = "property_images"

    id = db.Column(db.Integer, primary_key=True)

    property_id = db.Column(
        db.Integer,
        db.ForeignKey("properties.id"),
        nullable=False,
    )

    image_url = db.Column(db.Text, nullable=False)
    is_primary = db.Column(db.Boolean, default=False, nullable=False)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    property = db.relationship("Property", back_populates="images")
