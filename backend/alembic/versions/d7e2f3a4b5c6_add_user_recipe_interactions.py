"""add user_recipe_interactions table

Revision ID: d7e2f3a4b5c6
Revises: b40da704c12a
Create Date: 2026-05-09 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'd7e2f3a4b5c6'
down_revision = 'b40da704c12a'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'user_recipe_interactions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('recipe_id', sa.Integer(), nullable=True),
        sa.Column('affinity_score', sa.Float(), nullable=True, server_default='1.0'),
        sa.Column('penalty_count', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('last_penalized_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['recipe_id'], ['recipes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_user_recipe_interactions_id', 'user_recipe_interactions', ['id'], unique=False)
    op.create_index('ix_user_recipe_interactions_user_id', 'user_recipe_interactions', ['user_id'], unique=False)
    op.create_index('ix_user_recipe_interactions_recipe_id', 'user_recipe_interactions', ['recipe_id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_user_recipe_interactions_recipe_id', table_name='user_recipe_interactions')
    op.drop_index('ix_user_recipe_interactions_user_id', table_name='user_recipe_interactions')
    op.drop_index('ix_user_recipe_interactions_id', table_name='user_recipe_interactions')
    op.drop_table('user_recipe_interactions')
