"""Add pgvector

Revision ID: a4cd4a58d363
Revises: add_candidate_video
Create Date: 2026-02-22 14:05:57.140430

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import pgvector.sqlalchemy


# revision identifiers, used by Alembic.
revision: str = 'a4cd4a58d363'
down_revision: Union[str, Sequence[str], None] = 'add_candidate_video'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.add_column('candidates', sa.Column('embedding', pgvector.sqlalchemy.vector.VECTOR(dim=1536), nullable=True))
    op.add_column('jobs', sa.Column('embedding', pgvector.sqlalchemy.vector.VECTOR(dim=1536), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('jobs', 'embedding')
    op.drop_column('candidates', 'embedding')
