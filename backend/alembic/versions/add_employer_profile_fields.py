"""add employer profile fields

Revision ID: add_employer_profile
Revises: add_candidate_profile
Create Date: 2026-02-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'add_employer_profile'
down_revision: Union[str, Sequence[str], None] = 'add_candidate_profile'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('employers', sa.Column('website', sa.String(), nullable=True))
    op.add_column('employers', sa.Column('company_size', sa.String(), nullable=True))
    op.add_column('employers', sa.Column('location', sa.String(), nullable=True))
    op.add_column('employers', sa.Column('description', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('employers', 'description')
    op.drop_column('employers', 'location')
    op.drop_column('employers', 'company_size')
    op.drop_column('employers', 'website')
