from __future__ import annotations

import random
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from ..models import Recipe, UserRecipeInteraction

PENALTY_AMOUNT = 0.25
MIN_AFFINITY = 0.0
INITIAL_AFFINITY = 1.0

# KNN target: balanced nutrition + high affinity
_TARGET = [0.5, 0.5, 0.5, 0.5, 1.0]
_TOP_K = 3


def _norm(value: float, max_val: float) -> float:
    if max_val == 0:
        return 0.0
    return min(value / max_val, 1.0)


def _distance(features: list[float], target: list[float]) -> float:
    return sum((a - b) ** 2 for a, b in zip(features, target)) ** 0.5


def apply_penalty(db: Session, user_id: int, recipe_id: int) -> UserRecipeInteraction:
    interaction = (
        db.query(UserRecipeInteraction)
        .filter_by(user_id=user_id, recipe_id=recipe_id)
        .first()
    )
    if interaction is None:
        interaction = UserRecipeInteraction(
            user_id=user_id,
            recipe_id=recipe_id,
            affinity_score=INITIAL_AFFINITY,
            penalty_count=0,
        )
        db.add(interaction)

    interaction.affinity_score = max(
        MIN_AFFINITY, interaction.affinity_score - PENALTY_AMOUNT
    )
    interaction.penalty_count += 1
    interaction.last_penalized_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(interaction)
    return interaction


def recommend_recipe_for_slot(
    db: Session,
    user_id: int,
    meal_type: str,
    exclude_recipe_id: Optional[int] = None,
) -> Optional[Recipe]:
    recipes = (
        db.query(Recipe)
        .filter(Recipe.is_published == True, Recipe.meal_type == meal_type)
        .all()
    )
    if not recipes:
        return None

    if exclude_recipe_id is not None:
        candidates = [r for r in recipes if r.id != exclude_recipe_id]
        if not candidates:
            candidates = recipes
    else:
        candidates = recipes

    # Build affinity lookup for this user
    interactions = (
        db.query(UserRecipeInteraction)
        .filter(UserRecipeInteraction.user_id == user_id)
        .all()
    )
    affinity_map: dict[int, float] = {i.recipe_id: i.affinity_score for i in interactions}

    # Find nutrition maxima for normalisation
    max_cal = max((r.calories for r in candidates), default=1) or 1
    max_pro = max((r.protein for r in candidates), default=1) or 1
    max_carb = max((r.carbs for r in candidates), default=1) or 1
    max_fat = max((r.fat for r in candidates), default=1) or 1

    scored = []
    for recipe in candidates:
        features = [
            _norm(recipe.calories, max_cal),
            _norm(recipe.protein, max_pro),
            _norm(recipe.carbs, max_carb),
            _norm(recipe.fat, max_fat),
            affinity_map.get(recipe.id, INITIAL_AFFINITY),
        ]
        dist = _distance(features, _TARGET)
        scored.append((dist, recipe))

    scored.sort(key=lambda x: x[0])
    top_k = scored[: min(_TOP_K, len(scored))]

    # Weighted-random: lower distance → higher weight
    max_dist = max(d for d, _ in top_k) or 1.0
    weights = [max_dist - d + 1e-6 for d, _ in top_k]
    (chosen,) = random.choices([r for _, r in top_k], weights=weights, k=1)
    return chosen
