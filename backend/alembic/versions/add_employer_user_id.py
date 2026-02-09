"""add employer user_id

Revision ID: add_employer_user
Revises: f355d560e9fb
Create Date: 2026-02-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'add_employer_user'
down_revision: Union[str, Sequence[str], None] = 'f355d560e9fb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('employers', sa.Column('user_id', sa.UUID(), nullable=True))
    op.create_foreign_key('employers_user_id_fkey', 'employers', 'users', ['user_id'], ['id'])
    op.create_unique_constraint('employers_user_id_key', 'employers', ['user_id'])
    # If there are existing employers without user_id, we'd need to handle them - for fresh DB this is fine


def downgrade() -> None:
    op.drop_constraint('employers_user_id_key', 'employers', type_='unique')
    op.drop_constraint('employers_user_id_fkey', 'employers', type_='foreignkey')
    op.drop_column('employers', 'user_id')
