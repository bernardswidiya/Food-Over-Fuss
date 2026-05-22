from fastapi import Depends, HTTPException, status, Header, Request
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from app.database import SessionLocal
from app.models import User
import httpx
import os

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
ALGORITHM = "HS256"

_jwks_cache: dict | None = None


def _get_jwks() -> dict | None:
    global _jwks_cache
    if _jwks_cache is not None:
        return _jwks_cache
    if not SUPABASE_URL:
        return None
    try:
        r = httpx.get(f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json", timeout=5)
        _jwks_cache = r.json()
        return _jwks_cache
    except Exception:
        return None


def _decode_supabase_token(token: str) -> dict:
    # Try HS256 with legacy JWT secret
    if SUPABASE_JWT_SECRET:
        try:
            return jwt.decode(
                token, SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
        except JWTError:
            pass

    # Try RS256 via Supabase JWKS
    jwks = _get_jwks()
    if jwks:
        return jwt.decode(
            token, jwks,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )

    raise JWTError("Unable to verify Supabase token")


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
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:]
        try:
            payload = _decode_supabase_token(token)
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
            pass

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
