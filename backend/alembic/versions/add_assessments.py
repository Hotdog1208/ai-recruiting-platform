"""add assessments and assessment_results tables

Revision ID: add_assessments
Revises: add_messaging
Create Date: 2026-02-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "add_assessments"
down_revision: Union[str, Sequence[str], None] = "add_messaging"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "assessments",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("skill_name", sa.String(128), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("questions", postgresql.JSONB(), nullable=False),
        sa.Column("passing_score", sa.Integer(), nullable=True, server_default="70"),
        sa.Column("duration_minutes", sa.Integer(), nullable=True, server_default="30"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_assessments_skill_name", "assessments", ["skill_name"])

    op.create_table(
        "assessment_results",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("candidate_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("assessment_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.Column("passed", sa.Boolean(), nullable=False),
        sa.Column("answers", postgresql.JSONB(), nullable=True),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["candidate_id"], ["candidates.id"]),
        sa.ForeignKeyConstraint(["assessment_id"], ["assessments.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_assessment_results_candidate_assessment",
        "assessment_results",
        ["candidate_id", "assessment_id"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index("ix_assessment_results_candidate_assessment", "assessment_results")
    op.drop_table("assessment_results")
    op.drop_index("ix_assessments_skill_name", "assessments")
    op.drop_table("assessments")
