from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List

from app.models import Recipe, User, MealPlan, DailyMenu, UserRecipeInteraction
from app.schemas import RecipeCreate, RecipeUpdate, RecipeResponse, UserRoleUpdate
from app.api.dependencies import get_db, get_admin_user
from app.utils.storage import upload_image_to_azure

router = APIRouter()


@router.get("/stats")
def get_admin_stats(
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    total_users = db.query(User).count()
    total_recipes = db.query(Recipe).count()
    total_published_recipes = db.query(Recipe).filter(Recipe.is_published == True).count()
    total_meal_plans = db.query(MealPlan).count()
    return {
        "total_users": total_users,
        "total_recipes": total_recipes,
        "total_published_recipes": total_published_recipes,
        "total_meal_plans": total_meal_plans,
    }


# ── Recipe endpoints ────────────────────────────────────────────────────────

@router.post("/recipes/upload-image")
async def upload_recipe_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    image_url = upload_image_to_azure(file, subfolder="recipes")
    return {"image_url": image_url}


@router.get("/recipes", response_model=List[RecipeResponse])
def get_recipes(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    return db.query(Recipe).offset(skip).limit(limit).all()


@router.post("/recipes", response_model=RecipeResponse)
def create_recipe(
    recipe: RecipeCreate,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
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
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
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
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    db_recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not db_recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    # Null-kan recipe_id di semua DailyMenu yang masih referensi resep ini.
    # Data nama/makro di DailyMenu tetap aman karena sudah di-copy saat generate.
    db.query(DailyMenu).filter(DailyMenu.recipe_id == recipe_id).update(
        {"recipe_id": None}, synchronize_session=False
    )

    # Hapus semua interaksi preferensi user untuk resep ini.
    db.query(UserRecipeInteraction).filter(
        UserRecipeInteraction.recipe_id == recipe_id
    ).delete(synchronize_session=False)

    db.delete(db_recipe)
    db.commit()
    return {"message": "Recipe deleted successfully"}


# ── User management (Admin only) ────────────────────────────────────────────

@router.get("/users")
def get_users(
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    users = db.query(User).all()
    return [{"id": u.id, "name": u.name, "email": u.email, "role": u.role} for u in users]


@router.patch("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role_update: UserRoleUpdate,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    if role_update.role not in ("user", "admin"):
        raise HTTPException(status_code=400, detail="Role must be 'user' or 'admin'")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = role_update.role
    db.commit()
    return {"message": f"User {user.email} role updated to {role_update.role}"}
