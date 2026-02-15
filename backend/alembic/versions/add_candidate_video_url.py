"""add video_url to candidates

Revision ID: add_candidate_video
Revises: seed_assessments
Create Date: 2026-02-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "add_candidate_video"
down_revision: Union[str, Sequence[str], None] = "seed_assessments"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("candidates", sa.Column("video_url", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("candidates", "video_url")
