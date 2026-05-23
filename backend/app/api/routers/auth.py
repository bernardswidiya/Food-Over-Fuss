from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, BackgroundTasks, Header
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
import os
import secrets

from app.models import User, Preference
from app.schemas import UserCreate, UserResponse, LoginRequest, LoginResponse, ForgotPasswordRequest, ResetPasswordRequest
from app.api.dependencies import get_db, get_current_user, _decode_supabase_token
from app.utils.email import send_reset_password_email

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = User(
        email=user.email,
        name=user.name,
        hashed_password=get_password_hash(user.password),
        auth_provider="local",
        role="user",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not user.hashed_password or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email atau password salah")

    token = create_access_token({"sub": str(user.id)})
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=60 * 60 * 24 * 7,
    )
    has_preferences = db.query(Preference).filter(Preference.user_id == user.id).first() is not None
    return LoginResponse(
        message="Login berhasil",
        has_preferences=has_preferences,
        role=user.role,
        user=user,
    )


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out"}


@router.post("/forgot-password")
def forgot_password(
    payload: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == payload.email).first()
    if user and user.auth_provider == "local":
        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expires = datetime.now(timezone.utc) + timedelta(minutes=15)
        db.commit()
        background_tasks.add_task(send_reset_password_email, payload.email, token)
    return {"message": "Jika email terdaftar, link reset password telah dikirim."}


@router.post("/google-session", response_model=LoginResponse)
def google_session(
    response: Response,
    authorization: str = Header(default=None),
    db: Session = Depends(get_db),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")

    token = authorization[7:]
    try:
        payload = _decode_supabase_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Token Supabase tidak valid")

    email: str = payload.get("email", "")
    supabase_id: str = payload.get("sub", "")
    if not email:
        raise HTTPException(status_code=401, detail="Email tidak ditemukan di token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        metadata = payload.get("user_metadata") or {}
        name = metadata.get("full_name") or metadata.get("name") or email.split("@")[0]
        picture = metadata.get("picture") or metadata.get("avatar_url")
        user = User(
            email=email,
            name=name,
            hashed_password=None,
            supabase_id=supabase_id,
            auth_provider="google",
            profile_picture=picture,
            role="user",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        updated = False
        if not user.supabase_id:
            user.supabase_id = supabase_id
            updated = True
        if not user.auth_provider or user.auth_provider == "local":
            user.auth_provider = "google"
            updated = True
        if updated:
            db.commit()

    session_token = create_access_token({"sub": str(user.id)})
    response.set_cookie(
        key="access_token",
        value=session_token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=60 * 60 * 24 * 7,
    )
    has_preferences = db.query(Preference).filter(Preference.user_id == user.id).first() is not None
    return LoginResponse(
        message="Google session created",
        has_preferences=has_preferences,
        role=user.role,
        user=user,
    )


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == payload.token).first()
    if not user or not user.reset_token_expires:
        raise HTTPException(status_code=400, detail="Token tidak valid.")

    expires = user.reset_token_expires
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if datetime.now(timezone.utc) > expires:
        raise HTTPException(status_code=400, detail="Token sudah kadaluarsa.")

    user.hashed_password = get_password_hash(payload.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    return {"message": "Password berhasil diubah."}
