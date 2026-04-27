from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from app.database import SessionLocal
from app.models import Recipe, User
from app.schemas import RecipeCreate, RecipeUpdate, RecipeResponse
from app.api.dependencies import get_db, get_current_user

router = APIRouter()

@router.get("/recipes", response_model=List[RecipeResponse])
def get_recipes(
    skip: int = 0, 
    limit: int = 100, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    recipes = db.query(Recipe).offset(skip).limit(limit).all()
    return recipes

@router.post("/recipes", response_model=RecipeResponse)
def create_recipe(
    recipe: RecipeCreate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    db_recipe = Recipe(**recipe.model_dump())
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    return db_recipe

@router.put("/recipes/{recipe_id}", response_model=RecipeResponse)
def update_recipe(
    recipe_id: int, 
    recipe_update: RecipeUpdate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    db_recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not db_recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    update_data = recipe_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_recipe, key, value)
        
    db.commit()
    db.refresh(db_recipe)
    return db_recipe

@router.delete("/recipes/{recipe_id}")
def delete_recipe(
    recipe_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    db_recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not db_recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
        
    db.delete(db_recipe)
    db.commit()
    return {"message": "Recipe deleted successfully"}
