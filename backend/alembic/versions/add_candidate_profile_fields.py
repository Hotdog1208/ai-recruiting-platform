"""add candidate profile fields

Revision ID: add_candidate_profile
Revises: add_saved_jobs
Create Date: 2026-02-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'add_candidate_profile'
down_revision: Union[str, Sequence[str], None] = 'add_saved_jobs'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('candidates', sa.Column('age', sa.Integer(), nullable=True))
    op.add_column('candidates', sa.Column('city', sa.String(), nullable=True))
    op.add_column('candidates', sa.Column('state', sa.String(), nullable=True))
    op.add_column('candidates', sa.Column('country', sa.String(), nullable=True))
    op.add_column('candidates', sa.Column('work_preference', sa.String(), nullable=True))
    op.add_column('candidates', sa.Column('work_type', sa.String(), nullable=True))
    op.add_column('candidates', sa.Column('phone', sa.String(), nullable=True))
    op.add_column('candidates', sa.Column('headline', sa.String(), nullable=True))
    op.add_column('candidates', sa.Column('summary', sa.String(), nullable=True))

def downgrade() -> None:
    op.drop_column('candidates', 'summary')
    op.drop_column('candidates', 'headline')
    op.drop_column('candidates', 'phone')
    op.drop_column('candidates', 'work_type')
    op.drop_column('candidates', 'work_preference')
    op.drop_column('candidates', 'country')
    op.drop_column('candidates', 'state')
    op.drop_column('candidates', 'city')
    op.drop_column('candidates', 'age')
