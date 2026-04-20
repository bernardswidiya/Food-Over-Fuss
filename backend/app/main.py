from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, schemas, auth
from .database import engine, SessionLocal
from starlette.middleware.sessions import SessionMiddleware
from starlette.requests import Request
from fastapi.responses import RedirectResponse

app = FastAPI(
    title="Food Over Fuss API",
    description="Backend API untuk AI Menu Planner",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SessionMiddleware, secret_key=auth.SECRET_KEY)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root() -> dict[str, str]:
    return {
        "status": "success",
        "message": "Welcome to Food Over Fuss Backend API!",
    }


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "healthy", "ai_model": "Not loaded yet"}

@app.post("/api/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar!")
    hashed_pw = auth.get_password_hash(user.password)
    new_user = models.User(
        name=user.name, 
        email=user.email, 
        hashed_password=hashed_pw,
        auth_provider="local",
        profile_picture=None
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/login", response_model=schemas.Token)
def login_user(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not db_user.hashed_password:
        raise HTTPException(status_code=401, detail="Email atau Password salah") 
    if not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Email atau Password salah")
    access_token = auth.create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/google")
async def login_via_google(request: Request):
    redirect_uri = request.url_for('auth_google_callback')
    return await auth.oauth.google.authorize_redirect(request, redirect_uri)

@app.get("/auth/google/callback")
async def auth_google_callback(request: Request, db: Session = Depends(get_db)):
    try:
        token = await auth.oauth.google.authorize_access_token(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Google Auth gagal: {str(e)}")
    user_info = token.get('userinfo')
    if not user_info:
        raise HTTPException(status_code=400, detail="Gagal mendapatkan info user dari Google")
    email = user_info.get("email")
    name = user_info.get("name")
    picture = user_info.get("picture")
    db_user = db.query(models.User).filter(models.User.email == email).first()
    if not db_user:
        db_user = models.User(
            name=name,
            email=email,
            hashed_password=None,
            auth_provider="google",
            profile_picture=picture
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    access_token = auth.create_access_token(data={"sub": db_user.email})
    return {
        "message": "Login Google Berhasil!",
        "access_token": access_token, 
        "token_type": "bearer",
        "user_info": {
            "name": db_user.name,
            "email": db_user.email,
            "provider": db_user.auth_provider,
            "profile_picture": db_user.profile_picture
        }
    }

