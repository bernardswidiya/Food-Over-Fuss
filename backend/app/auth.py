from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from datetime import datetime, timedelta, timezone
from jose import jwt
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

def verify_password(plain_password, hashed_password):
    """Mengecek apakah password ketikan user cocok dengan di database"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Mengubah password asli menjadi string acak"""
    return pwd_context.hash(password)

def create_access_token(data: dict):
    """Membuat tiket JWT setelah user berhasil login"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

config_data = {
    'GOOGLE_CLIENT_ID': os.getenv("GOOGLE_CLIENT_ID"),
    'GOOGLE_CLIENT_SECRET': os.getenv("GOOGLE_CLIENT_SECRET")
}
starlette_config = Config(environ=config_data)

oauth = OAuth(starlette_config)

oauth.register(
    name='google',
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

# ── JWT Auth Dependency ──
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    """Decode JWT and return the user email (sub claim).
    The actual DB lookup happens in the endpoint to keep this module
    independent of database imports."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token tidak valid atau sudah kedaluwarsa",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str | None = payload.get("sub")
        if email is None:
            raise credentials_exception
        return email
    except JWTError:
        raise credentials_exception