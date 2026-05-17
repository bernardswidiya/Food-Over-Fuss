"""add allergens and estimated_cost to recipes

Revision ID: e8f9a0b1c2d3
Revises: d7e2f3a4b5c6
Create Date: 2026-05-17 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'e8f9a0b1c2d3'
down_revision = 'd7e2f3a4b5c6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('recipes', sa.Column('allergens', sa.JSON(), nullable=True))
    op.add_column('recipes', sa.Column('estimated_cost', sa.Integer(), server_default='0', nullable=True))


def downgrade() -> None:
    op.drop_column('recipes', 'estimated_cost')
    op.drop_column('recipes', 'allergens')
