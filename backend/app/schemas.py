from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import date, datetime
from .models import MealTypeEnum

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: str = "user"
    profile_picture: Optional[str] = None

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    message: str
    has_preferences: bool
    role: str
    user: UserResponse

# --- Preference Schemas ---
class PreferenceBase(BaseModel):
    diet_goal: str
    daily_budget: float
    allergies: Optional[str] = None

class PreferenceCreate(PreferenceBase):
    pass

class PreferenceResponse(PreferenceBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# --- DailyMenu Schemas ---
class DailyMenuBase(BaseModel):
    date: date
    meal_type: str
    recipe_name: str
    calories: int = 0
    protein: int = 0
    carbs: int = 0
    fat: int = 0
    ingredients: Optional[str] = None
    recipe_id: Optional[int] = None
    is_cleared: bool = False

class DailyMenuResponse(DailyMenuBase):
    id: int
    meal_plan_id: int
    image_url: Optional[str] = None

    class Config:
        from_attributes = True

# --- MealPlan Schemas ---
class MealPlanBase(BaseModel):
    start_date: date
    end_date: date

class MealPlanCreate(MealPlanBase):
    pass

class MealPlanResponse(MealPlanBase):
    id: int
    user_id: int
    daily_menus: List[DailyMenuResponse] = []

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

# --- Aggregated Grocery (computed, not from DB) ---
class AggregatedGroceryItem(BaseModel):
    name: str
    qty: str
    source_meals: List[str] = []  # e.g. ["Senin - Sarapan", "Rabu - Malam"]

# --- Recipe Schemas ---
class IngredientItem(BaseModel):
    name: str
    qty: float
    unit: str

class RecipeBase(BaseModel):
    name: str
    meal_type: MealTypeEnum
    prep_time: int
    calories: int
    protein: int
    carbs: int
    fat: int
    ingredients: List[IngredientItem]
    instructions: List[str]
    is_published: bool = False
    image_url: Optional[str] = None
    allergens: List[str] = []
    estimated_cost: int = 0

    @field_validator("ingredients", mode="before")
    @classmethod
    def coerce_ingredients(cls, v: object) -> object:
        if v is None:
            return []
        if isinstance(v, list):
            return [
                {"name": item, "qty": 0, "unit": ""} if isinstance(item, str) else item
                for item in v
            ]
        return v

    @field_validator("allergens", mode="before")
    @classmethod
    def coerce_allergens(cls, v: object) -> object:
        if v is None:
            return []
        return v

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
    ingredients: Optional[List[IngredientItem]] = None
    instructions: Optional[List[str]] = None
    is_published: Optional[bool] = None
    allergens: Optional[List[str]] = None
    estimated_cost: Optional[int] = None

class RecipeResponse(RecipeBase):
    id: int

    class Config:
        from_attributes = True

# --- Admin Schemas ---
class UserRoleUpdate(BaseModel):
    role: str

# --- Chat Schemas ---
class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    image_url: Optional[str] = None  # base64 data URL for vision

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class ChatResponse(BaseModel):
    message: str

# --- AI / Feedback Schemas ---
class RecipeFeedbackRequest(BaseModel):
    recipe_id: int
    feedback_type: str  # "regenerate" or "delete"

class DetectedIngredient(BaseModel):
    name: str
    confidence: float

class DetectIngredientsResponse(BaseModel):
    ingredients: List[DetectedIngredient]
    suggested_recipes: List[str] = []

# --- Password Reset Schemas ---
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# --- Notification Schemas ---
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True