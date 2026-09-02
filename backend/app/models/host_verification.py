from datetime import datetime, timezone

from app.extensions import db


class HostVerification(db.Model):
    __tablename__ = "host_verifications"

    id = db.Column(db.Integer, primary_key=True)

    host_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        unique=True,
    )

    id_number = db.Column(db.String(100), nullable=True)
    document_url = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(30), nullable=False, default="pending")
    notes = db.Column(db.Text, nullable=True)

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

    host = db.relationship("User", back_populates="verification")
