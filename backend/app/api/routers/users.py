import os
import re
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import cloudinary
import cloudinary.uploader

from app.api.dependencies import get_db, get_current_user
from app.models import User
from app.schemas import UserResponse

router = APIRouter()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

@router.post("/avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a new profile picture to Cloudinary and update the user's database record.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        # Upload to Cloudinary with transformations
        result = cloudinary.uploader.upload(
            file.file,
            folder="food_over_fuss/avatars",
            transformation=[
                {"width": 400, "height": 400, "crop": "fill", "gravity": "face"}
            ]
        )
        
        # Get the URL
        image_url = result.get("secure_url")
        
        # If user already had a Cloudinary avatar, delete the old one to save space
        if current_user.profile_picture and "cloudinary" in current_user.profile_picture and "food_over_fuss" in current_user.profile_picture:
            try:
                # Extract public_id from URL: e.g., .../upload/v1234/food_over_fuss/avatars/filename.jpg
                match = re.search(r'/upload/(?:v\d+/)?(food_over_fuss/avatars/[^.]+)', current_user.profile_picture)
                if match:
                    old_public_id = match.group(1)
                    cloudinary.uploader.destroy(old_public_id)
            except Exception as e:
                print(f"Failed to delete old avatar: {e}")

        # Update database
        current_user.profile_picture = image_url
        db.commit()
        db.refresh(current_user)
        
        return current_user
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

@router.delete("/avatar", response_model=UserResponse)
def delete_avatar(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete the user's profile picture from Cloudinary and the database.
    """
    if not current_user.profile_picture:
        return current_user
        
    if "cloudinary" in current_user.profile_picture and "food_over_fuss" in current_user.profile_picture:
        try:
            # Extract public_id from URL
            match = re.search(r'/upload/(?:v\d+/)?(food_over_fuss/avatars/[^.]+)', current_user.profile_picture)
            if match:
                public_id = match.group(1)
                cloudinary.uploader.destroy(public_id)
        except Exception as e:
            print(f"Failed to delete avatar from Cloudinary: {e}")
            
    # Remove from database
    current_user.profile_picture = None
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.delete("/me")
def delete_user_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete the user's entire account, including profile picture from Cloudinary
    and cascading delete all associated data in the database.
    """
    # Delete profile picture from Cloudinary if exists
    if current_user.profile_picture and "cloudinary" in current_user.profile_picture and "food_over_fuss" in current_user.profile_picture:
        try:
            match = re.search(r'/upload/(?:v\d+/)?(food_over_fuss/avatars/[^.]+)', current_user.profile_picture)
            if match:
                public_id = match.group(1)
                cloudinary.uploader.destroy(public_id)
        except Exception as e:
            print(f"Failed to delete avatar from Cloudinary during account deletion: {e}")
            
    # Delete the user from the database
    # This will cascade and delete Preference, MealPlan, DailyMenu, and GroceryItem
    db.delete(current_user)
    db.commit()
    
    return {"message": "Account successfully deleted"}
