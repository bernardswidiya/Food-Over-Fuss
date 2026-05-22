from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, Boolean, Date, DateTime, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from .database import Base

class MealTypeEnum(str, enum.Enum):
    sarapan = "sarapan"
    siang = "siang"
    malam = "malam"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    supabase_id = Column(String, unique=True, nullable=True, index=True)
    hashed_password = Column(String, nullable=True)
    auth_provider = Column(String, default="local")
    profile_picture = Column(String, nullable=True)
    role = Column(String, default="user")  # "user" or "admin"
    reset_token = Column(String, index=True, nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)

    preference = relationship("Preference", back_populates="owner", uselist=False, cascade="all, delete-orphan")
    meal_plans = relationship("MealPlan", back_populates="owner", cascade="all, delete-orphan")
    grocery_items = relationship("GroceryItem", back_populates="owner", cascade="all, delete-orphan")
    recipe_interactions = relationship("UserRecipeInteraction", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class Preference(Base):
    __tablename__ = "preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    diet_goal = Column(String)
    daily_budget = Column(Float)
    allergies = Column(String, nullable=True)

    owner = relationship("User", back_populates="preference")

class MealPlan(Base):
    __tablename__ = "meal_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    start_date = Column(Date)
    end_date = Column(Date)

    owner = relationship("User", back_populates="meal_plans")
    daily_menus = relationship("DailyMenu", back_populates="meal_plan", cascade="all, delete-orphan")

class DailyMenu(Base):
    __tablename__ = "daily_menus"

    id = Column(Integer, primary_key=True, index=True)
    meal_plan_id = Column(Integer, ForeignKey("meal_plans.id"))
    date = Column(Date)
    meal_type = Column(String)  # "sarapan", "siang", "malam"
    recipe_name = Column(String)
    calories = Column(Integer, default=0)
    protein = Column(Integer, default=0)
    carbs = Column(Integer, default=0)
    fat = Column(Integer, default=0)
    ingredients = Column(Text, nullable=True)  # newline-separated: "2 butir Telur\n100g Bayam"
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=True)
    is_cleared = Column(Boolean, default=False)

    meal_plan = relationship("MealPlan", back_populates="daily_menus")
    recipe = relationship("Recipe")

class GroceryItem(Base):
    __tablename__ = "grocery_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    name = Column(String)
    qty = Column(String)
    category = Column(String)
    is_checked = Column(Boolean, default=False)

    owner = relationship("User", back_populates="grocery_items")

class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    meal_type = Column(SQLEnum(MealTypeEnum))
    prep_time = Column(Integer)
    calories = Column(Integer)
    protein = Column(Integer)
    carbs = Column(Integer)
    fat = Column(Integer)
    ingredients = Column(JSON, default=list)
    instructions = Column(JSON, default=list)
    is_published = Column(Boolean, default=False)
    image_url = Column(String, nullable=True)
    allergens = Column(JSON, default=list)
    estimated_cost = Column(Integer, default=0)

class UserRecipeInteraction(Base):
    __tablename__ = "user_recipe_interactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), index=True)
    affinity_score = Column(Float, default=1.0)
    penalty_count = Column(Integer, default=0)
    last_penalized_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="recipe_interactions")
    recipe = relationship("Recipe")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="notifications")