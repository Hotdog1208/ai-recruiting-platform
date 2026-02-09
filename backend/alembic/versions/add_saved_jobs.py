"""add saved_jobs table

Revision ID: add_saved_jobs
Revises: add_resume_ext
Create Date: 2026-02-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'add_saved_jobs'
down_revision: Union[str, Sequence[str], None] = 'add_resume_ext'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('saved_jobs',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('candidate_id', sa.UUID(), nullable=False),
        sa.Column('job_id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['candidate_id'], ['candidates.id']),
        sa.ForeignKeyConstraint(['job_id'], ['jobs.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_saved_jobs_candidate_job', 'saved_jobs', ['candidate_id', 'job_id'], unique=True)


def downgrade() -> None:
    op.drop_table('saved_jobs')
