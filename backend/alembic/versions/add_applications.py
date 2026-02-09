"""add applications table

Revision ID: add_applications
Revises: add_employer_user
Create Date: 2026-02-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'add_applications'
down_revision: Union[str, Sequence[str], None] = 'add_employer_user'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('jobs', sa.Column('description', sa.String(), nullable=True))
    op.create_table('applications',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('job_id', sa.UUID(), nullable=False),
        sa.Column('candidate_id', sa.UUID(), nullable=False),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['job_id'], ['jobs.id'], ),
        sa.ForeignKeyConstraint(['candidate_id'], ['candidates.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_applications_job_candidate', 'applications', ['job_id', 'candidate_id'], unique=True)


def downgrade() -> None:
    op.drop_table('applications')
    op.drop_column('jobs', 'description')
