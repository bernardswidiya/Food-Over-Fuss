from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from collections import defaultdict
from app.models import MealPlan, DailyMenu, GroceryItem, User
from app.schemas import AggregatedGroceryItem, GroceryItemResponse
from app.api.dependencies import get_db, get_current_user

router = APIRouter()

DAYS_ID = {0: "Senin", 1: "Selasa", 2: "Rabu", 3: "Kamis", 4: "Jumat", 5: "Sabtu", 6: "Minggu"}

@router.get("/", response_model=List[AggregatedGroceryItem])
def get_groceries(
    start_date: date,
    end_date: date,
    sort_by: str = "quantity_desc",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Aggregate ingredients from all daily menus within date range.
    sort_by: 'quantity_desc' (most items first) or 'date_asc' (grouped by date).
    """
    # 1. Get all non-cleared daily menus in range
    menus = db.query(DailyMenu).join(MealPlan).filter(
        MealPlan.user_id == current_user.id,
        DailyMenu.date >= start_date,
        DailyMenu.date <= end_date,
        DailyMenu.is_cleared == False
    ).order_by(DailyMenu.date).all()
    
    # 2. Aggregate ingredients
    ingredient_map: dict[str, dict] = defaultdict(lambda: {"qty_count": 0, "sources": []})
    
    for menu in menus:
        if not menu.ingredients:
            continue
        
        day_name = DAYS_ID.get(menu.date.weekday(), str(menu.date))
        source_label = f"{day_name} - {menu.meal_type.capitalize()}"
        
        # Parse ingredients (newline-separated, format: "qty bahan" or just "bahan")
        for line in menu.ingredients.split("\n"):
            line = line.strip()
            if not line:
                continue
            
            # Try to extract quantity and name
            # Format: "2 butir Telur" or "100g Bayam" or just "Garam"
            ingredient_name = line
            ingredient_map[ingredient_name]["qty_count"] += 1
            if source_label not in ingredient_map[ingredient_name]["sources"]:
                ingredient_map[ingredient_name]["sources"].append(source_label)
    
    # 3. Build result
    result = []
    for name, data in ingredient_map.items():
        qty_str = f"{data['qty_count']}x" if data["qty_count"] > 1 else "1x"
        result.append(AggregatedGroceryItem(
            name=name,
            qty=qty_str,
            source_meals=data["sources"]
        ))
    
    # 4. Sort
    if sort_by == "quantity_desc":
        result.sort(key=lambda x: int(x.qty.replace("x", "")), reverse=True)
    elif sort_by == "date_asc":
        result.sort(key=lambda x: x.source_meals[0] if x.source_meals else "")
    
    return result

@router.put("/{item_id}/toggle", response_model=GroceryItemResponse)
def toggle_grocery_item(item_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Toggle check state of a grocery item."""
    item = db.query(GroceryItem).filter(GroceryItem.id == item_id, GroceryItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Grocery item not found")
        
    item.is_checked = not item.is_checked
    db.commit()
    db.refresh(item)
    return item
