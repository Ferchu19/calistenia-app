from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth import decode_token
from app.models.user import User
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import Column, Integer, String, Text, Numeric, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy import DateTime
from app.database import Base

# Modelo SQLAlchemy
class Profile(Base):
    __tablename__ = "profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    full_name = Column(String(100))
    username = Column(String(50), unique=True)
    bio = Column(Text)
    avatar_url = Column(Text)
    weight_kg = Column(Numeric(5, 2))
    height_cm = Column(Numeric(5, 2))
    experience_level = Column(String(20), default="beginner")
    created_at = Column(DateTime, server_default=func.now())

# Schemas
class ProfileCreate(BaseModel):
    full_name: str
    username: str
    bio: Optional[str] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    experience_level: str = "beginner"

class ProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    username: str
    bio: Optional[str]
    weight_kg: Optional[float]
    height_cm: Optional[float]
    experience_level: str

    class Config:
        from_attributes = True

router = APIRouter(prefix="/profiles", tags=["Perfiles"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido")
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

@router.post("/", response_model=ProfileResponse, status_code=201)
def create_profile(data: ProfileCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya tenés un perfil creado")

    username_taken = db.query(Profile).filter(Profile.username == data.username).first()
    if username_taken:
        raise HTTPException(status_code=400, detail="Ese username ya está en uso")

    profile = Profile(user_id=current_user.id, **data.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

@router.get("/me", response_model=ProfileResponse)
def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    return profile

@router.put("/me", response_model=ProfileResponse)
def update_profile(data: ProfileCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")

    for key, value in data.model_dump().items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return profile

@router.get("/{username}", response_model=ProfileResponse)
def get_profile_by_username(username: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.username == username).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    
    # Solo el propio usuario o un coach puede ver el perfil
    if profile.user_id != current_user.id and current_user.role not in ["coach", "admin"]:
        raise HTTPException(status_code=403, detail="No tenés acceso a este perfil")
    
    return profile