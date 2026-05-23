import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import date, timedelta
from app.models import MealPlan, DailyMenu, User, Recipe, UserRecipeInteraction
from app.schemas import (
    MealPlanResponse, MealGenerateRequest, DailyMenuResponse,
    RecipeFeedbackRequest, DetectIngredientsResponse, DetectedIngredient,
    SetRecipeRequest,
)
from app.api.dependencies import get_db, get_current_user
from app.ai.recommendation import apply_penalty, recommend_recipe_for_slot

router = APIRouter()

DAYS_ID = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]
MEAL_TYPES = ["sarapan", "siang", "malam"]

@router.get("/", response_model=List[DailyMenuResponse])
def get_meals(start_date: date, end_date: date, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from sqlalchemy.orm import joinedload
    menus = db.query(DailyMenu).join(MealPlan).filter(
        MealPlan.user_id == current_user.id,
        DailyMenu.date >= start_date,
        DailyMenu.date <= end_date,
    ).order_by(DailyMenu.date, DailyMenu.meal_type).all()

    recipe_ids = [m.recipe_id for m in menus if m.recipe_id]
    recipes_by_id = {}
    if recipe_ids:
        recipes = db.query(Recipe).filter(Recipe.id.in_(recipe_ids)).all()
        recipes_by_id = {r.id: r for r in recipes}

    result = []
    for menu in menus:
        d = {
            "id": menu.id,
            "meal_plan_id": menu.meal_plan_id,
            "date": menu.date,
            "meal_type": menu.meal_type,
            "recipe_name": menu.recipe_name,
            "calories": menu.calories,
            "protein": menu.protein,
            "carbs": menu.carbs,
            "fat": menu.fat,
            "ingredients": menu.ingredients,
            "recipe_id": menu.recipe_id,
            "is_cleared": menu.is_cleared,
            "image_url": recipes_by_id[menu.recipe_id].image_url if menu.recipe_id and menu.recipe_id in recipes_by_id else None,
        }
        result.append(d)
    return result

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

@router.put("/{menu_id}/set-recipe", response_model=DailyMenuResponse)
def set_recipe(menu_id: int, req: SetRecipeRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    menu = db.query(DailyMenu).join(MealPlan).filter(
        DailyMenu.id == menu_id,
        MealPlan.user_id == current_user.id
    ).first()
    if not menu:
        raise HTTPException(status_code=404, detail="Menu tidak ditemukan")

    recipe = db.query(Recipe).filter(Recipe.id == req.recipe_id, Recipe.is_published == True).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Resep tidak ditemukan")

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
    return {
        "id": menu.id,
        "meal_plan_id": menu.meal_plan_id,
        "date": menu.date,
        "meal_type": menu.meal_type,
        "recipe_name": menu.recipe_name,
        "calories": menu.calories,
        "protein": menu.protein,
        "carbs": menu.carbs,
        "fat": menu.fat,
        "ingredients": menu.ingredients,
        "recipe_id": menu.recipe_id,
        "is_cleared": menu.is_cleared,
        "image_url": recipe.image_url,
    }


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

@router.get("/{menu_id}/detail")
def get_meal_detail(
    menu_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        menu = db.query(DailyMenu).join(MealPlan).filter(
            DailyMenu.id == menu_id,
            MealPlan.user_id == current_user.id,
        ).first()
        if not menu:
            raise HTTPException(status_code=404, detail="Menu tidak ditemukan")

        result = {
            "id": menu.id,
            "meal_plan_id": menu.meal_plan_id,
            "date": str(menu.date),
            "meal_type": menu.meal_type,
            "recipe_name": menu.recipe_name,
            "calories": menu.calories,
            "protein": menu.protein,
            "carbs": menu.carbs,
            "fat": menu.fat,
            "ingredients": menu.ingredients,
            "recipe_id": menu.recipe_id,
            "image_url": None,
            "prep_time": None,
            "instructions": [],
            "allergens": [],
            "estimated_cost": 0,
        }

        if menu.recipe_id:
            recipe = db.query(Recipe).filter(Recipe.id == menu.recipe_id).first()
            if recipe:
                result["image_url"] = recipe.image_url
                result["prep_time"] = recipe.prep_time
                result["instructions"] = recipe.instructions or []
                result["allergens"] = recipe.allergens or []
                result["estimated_cost"] = recipe.estimated_cost or 0

        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] get_meal_detail menu_id={menu_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{menu_id}/alternatives")
def get_meal_alternatives(
    menu_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        menu = db.query(DailyMenu).join(MealPlan).filter(
            DailyMenu.id == menu_id,
            MealPlan.user_id == current_user.id,
        ).first()
        if not menu:
            raise HTTPException(status_code=404, detail="Menu tidak ditemukan")

        cal_min = int(menu.calories * 0.8)
        cal_max = int(menu.calories * 1.2)
        prot_min = int(menu.protein * 0.8)
        prot_max = int(menu.protein * 1.2)

        print(f"[DEBUG] alternatives menu_id={menu_id}: cal={menu.calories} ({cal_min}-{cal_max}), prot={menu.protein} ({prot_min}-{prot_max})")

        query = db.query(Recipe).filter(
            Recipe.is_published == True,
            Recipe.calories >= cal_min,
            Recipe.calories <= cal_max,
            Recipe.protein >= prot_min,
            Recipe.protein <= prot_max,
        )
        if menu.recipe_id:
            query = query.filter(Recipe.id != menu.recipe_id)

        alternatives = query.order_by(func.random()).limit(6).all()
        print(f"[DEBUG] found {len(alternatives)} alternatives")

        return [
            {
                "id": r.id,
                "name": r.name,
                "meal_type": r.meal_type.value if hasattr(r.meal_type, "value") else r.meal_type,
                "prep_time": r.prep_time,
                "calories": r.calories,
                "protein": r.protein,
                "carbs": r.carbs,
                "fat": r.fat,
                "image_url": r.image_url,
                "allergens": r.allergens or [],
                "estimated_cost": r.estimated_cost or 0,
                "instructions": r.instructions or [],
            }
            for r in alternatives
        ]
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] get_meal_alternatives menu_id={menu_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{menu_id}/substitute")
def get_meal_substitute(
    menu_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        menu = db.query(DailyMenu).join(MealPlan).filter(
            DailyMenu.id == menu_id,
            MealPlan.user_id == current_user.id,
        ).first()
        if not menu:
            raise HTTPException(status_code=404, detail="Menu tidak ditemukan")

        penalized_ids = [
            i.recipe_id for i in db.query(UserRecipeInteraction).filter(
                UserRecipeInteraction.user_id == current_user.id,
                UserRecipeInteraction.penalty_count > 0,
            ).all()
        ]
        if menu.recipe_id:
            penalized_ids.append(menu.recipe_id)

        cal_min = int(menu.calories * 0.8)
        cal_max = int(menu.calories * 1.2)
        prot_min = int(menu.protein * 0.8)
        prot_max = int(menu.protein * 1.2)

        query = db.query(Recipe).filter(
            Recipe.is_published == True,
            Recipe.calories >= cal_min,
            Recipe.calories <= cal_max,
            Recipe.protein >= prot_min,
            Recipe.protein <= prot_max,
        )
        if penalized_ids:
            query = query.filter(Recipe.id.notin_(penalized_ids))

        substitute = query.order_by(func.random()).first()

        if not substitute:
            print(f"[DEBUG] no macro match, fallback to meal_type={menu.meal_type}")
            fallback = db.query(Recipe).filter(
                Recipe.is_published == True,
                Recipe.meal_type == menu.meal_type,
            )
            if menu.recipe_id:
                fallback = fallback.filter(Recipe.id != menu.recipe_id)
            substitute = fallback.order_by(func.random()).first()

        if not substitute:
            raise HTTPException(status_code=404, detail="Tidak ada pengganti yang tersedia")

        return {
            "id": substitute.id,
            "name": substitute.name,
            "meal_type": substitute.meal_type.value if hasattr(substitute.meal_type, "value") else substitute.meal_type,
            "prep_time": substitute.prep_time,
            "calories": substitute.calories,
            "protein": substitute.protein,
            "carbs": substitute.carbs,
            "fat": substitute.fat,
            "image_url": substitute.image_url,
            "allergens": substitute.allergens or [],
            "estimated_cost": substitute.estimated_cost or 0,
            "instructions": substitute.instructions or [],
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] get_meal_substitute menu_id={menu_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


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
