from fastapi import Depends, HTTPException, status, Header, Request
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from app.database import SessionLocal
from app.models import User
import os

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")
ALGORITHM = "HS256"


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    request: Request,
    authorization: str = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    # ── Path 1: Bearer token dari Supabase (Google OAuth) ──────────────────
    if authorization and authorization.startswith("Bearer ") and SUPABASE_JWT_SECRET:
        token = authorization[7:]
        try:
            payload = jwt.decode(
                token,
                SUPABASE_JWT_SECRET,
                algorithms=[ALGORITHM],
                options={"verify_aud": False},
            )
            email: str = payload.get("email", "")
            supabase_id: str = payload.get("sub", "")

            if email:
                user = db.query(User).filter(User.email == email).first()
                if not user:
                    metadata = payload.get("user_metadata") or {}
                    name = metadata.get("full_name") or metadata.get("name") or email.split("@")[0]
                    picture = metadata.get("picture") or metadata.get("avatar_url")
                    user = User(
                        email=email,
                        name=name,
                        supabase_id=supabase_id,
                        auth_provider="google",
                        profile_picture=picture,
                    )
                    db.add(user)
                    db.commit()
                    db.refresh(user)
                elif not user.supabase_id:
                    user.supabase_id = supabase_id
                    db.commit()
                return user
        except JWTError:
            pass  # fall through to cookie auth

    # ── Path 2: HttpOnly Cookie dari login email/password ──────────────────
    token = request.cookies.get("access_token")
    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id:
                user = db.query(User).filter(User.id == int(user_id)).first()
                if user:
                    return user
        except JWTError:
            pass

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")


def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user
