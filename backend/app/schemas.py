from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date
from .models import MealTypeEnum

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    message: str
    has_preferences: bool
    user: UserResponse

# --- Preference Schemas ---
class PreferenceBase(BaseModel):
    goal: str
    weekly_budget: float
    dietary_restrictions: List[str]
    notif_reminders: bool
    email_list: bool

class PreferenceCreate(PreferenceBase):
    pass

class PreferenceResponse(PreferenceBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# --- MealPlan Schemas ---
class MealPlanBase(BaseModel):
    date: date
    meal_type: MealTypeEnum
    recipe_name: str
    calories: int
    protein: int
    carbs: int
    fat: int
    is_cleared: bool = False

class MealPlanCreate(MealPlanBase):
    pass

class MealPlanResponse(MealPlanBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class MealGenerateRequest(BaseModel):
    start_date: date
    end_date: date

# --- GroceryItem Schemas ---
class GroceryItemBase(BaseModel):
    name: str
    qty: str
    category: str
    is_checked: bool = False

class GroceryItemCreate(GroceryItemBase):
    pass

class GroceryItemResponse(GroceryItemBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# --- Recipe Schemas ---
class RecipeBase(BaseModel):
    name: str
    meal_type: MealTypeEnum
    prep_time: int
    calories: int
    protein: int
    carbs: int
    fat: int
    ingredients: List[str]
    instructions: List[str]
    is_published: bool = False
    image_url: Optional[str] = None

class RecipeCreate(RecipeBase):
    pass

class RecipeUpdate(RecipeBase):
    name: Optional[str] = None
    meal_type: Optional[MealTypeEnum] = None
    prep_time: Optional[int] = None
    calories: Optional[int] = None
    protein: Optional[int] = None
    carbs: Optional[int] = None
    fat: Optional[int] = None
    ingredients: Optional[List[str]] = None
    instructions: Optional[List[str]] = None
    is_published: Optional[bool] = None

class RecipeResponse(RecipeBase):
    id: int

    class Config:
        from_attributes = True