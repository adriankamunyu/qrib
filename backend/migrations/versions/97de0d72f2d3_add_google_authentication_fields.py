"""add Google authentication fields

Revision ID: 97de0d72f2d3
Revises: 1bf9d933e8ef
Create Date: 2026-08-27
"""

from alembic import op
import sqlalchemy as sa


revision = "97de0d72f2d3"
down_revision = "1bf9d933e8ef"
branch_labels = None
depends_on = None


def upgrade():
    # Add Google ID as nullable because existing/local users don't have one.
    op.add_column(
        "users",
        sa.Column(
            "google_id",
            sa.String(length=255),
            nullable=True,
        ),
    )

    # Add auth_provider as nullable first so existing rows don't violate NOT NULL.
    op.add_column(
        "users",
        sa.Column(
            "auth_provider",
            sa.String(length=20),
            nullable=True,
        ),
    )

    # Existing accounts are local accounts.
    op.execute(
        "UPDATE users SET auth_provider = 'local' "
        "WHERE auth_provider IS NULL"
    )

    # Now it is safe to enforce NOT NULL.
    op.alter_column(
        "users",
        "auth_provider",
        existing_type=sa.String(length=20),
        nullable=False,
    )

    # Google accounts may not have a password.
    op.alter_column(
        "users",
        "hashed_password",
        existing_type=sa.String(length=255),
        nullable=True,
    )

    # A Google account can only be linked to one Google identity.
    op.create_unique_constraint(
        "uq_users_google_id",
        "users",
        ["google_id"],
    )


def downgrade():
    op.drop_constraint(
        "uq_users_google_id",
        "users",
        type_="unique",
    )

    op.alter_column(
        "users",
        "hashed_password",
        existing_type=sa.String(length=255),
        nullable=False,
    )

    op.drop_column("users", "auth_provider")
    op.drop_column("users", "google_id")
