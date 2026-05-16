from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, Date, Numeric
from sqlalchemy.sql import func
from sqlalchemy import DateTime
from app.database import get_db, Base
from app.services.auth import decode_token
from app.models.user import User
from pydantic import BaseModel
from typing import Optional, List

# Modelos SQLAlchemy
class WorkoutSession(Base):
    __tablename__ = "workout_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    plan_day_id = Column(Integer, ForeignKey("plan_days.id"), nullable=True)
    date = Column(Date, server_default=func.current_date())
    duration_minutes = Column(Integer)
    notes = Column(Text)
    rating = Column(Integer)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

class SessionSet(Base):
    __tablename__ = "session_sets"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("workout_sessions.id"))
    exercise_id = Column(Integer, ForeignKey("exercises.id"))
    set_number = Column(Integer)
    reps = Column(Integer)
    duration_seconds = Column(Integer)
    weight_kg = Column(Numeric(5, 2))
    notes = Column(Text)

class PersonalRecord(Base):
    __tablename__ = "personal_records"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    exercise_id = Column(Integer, ForeignKey("exercises.id"))
    value = Column(Numeric(8, 2), nullable=False)
    unit = Column(String(20), nullable=False)
    achieved_at = Column(Date, server_default=func.current_date())
    session_id = Column(Integer, ForeignKey("workout_sessions.id"))

# Schemas
class SessionSetCreate(BaseModel):
    exercise_id: int
    set_number: int
    reps: Optional[int] = None
    duration_seconds: Optional[int] = None
    weight_kg: Optional[float] = None
    notes: Optional[str] = None

class WorkoutSessionCreate(BaseModel):
    plan_day_id: Optional[int] = None
    date: Optional[str] = None
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None
    rating: Optional[int] = None
    sets: List[SessionSetCreate] = []

class SessionSetResponse(BaseModel):
    id: int
    exercise_id: int
    set_number: int
    reps: Optional[int]
    duration_seconds: Optional[int]
    weight_kg: Optional[float]
    notes: Optional[str]
    class Config:
        from_attributes = True

class WorkoutSessionResponse(BaseModel):
    id: int
    user_id: int
    plan_day_id: Optional[int]
    duration_minutes: Optional[int]
    notes: Optional[str]
    rating: Optional[int]
    completed: bool
    sets: List[SessionSetResponse] = []
    class Config:
        from_attributes = True

class PersonalRecordResponse(BaseModel):
    id: int
    exercise_id: int
    value: float
    unit: str
    class Config:
        from_attributes = True

router = APIRouter(prefix="/workouts", tags=["Entrenamientos"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido")
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

@router.post("/", response_model=WorkoutSessionResponse, status_code=201)
def create_session(data: WorkoutSessionCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = WorkoutSession(
        user_id=current_user.id,
        plan_day_id=data.plan_day_id,
        duration_minutes=data.duration_minutes,
        notes=data.notes,
        rating=data.rating,
        completed=True
    )
    db.add(session)
    db.flush()

    for set_data in data.sets:
        s = SessionSet(session_id=session.id, **set_data.model_dump())
        db.add(s)

    db.commit()
    db.refresh(session)

    # Cargar sets manualmente
    session.sets = db.query(SessionSet).filter(SessionSet.session_id == session.id).all()
    return session

@router.get("/", response_model=List[WorkoutSessionResponse])
def get_my_sessions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sessions = db.query(WorkoutSession).filter(WorkoutSession.user_id == current_user.id).order_by(WorkoutSession.created_at.desc()).all()
    for s in sessions:
        s.sets = db.query(SessionSet).filter(SessionSet.session_id == s.id).all()
    return sessions

@router.get("/stats")
def get_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    total_sessions = db.query(WorkoutSession).filter(WorkoutSession.user_id == current_user.id).count()
    total_sets = db.query(SessionSet).join(WorkoutSession).filter(WorkoutSession.user_id == current_user.id).count()
    return {
        "total_sessions": total_sessions,
        "total_sets": total_sets,
        "user_id": current_user.id
    }

@router.get("/records", response_model=List[PersonalRecordResponse])
def get_records(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(PersonalRecord).filter(PersonalRecord.user_id == current_user.id).all()

@router.post("/records", response_model=PersonalRecordResponse, status_code=201)
def create_record(exercise_id: int, value: float, unit: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    record = PersonalRecord(
        user_id=current_user.id,
        exercise_id=exercise_id,
        value=value,
        unit=unit
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record