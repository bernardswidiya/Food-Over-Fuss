import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date
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
    menus = db.query(DailyMenu).join(MealPlan).filter(
        MealPlan.user_id == current_user.id,
        DailyMenu.date >= start_date,
        DailyMenu.date <= end_date,
        DailyMenu.is_cleared == False
    ).order_by(DailyMenu.date).all()

    # key: (name_lower, unit_lower) → {name, qty_total, unit, sources}
    ingredient_map: dict[tuple, dict] = {}

    for menu in menus:
        if not menu.ingredients:
            continue

        day_name = DAYS_ID.get(menu.date.weekday(), str(menu.date))
        source_label = f"{day_name} - {menu.meal_type.capitalize()}"

        structured_items = None
        try:
            parsed = json.loads(menu.ingredients)
            if isinstance(parsed, list) and parsed and isinstance(parsed[0], dict):
                structured_items = parsed
        except (json.JSONDecodeError, TypeError, IndexError):
            pass

        if structured_items is not None:
            for item in structured_items:
                name = str(item.get("name", "")).strip()
                unit = str(item.get("unit", "")).strip()
                try:
                    qty = float(item.get("qty", 0))
                except (TypeError, ValueError):
                    qty = 0.0
                if not name:
                    continue
                key = (name.lower(), unit.lower())
                if key not in ingredient_map:
                    ingredient_map[key] = {"name": name, "qty_total": 0.0, "unit": unit, "sources": []}
                ingredient_map[key]["qty_total"] += qty
                if source_label not in ingredient_map[key]["sources"]:
                    ingredient_map[key]["sources"].append(source_label)
        else:
            # Legacy: newline-separated plain strings
            lines = menu.ingredients.split("\n") if "\n" in menu.ingredients else json.loads(menu.ingredients) if menu.ingredients.startswith("[") else [menu.ingredients]
            for line in lines:
                line = str(line).strip()
                if not line:
                    continue
                key = (line.lower(), "")
                if key not in ingredient_map:
                    ingredient_map[key] = {"name": line, "qty_total": 0.0, "unit": "", "sources": []}
                ingredient_map[key]["qty_total"] += 1.0
                if source_label not in ingredient_map[key]["sources"]:
                    ingredient_map[key]["sources"].append(source_label)

    result_with_qty: list[tuple[float, AggregatedGroceryItem]] = []
    for data in ingredient_map.values():
        unit = data["unit"]
        qty_total = data["qty_total"]
        if unit.lower() == "secukupnya":
            qty_str = "secukupnya"
        elif unit:
            qty_fmt: int | float = int(qty_total) if qty_total == int(qty_total) else qty_total
            qty_str = f"{qty_fmt} {unit}"
        else:
            qty_str = f"{int(qty_total)}x" if qty_total != 1 else "1x"

        result_with_qty.append((qty_total, AggregatedGroceryItem(
            name=data["name"],
            qty=qty_str,
            source_meals=data["sources"],
        )))

    if sort_by == "quantity_desc":
        result_with_qty.sort(key=lambda x: x[0], reverse=True)
    elif sort_by == "date_asc":
        result_with_qty.sort(key=lambda x: x[1].source_meals[0] if x[1].source_meals else "")

    return [item for _, item in result_with_qty]

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
