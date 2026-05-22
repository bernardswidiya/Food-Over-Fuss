from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_user
from app.models import User
from app.schemas import UserResponse
from app.utils.storage import upload_image_to_azure

router = APIRouter()


@router.post("/avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    image_url = upload_image_to_azure(file, subfolder="avatars")

    current_user.profile_picture = image_url
    db.commit()
    db.refresh(current_user)
    return current_user


@router.delete("/avatar", response_model=UserResponse)
def delete_avatar(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Hapus referensi di DB saja; file di Azure tidak dihapus (simplifikasi)
    current_user.profile_picture = None
    db.commit()
    db.refresh(current_user)
    return current_user


@router.delete("/me")
def delete_user_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.delete(current_user)
    db.commit()
    return {"message": "Account successfully deleted"}
