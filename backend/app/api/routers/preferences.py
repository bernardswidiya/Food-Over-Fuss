from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Preference, User
from app.schemas import PreferenceCreate, PreferenceResponse
from app.api.dependencies import get_db, get_current_user

router = APIRouter()

@router.get("/", response_model=PreferenceResponse)
def get_preferences(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    preference = db.query(Preference).filter(Preference.user_id == current_user.id).first()
    if not preference:
        raise HTTPException(status_code=404, detail="Preferences not found")
    return preference

@router.put("/", response_model=PreferenceResponse)
def upsert_preferences(pref_in: PreferenceCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    preference = db.query(Preference).filter(Preference.user_id == current_user.id).first()
    
    if preference:
        # Update existing
        for key, value in pref_in.dict().items():
            setattr(preference, key, value)
    else:
        # Create new
        preference = Preference(
            user_id=current_user.id,
            **pref_in.dict()
        )
        db.add(preference)
        
    db.commit()
    db.refresh(preference)
    return preference
