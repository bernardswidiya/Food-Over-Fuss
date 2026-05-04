from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta
from app.models import MealPlan, DailyMenu, User, Recipe
from app.schemas import MealPlanResponse, MealGenerateRequest, DailyMenuResponse
from app.api.dependencies import get_db, get_current_user
import random

router = APIRouter()

DAYS_ID = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]
MEAL_TYPES = ["sarapan", "siang", "malam"]

@router.get("/", response_model=List[DailyMenuResponse])
def get_meals(start_date: date, end_date: date, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all daily menus for the current user within date range."""
    menus = db.query(DailyMenu).join(MealPlan).filter(
        MealPlan.user_id == current_user.id,
        DailyMenu.date >= start_date,
        DailyMenu.date <= end_date,
        DailyMenu.is_cleared == False
    ).order_by(DailyMenu.date, DailyMenu.meal_type).all()
    return menus

@router.post("/generate-week", response_model=MealPlanResponse)
def generate_weekly_meals(req: MealGenerateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Generate meal plan for a date range using published recipes."""
    
    # 1. Delete existing meal plans that overlap with this range
    existing_plans = db.query(MealPlan).filter(
        MealPlan.user_id == current_user.id,
        MealPlan.start_date <= req.end_date,
        MealPlan.end_date >= req.start_date
    ).all()
    for plan in existing_plans:
        db.delete(plan)
    db.flush()
    
    # 2. Fetch published recipes
    published_recipes = db.query(Recipe).filter(Recipe.is_published == True).all()
    
    if not published_recipes:
        raise HTTPException(
            status_code=400,
            detail="Belum ada resep yang di-publish oleh Admin. Hubungi Admin untuk menambahkan resep."
        )
    
    # Group recipes by meal_type
    recipes_by_type = {"sarapan": [], "siang": [], "malam": []}
    for r in published_recipes:
        if r.meal_type.value in recipes_by_type:
            recipes_by_type[r.meal_type.value].append(r)
    
    # Fallback: if a meal type has no recipes, use all recipes
    for mt in MEAL_TYPES:
        if not recipes_by_type[mt]:
            recipes_by_type[mt] = published_recipes
    
    # 3. Create meal plan
    meal_plan = MealPlan(
        user_id=current_user.id,
        start_date=req.start_date,
        end_date=req.end_date
    )
    db.add(meal_plan)
    db.flush()
    
    # 4. Generate daily menus
    num_days = (req.end_date - req.start_date).days + 1
    for day_offset in range(num_days):
        current_date = req.start_date + timedelta(days=day_offset)
        
        for meal_type in MEAL_TYPES:
            recipe = random.choice(recipes_by_type[meal_type])
            
            # Build ingredients string from recipe
            ingredients_str = "\n".join(recipe.ingredients) if recipe.ingredients else ""
            
            menu = DailyMenu(
                meal_plan_id=meal_plan.id,
                date=current_date,
                meal_type=meal_type,
                recipe_name=recipe.name,
                calories=recipe.calories,
                protein=recipe.protein,
                carbs=recipe.carbs,
                fat=recipe.fat,
                ingredients=ingredients_str,
                recipe_id=recipe.id,
                is_cleared=False
            )
            db.add(menu)
    
    db.commit()
    db.refresh(meal_plan)
    return meal_plan

@router.put("/{menu_id}/regenerate", response_model=DailyMenuResponse)
def regenerate_meal(menu_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Regenerate a single meal slot with a different recipe."""
    menu = db.query(DailyMenu).join(MealPlan).filter(
        DailyMenu.id == menu_id,
        MealPlan.user_id == current_user.id
    ).first()
    if not menu:
        raise HTTPException(status_code=404, detail="Menu not found")
    
    # Find alternative recipe
    published = db.query(Recipe).filter(
        Recipe.is_published == True,
        Recipe.meal_type == menu.meal_type
    ).all()
    
    if not published:
        published = db.query(Recipe).filter(Recipe.is_published == True).all()
    
    if not published:
        raise HTTPException(status_code=400, detail="Tidak ada resep alternatif")
    
    # Try to pick a different recipe
    alternatives = [r for r in published if r.id != menu.recipe_id]
    recipe = random.choice(alternatives) if alternatives else random.choice(published)
    
    menu.recipe_name = recipe.name
    menu.calories = recipe.calories
    menu.protein = recipe.protein
    menu.carbs = recipe.carbs
    menu.fat = recipe.fat
    menu.ingredients = "\n".join(recipe.ingredients) if recipe.ingredients else ""
    menu.recipe_id = recipe.id
    menu.is_cleared = False
    
    db.commit()
    db.refresh(menu)
    return menu

@router.delete("/{menu_id}")
def clear_meal(menu_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Clear (soft-delete) a single meal slot."""
    menu = db.query(DailyMenu).join(MealPlan).filter(
        DailyMenu.id == menu_id,
        MealPlan.user_id == current_user.id
    ).first()
    if not menu:
        raise HTTPException(status_code=404, detail="Menu not found")
    
    menu.is_cleared = True
    db.commit()
    return {"message": "Menu cleared successfully"}
