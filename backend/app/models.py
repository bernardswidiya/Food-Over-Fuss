from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, Date
from sqlalchemy.orm import relationship
from .database import Base

# Tabel 1: Data Autentikasi Pengguna
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    preference = relationship("Preference", back_populates="owner", uselist=False)
    meal_plans = relationship("MealPlan", back_populates="owner")

# Tabel 2: Batasan Diet (Input dari Form Onboarding)
class Preference(Base):
    __tablename__ = "preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    daily_budget = Column(Float, nullable=True)
    allergies = Column(String, nullable=True) 
    diet_goal = Column(String, nullable=True) 

    owner = relationship("User", back_populates="preference")

# Tabel 3: Jadwal Menu Mingguan
class MealPlan(Base):
    __tablename__ = "meal_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    start_date = Column(Date)
    end_date = Column(Date)

    owner = relationship("User", back_populates="meal_plans")
    daily_menus = relationship("DailyMenu", back_populates="meal_plan", cascade="all, delete-orphan")
    grocery_list = relationship("GroceryList", back_populates="meal_plan", uselist=False, cascade="all, delete-orphan")

# Tabel 4: Detail Menu per Waktu Makan
class DailyMenu(Base):
    __tablename__ = "daily_menus"

    id = Column(Integer, primary_key=True, index=True)
    meal_plan_id = Column(Integer, ForeignKey("meal_plans.id"))
    
    day_name = Column(String)
    meal_type = Column(String) 
    recipe_name = Column(String)
    calories = Column(Integer)
    ingredients = Column(Text)

    meal_plan = relationship("MealPlan", back_populates="daily_menus")

# Tabel 5: Daftar Belanja Rekapitulasi
class GroceryList(Base):
    __tablename__ = "grocery_lists"

    id = Column(Integer, primary_key=True, index=True)
    meal_plan_id = Column(Integer, ForeignKey("meal_plans.id"), unique=True)
    
    compiled_ingredients = Column(Text) 
    status = Column(String, default="Pending") 

    meal_plan = relationship("MealPlan", back_populates="grocery_list")