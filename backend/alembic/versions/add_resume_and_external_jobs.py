"""add resume and external jobs

Revision ID: add_resume_ext
Revises: add_applications
Create Date: 2026-02-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'add_resume_ext'
down_revision: Union[str, Sequence[str], None] = 'add_applications'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('candidates', sa.Column('resume_url', sa.String(), nullable=True))
    op.add_column('candidates', sa.Column('resume_parsed_data', sa.JSON(), nullable=True))
    op.create_table('external_jobs',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('external_id', sa.String(), nullable=True),
        sa.Column('source', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('company', sa.String(), nullable=True),
        sa.Column('location', sa.String(), nullable=True),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('url', sa.String(), nullable=True),
        sa.Column('salary_min', sa.String(), nullable=True),
        sa.Column('salary_max', sa.String(), nullable=True),
        sa.Column('raw_data', sa.JSON(), nullable=True),
        sa.Column('fetched_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_external_jobs_external_id', 'external_jobs', ['external_id'], unique=False)


def downgrade() -> None:
    op.drop_table('external_jobs')
    op.drop_column('candidates', 'resume_parsed_data')
    op.drop_column('candidates', 'resume_url')
