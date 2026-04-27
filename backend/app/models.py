from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, Date, Enum as SQLEnum, JSON
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
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    first_name = Column(String)
    last_name = Column(String)

    preference = relationship("Preference", back_populates="owner", uselist=False, cascade="all, delete-orphan")
    meal_plans = relationship("MealPlan", back_populates="owner", cascade="all, delete-orphan")
    grocery_items = relationship("GroceryItem", back_populates="owner", cascade="all, delete-orphan")

class Preference(Base):
    __tablename__ = "preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    goal = Column(String)
    weekly_budget = Column(Float)
    dietary_restrictions = Column(JSON, default=list)
    notif_reminders = Column(Boolean, default=True)
    email_list = Column(Boolean, default=False)

    owner = relationship("User", back_populates="preference")

class MealPlan(Base):
    __tablename__ = "meal_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    date = Column(Date)
    meal_type = Column(SQLEnum(MealTypeEnum))
    recipe_name = Column(String)
    calories = Column(Integer)
    protein = Column(Integer)
    carbs = Column(Integer)
    fat = Column(Integer)
    is_cleared = Column(Boolean, default=False)

    owner = relationship("User", back_populates="meal_plans")

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