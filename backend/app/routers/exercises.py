from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Text, Boolean
from app.database import get_db, Base
from app.services.auth import decode_token
from app.models.user import User
from pydantic import BaseModel
from typing import Optional, List

# Modelo SQLAlchemy
class Exercise(Base):
    __tablename__ = "exercises"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    difficulty = Column(String(20), default="beginner")
    description = Column(Text)
    video_url = Column(Text)
    is_skill = Column(Boolean, default=False)

# Schemas
class ExerciseCreate(BaseModel):
    name: str
    category: str
    difficulty: str = "beginner"
    description: Optional[str] = None
    video_url: Optional[str] = None
    is_skill: bool = False

class ExerciseResponse(BaseModel):
    id: int
    name: str
    category: str
    difficulty: str
    description: Optional[str]
    video_url: Optional[str]
    is_skill: bool

    class Config:
        from_attributes = True

router = APIRouter(prefix="/exercises", tags=["Ejercicios"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido")
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

@router.get("/", response_model=List[ExerciseResponse])
def get_exercises(category: Optional[str] = None, difficulty: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Exercise)
    if category:
        query = query.filter(Exercise.category == category)
    if difficulty:
        query = query.filter(Exercise.difficulty == difficulty)
    return query.all()

@router.post("/", response_model=ExerciseResponse, status_code=201)
def create_exercise(data: ExerciseCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ["coach", "admin"]:
        raise HTTPException(status_code=403, detail="Solo coaches pueden crear ejercicios")
    exercise = Exercise(**data.model_dump())
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return exercise

@router.get("/{exercise_id}", response_model=ExerciseResponse)
def get_exercise(exercise_id: int, db: Session = Depends(get_db)):
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Ejercicio no encontrado")
    return exercise