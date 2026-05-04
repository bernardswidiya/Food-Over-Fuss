from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, Boolean, Date, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
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
    hashed_password = Column(String, nullable=True)
    auth_provider = Column(String, default="local")
    profile_picture = Column(String, nullable=True)
    role = Column(String, default="user")  # "user" or "admin"

    preference = relationship("Preference", back_populates="owner", uselist=False, cascade="all, delete-orphan")
    meal_plans = relationship("MealPlan", back_populates="owner", cascade="all, delete-orphan")
    grocery_items = relationship("GroceryItem", back_populates="owner", cascade="all, delete-orphan")

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