from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, BackgroundTasks
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta, timezone
from starlette.responses import RedirectResponse
import os
import secrets

from app.models import User, Preference
from app.schemas import UserCreate, UserResponse, LoginRequest, LoginResponse, ForgotPasswordRequest, ResetPasswordRequest
from app.api.dependencies import get_db, get_current_user
from app.auth import oauth
from app.utils.email import send_reset_password_email

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# ─────────────────────────────────────────────
# Email/Password Auth
# ─────────────────────────────────────────────

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(
        email=user.email,
        name=user.name,
        hashed_password=hashed_password,
        auth_provider="local",
        role="user"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not user.hashed_password or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False,
    )
    
    has_preferences = db.query(Preference).filter(Preference.user_id == user.id).first() is not None

    return LoginResponse(
        message="Login successful",
        has_preferences=has_preferences,
        role=user.role,
        user=user
    )

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Logout successful"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Return current authenticated user profile."""
    return current_user

# ─────────────────────────────────────────────
# Password Reset
# ─────────────────────────────────────────────

@router.post("/forgot-password")
def forgot_password(
    payload: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == payload.email).first()
    # Always return the same message to prevent user enumeration
    success = {"message": "Jika email terdaftar, link reset telah dikirim ke inbox kamu."}
    if not user:
        return success

    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expires = datetime.now(timezone.utc) + timedelta(minutes=15)
    db.commit()

    background_tasks.add_task(send_reset_password_email, user.email, token)
    return success


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == payload.token).first()
    if not user or user.reset_token_expires is None:
        raise HTTPException(status_code=400, detail="Token tidak valid atau sudah kedaluwarsa.")

    expires = user.reset_token_expires
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if datetime.now(timezone.utc) > expires:
        raise HTTPException(status_code=400, detail="Token sudah kedaluwarsa. Silakan minta link baru.")

    user.hashed_password = get_password_hash(payload.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    return {"message": "Kata sandi berhasil diperbarui. Silakan login."}

# ─────────────────────────────────────────────
# Google OAuth
# ─────────────────────────────────────────────

@router.get("/google")
async def google_login(request: Request):
    """
    Step 1: Redirect user to Google consent screen.
    Frontend calls: window.location.href = API_BASE_URL + '/api/auth/google'
    """
    redirect_uri = str(request.url_for("google_callback"))
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    """
    Step 2: Google redirects back here with auth code.
    We exchange it for user info, create/find user, set cookie, redirect to frontend.
    """
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception:
        return RedirectResponse(
            url=f"{FRONTEND_URL}/auth/callback?error=GoogleAuthFailed"
        )
    
    # Extract user info from the ID token
    user_info = token.get("userinfo")
    if not user_info:
        return RedirectResponse(
            url=f"{FRONTEND_URL}/auth/callback?error=NoUserInfo"
        )
    
    google_email = user_info.get("email")
    google_name = user_info.get("name", "")
    google_picture = user_info.get("picture")
    
    if not google_email:
        return RedirectResponse(
            url=f"{FRONTEND_URL}/auth/callback?error=NoEmail"
        )
    
    # Find or create user
    user = db.query(User).filter(User.email == google_email).first()
    
    if not user:
        # New user — create account
        user = User(
            email=google_email,
            name=google_name,
            hashed_password=None,  # No password for OAuth users
            auth_provider="google",
            profile_picture=google_picture,
            role="user"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Existing user — do not overwrite profile picture to preserve Cloudinary uploads
        if not user.auth_provider or user.auth_provider == "local":
            user.auth_provider = "google"
            db.commit()
    
    # Create JWT and set HttpOnly cookie
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    
    has_preferences = db.query(Preference).filter(Preference.user_id == user.id).first() is not None
    
    # Build redirect URL with routing params (cookie is set via response)
    callback_url = f"{FRONTEND_URL}/auth/callback?has_preferences={str(has_preferences).lower()}&role={user.role}"
    
    response = RedirectResponse(url=callback_url)
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False,
    )
    
    return response
