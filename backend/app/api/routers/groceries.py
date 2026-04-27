from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import SessionLocal
from app.models import GroceryItem, User
from app.schemas import GroceryItemCreate, GroceryItemResponse
from app.api.dependencies import get_db, get_current_user

router = APIRouter()

@router.get("/", response_model=List[GroceryItemResponse])
def get_groceries(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(GroceryItem).filter(GroceryItem.user_id == current_user.id).all()
    return items

@router.put("/{item_id}/toggle", response_model=GroceryItemResponse)
def toggle_grocery_item(item_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(GroceryItem).filter(GroceryItem.id == item_id, GroceryItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Grocery item not found")
        
    item.is_checked = not item.is_checked
    db.commit()
    db.refresh(item)
    return item
