from __future__ import annotations

import random
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from ..models import Recipe, UserRecipeInteraction, Preference

PENALTY_AMOUNT = 0.35   # setiap penolakan memangkas 35% affinity (lebih terasa)
MIN_AFFINITY = 0.0
INITIAL_AFFINITY = 1.0

# KNN target: balanced nutrition + high affinity
_TARGET = [0.5, 0.5, 0.5, 0.5, 1.0]
_TOP_K = 12             # dari 3 → 12: randomizer punya ruang gerak yang jauh lebih luas
_MIN_CANDIDATES = 3     # ambang batas sebelum fallback dilonggarkan


def _norm(value: float, max_val: float) -> float:
    if max_val == 0:
        return 0.0
    return min(value / max_val, 1.0)


def _distance(features: list[float], target: list[float]) -> float:
    return sum((a - b) ** 2 for a, b in zip(features, target)) ** 0.5


def _allergen_safe(recipe: Recipe, user_allergies: set[str]) -> bool:
    """True jika resep tidak mengandung alergen milik user."""
    if not user_allergies:
        return True
    recipe_allergens = {a.strip().lower() for a in (recipe.allergens or [])}
    return not (user_allergies & recipe_allergens)


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

    # Kecualikan resep yang sedang di-regenerate
    pool = [r for r in recipes if r.id != exclude_recipe_id] if exclude_recipe_id else recipes
    if not pool:
        pool = recipes

    # ── Ambil preferensi user ──────────────────────────────────────────────
    preference = db.query(Preference).filter(Preference.user_id == user_id).first()

    user_allergies: set[str] = set()
    per_meal_budget: float = 0.0

    if preference:
        per_meal_budget = (preference.daily_budget or 0) / 3
        user_allergies = {
            a.strip().lower()
            for a in (preference.allergies or "").split(",")
            if a.strip()
        }

    # ── Hard-filter bertingkat (graceful degradation) ──────────────────────
    #
    # Tier 1: budget + allergen  → kandidat ideal
    # Tier 2: allergen only      → longgarkan budget jika Tier 1 terlalu sedikit
    # Tier 3: full pool          → hanya jika tidak ada preferensi sama sekali
    #                              ATAU tidak ada resep yang lolos alergen
    #         (alergen selalu dipertahankan kecuali benar-benar nol pilihan)

    def _apply_budget(p: list[Recipe]) -> list[Recipe]:
        if per_meal_budget <= 0:
            return p
        return [r for r in p if (r.estimated_cost or 0) <= per_meal_budget]

    def _apply_allergen(p: list[Recipe]) -> list[Recipe]:
        if not user_allergies:
            return p
        return [r for r in p if _allergen_safe(r, user_allergies)]

    tier1 = _apply_allergen(_apply_budget(pool))
    if len(tier1) >= _MIN_CANDIDATES:
        candidates = tier1
    else:
        # Longgarkan budget, pertahankan alergen
        tier2 = _apply_allergen(pool)
        if len(tier2) >= _MIN_CANDIDATES:
            candidates = tier2
        else:
            # Last resort: pakai semua pool (mungkin tidak ada resep aman alergen sama sekali)
            candidates = pool

    # ── Affinity lookup ────────────────────────────────────────────────────
    interactions = (
        db.query(UserRecipeInteraction)
        .filter(UserRecipeInteraction.user_id == user_id)
        .all()
    )
    affinity_map: dict[int, float] = {i.recipe_id: i.affinity_score for i in interactions}

    # ── KNN scoring ────────────────────────────────────────────────────────
    max_cal  = max((r.calories for r in candidates), default=1) or 1
    max_pro  = max((r.protein  for r in candidates), default=1) or 1
    max_carb = max((r.carbs    for r in candidates), default=1) or 1
    max_fat  = max((r.fat      for r in candidates), default=1) or 1

    scored: list[tuple[float, Recipe]] = []
    for recipe in candidates:
        affinity = affinity_map.get(recipe.id, INITIAL_AFFINITY)
        features = [
            _norm(recipe.calories, max_cal),
            _norm(recipe.protein,  max_pro),
            _norm(recipe.carbs,    max_carb),
            _norm(recipe.fat,      max_fat),
            affinity,
        ]
        dist = _distance(features, _TARGET)
        scored.append((dist, recipe))

    scored.sort(key=lambda x: x[0])
    top_k = scored[: min(_TOP_K, len(scored))]

    # Weighted-random: jarak lebih kecil → bobot lebih tinggi
    # Tambah sedikit noise agar resep dengan skor sama tidak selalu urut sama
    max_dist = max(d for d, _ in top_k) or 1.0
    weights = [max_dist - d + random.uniform(0.01, 0.05) for d, _ in top_k]
    (chosen,) = random.choices([r for _, r in top_k], weights=weights, k=1)
    return chosen
