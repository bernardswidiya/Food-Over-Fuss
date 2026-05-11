import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta
from app.models import MealPlan, DailyMenu, User, Recipe
from app.schemas import (
    MealPlanResponse, MealGenerateRequest, DailyMenuResponse,
    RecipeFeedbackRequest, DetectIngredientsResponse, DetectedIngredient,
)
from app.api.dependencies import get_db, get_current_user
from app.ai.recommendation import apply_penalty, recommend_recipe_for_slot

router = APIRouter()

DAYS_ID = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]
MEAL_TYPES = ["sarapan", "siang", "malam"]

@router.get("/", response_model=List[DailyMenuResponse])
def get_meals(start_date: date, end_date: date, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    menus = db.query(DailyMenu).join(MealPlan).filter(
        MealPlan.user_id == current_user.id,
        DailyMenu.date >= start_date,
        DailyMenu.date <= end_date,
        DailyMenu.is_cleared == False
    ).order_by(DailyMenu.date, DailyMenu.meal_type).all()
    return menus

@router.get("/history", response_model=List[MealPlanResponse])
def get_meal_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plans = (
        db.query(MealPlan)
        .filter(MealPlan.user_id == current_user.id)
        .order_by(MealPlan.start_date.desc())
        .all()
    )
    return plans

@router.post("/generate-week", response_model=MealPlanResponse)
def generate_weekly_meals(req: MealGenerateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing_plans = db.query(MealPlan).filter(
        MealPlan.user_id == current_user.id,
        MealPlan.start_date <= req.end_date,
        MealPlan.end_date >= req.start_date
    ).all()
    for plan in existing_plans:
        db.delete(plan)
    db.flush()

    published_recipes = db.query(Recipe).filter(Recipe.is_published == True).all()
    if not published_recipes:
        raise HTTPException(
            status_code=400,
            detail="Belum ada resep yang di-publish oleh Admin. Hubungi Admin untuk menambahkan resep."
        )

    meal_plan = MealPlan(
        user_id=current_user.id,
        start_date=req.start_date,
        end_date=req.end_date
    )
    db.add(meal_plan)
    db.flush()

    num_days = (req.end_date - req.start_date).days + 1
    for day_offset in range(num_days):
        current_date = req.start_date + timedelta(days=day_offset)
        for meal_type in MEAL_TYPES:
            recipe = recommend_recipe_for_slot(db, current_user.id, meal_type)
            if recipe is None:
                raise HTTPException(
                    status_code=400,
                    detail=f"Tidak ada resep tersedia untuk slot {meal_type}."
                )
            menu = DailyMenu(
                meal_plan_id=meal_plan.id,
                date=current_date,
                meal_type=meal_type,
                recipe_name=recipe.name,
                calories=recipe.calories,
                protein=recipe.protein,
                carbs=recipe.carbs,
                fat=recipe.fat,
                ingredients=json.dumps(recipe.ingredients) if recipe.ingredients else "[]",
                recipe_id=recipe.id,
                is_cleared=False
            )
            db.add(menu)

    db.commit()
    db.refresh(meal_plan)
    return meal_plan

@router.put("/{menu_id}/regenerate", response_model=DailyMenuResponse)
def regenerate_meal(menu_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    menu = db.query(DailyMenu).join(MealPlan).filter(
        DailyMenu.id == menu_id,
        MealPlan.user_id == current_user.id
    ).first()
    if not menu:
        raise HTTPException(status_code=404, detail="Menu not found")

    # Penalise the current recipe before swapping
    if menu.recipe_id is not None:
        apply_penalty(db, current_user.id, menu.recipe_id)

    recipe = recommend_recipe_for_slot(
        db, current_user.id, menu.meal_type, exclude_recipe_id=menu.recipe_id
    )
    if recipe is None:
        raise HTTPException(status_code=400, detail="Tidak ada resep alternatif")

    menu.recipe_name = recipe.name
    menu.calories = recipe.calories
    menu.protein = recipe.protein
    menu.carbs = recipe.carbs
    menu.fat = recipe.fat
    menu.ingredients = json.dumps(recipe.ingredients) if recipe.ingredients else "[]"
    menu.recipe_id = recipe.id
    menu.is_cleared = False

    db.commit()
    db.refresh(menu)
    return menu

@router.delete("/{menu_id}")
def clear_meal(menu_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    menu = db.query(DailyMenu).join(MealPlan).filter(
        DailyMenu.id == menu_id,
        MealPlan.user_id == current_user.id
    ).first()
    if not menu:
        raise HTTPException(status_code=404, detail="Menu not found")

    # Penalise the cleared recipe
    if menu.recipe_id is not None:
        apply_penalty(db, current_user.id, menu.recipe_id)

    menu.is_cleared = True
    db.commit()
    return {"message": "Menu cleared successfully"}

@router.post("/feedback")
def submit_feedback(req: RecipeFeedbackRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Explicit feedback: penalise a recipe the user dislikes."""
    recipe = db.query(Recipe).filter(Recipe.id == req.recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    if req.feedback_type not in ("regenerate", "delete"):
        raise HTTPException(status_code=400, detail="feedback_type must be 'regenerate' or 'delete'")

    interaction = apply_penalty(db, current_user.id, req.recipe_id)
    return {
        "message": "Feedback recorded",
        "recipe_id": req.recipe_id,
        "new_affinity_score": interaction.affinity_score,
        "penalty_count": interaction.penalty_count,
    }

@router.post("/detect-ingredients", response_model=DetectIngredientsResponse)
async def detect_ingredients(file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Snap-to-Recipe: detect ingredients from a food photo using MobileNetV2."""
    contents = await file.read()
    detected: list[DetectedIngredient] = []

    try:
        import numpy as np
        from PIL import Image as PILImage
        import io

        try:
            import tensorflow as tf  # type: ignore

            img = PILImage.open(io.BytesIO(contents)).convert("RGB").resize((224, 224))
            arr = np.array(img, dtype=np.float32)
            arr = tf.keras.applications.mobilenet_v2.preprocess_input(arr)
            arr = np.expand_dims(arr, axis=0)

            model = tf.keras.applications.MobileNetV2(weights="imagenet", include_top=True)
            preds = model.predict(arr, verbose=0)
            top = tf.keras.applications.mobilenet_v2.decode_predictions(preds, top=5)[0]

            detected = [
                DetectedIngredient(name=label.replace("_", " "), confidence=round(float(score), 3))
                for _, label, score in top
            ]
        except ImportError:
            # TensorFlow not installed — return placeholder
            detected = [DetectedIngredient(name="Fitur ini memerlukan TensorFlow", confidence=0.0)]

    except Exception:
        detected = [DetectedIngredient(name="Gagal memproses gambar", confidence=0.0)]

    recipe_names = [r.name for r in db.query(Recipe).filter(Recipe.is_published == True).limit(3).all()]
    return DetectIngredientsResponse(ingredients=detected, suggested_recipes=recipe_names)
