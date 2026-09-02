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
    with op.batch_alter_table("users") as batch_op:
        batch_op.add_column(sa.Column("google_id", sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column("auth_provider", sa.String(length=20), nullable=True))

    op.execute("UPDATE users SET auth_provider = 'local' WHERE auth_provider IS NULL")

    with op.batch_alter_table("users") as batch_op:
        batch_op.alter_column("auth_provider", existing_type=sa.String(length=20), nullable=False)
        batch_op.alter_column("hashed_password", existing_type=sa.String(length=255), nullable=True)
        batch_op.create_unique_constraint("uq_users_google_id", ["google_id"])


def downgrade():
    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_constraint("uq_users_google_id", type_="unique")
        batch_op.alter_column("hashed_password", existing_type=sa.String(length=255), nullable=False)
        batch_op.drop_column("auth_provider")
        batch_op.drop_column("google_id")
