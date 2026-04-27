from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.database import SessionLocal
from app.models import MealPlan, User, MealTypeEnum
from app.schemas import MealPlanCreate, MealPlanResponse, MealGenerateRequest
from app.api.dependencies import get_db, get_current_user

router = APIRouter()

@router.get("/", response_model=List[MealPlanResponse])
def get_meals(start_date: date, end_date: date, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    meals = db.query(MealPlan).filter(
        MealPlan.user_id == current_user.id,
        MealPlan.date >= start_date,
        MealPlan.date <= end_date
    ).all()
    return meals

@router.post("/generate-week", response_model=List[MealPlanResponse])
def generate_weekly_meals(req: MealGenerateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # AI Dummy Endpoint Logic
    # 1. Hapus jadwal yang ada di rentang ini
    db.query(MealPlan).filter(
        MealPlan.user_id == current_user.id,
        MealPlan.date >= req.start_date,
        MealPlan.date <= req.end_date
    ).delete()
    
    # 2. Generate dummy data
    new_meals = []
    
    # Fetch published recipes to feed AI logic
    from app.models import Recipe
    published_recipes = db.query(Recipe).filter(Recipe.is_published == True).all()
    
    # Untuk dummy, kita buat satu entri sebagai contoh menggunakan resep yang ada jika ada:
    if published_recipes:
        sample_recipe = published_recipes[0]
        dummy_meal = MealPlan(
            user_id=current_user.id,
            date=req.start_date,
            meal_type=sample_recipe.meal_type,
            recipe_name=sample_recipe.name,
            calories=sample_recipe.calories,
            protein=sample_recipe.protein,
            carbs=sample_recipe.carbs,
            fat=sample_recipe.fat
        )
    else:
        dummy_meal = MealPlan(
            user_id=current_user.id,
            date=req.start_date,
            meal_type=MealTypeEnum.sarapan,
            recipe_name="Oatmeal Buah Berry",
            calories=350,
            protein=15,
            carbs=50,
            fat=8
        )
    db.add(dummy_meal)
    new_meals.append(dummy_meal)
    
    db.commit()
    for meal in new_meals:
        db.refresh(meal)
        
    return new_meals

@router.put("/{meal_id}/regenerate", response_model=MealPlanResponse)
def regenerate_meal(meal_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    meal = db.query(MealPlan).filter(MealPlan.id == meal_id, MealPlan.user_id == current_user.id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
        
    # Dummy logic to change the recipe
    meal.recipe_name = "Resep Alternatif Hasil Generate"
    meal.calories += 10
    db.commit()
    db.refresh(meal)
    return meal

@router.delete("/{meal_id}")
def delete_meal(meal_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    meal = db.query(MealPlan).filter(MealPlan.id == meal_id, MealPlan.user_id == current_user.id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
        
    db.delete(meal)
    db.commit()
    return {"message": "Meal deleted successfully"}
