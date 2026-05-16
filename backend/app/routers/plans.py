from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, Date
from sqlalchemy.sql import func
from sqlalchemy import DateTime
from app.database import get_db, Base
from app.services.auth import decode_token
from app.models.user import User
from app.routers.exercises import Exercise
from pydantic import BaseModel
from typing import Optional, List

# Modelos SQLAlchemy
class Plan(Base):
    __tablename__ = "plans"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    difficulty = Column(String(20), default="beginner")
    duration_weeks = Column(Integer)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

class PlanDay(Base):
    __tablename__ = "plan_days"
    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("plans.id"))
    day_number = Column(Integer, nullable=False)
    name = Column(String(100))

class PlanExercise(Base):
    __tablename__ = "plan_exercises"
    id = Column(Integer, primary_key=True, index=True)
    plan_day_id = Column(Integer, ForeignKey("plan_days.id"))
    exercise_id = Column(Integer, ForeignKey("exercises.id"))
    sets = Column(Integer)
    reps = Column(Integer)
    duration_seconds = Column(Integer)
    rest_seconds = Column(Integer, default=60)
    order_index = Column(Integer, default=0)
    notes = Column(Text)

class AthletePlan(Base):
    __tablename__ = "athlete_plans"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    plan_id = Column(Integer, ForeignKey("plans.id"))
    assigned_by = Column(Integer, ForeignKey("users.id"))
    start_date = Column(Date)
    end_date = Column(Date)
    status = Column(String(20), default="active")
    created_at = Column(DateTime, server_default=func.now())

# Schemas
class PlanExerciseCreate(BaseModel):
    exercise_id: int
    sets: Optional[int] = None
    reps: Optional[int] = None
    duration_seconds: Optional[int] = None
    rest_seconds: int = 60
    order_index: int = 0
    notes: Optional[str] = None

class PlanDayCreate(BaseModel):
    day_number: int
    name: Optional[str] = None
    exercises: List[PlanExerciseCreate] = []

class PlanCreate(BaseModel):
    name: str
    description: Optional[str] = None
    difficulty: str = "beginner"
    duration_weeks: Optional[int] = None
    is_public: bool = False
    days: List[PlanDayCreate] = []

class PlanExerciseResponse(BaseModel):
    id: int
    exercise_id: int
    sets: Optional[int]
    reps: Optional[int]
    duration_seconds: Optional[int]
    rest_seconds: int
    order_index: int
    notes: Optional[str]
    class Config:
        from_attributes = True

class PlanDayResponse(BaseModel):
    id: int
    day_number: int
    name: Optional[str]
    exercises: List[PlanExerciseResponse] = []
    class Config:
        from_attributes = True

class PlanResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    difficulty: str
    duration_weeks: Optional[int]
    is_public: bool
    created_by: int
    class Config:
        from_attributes = True

class AssignPlanRequest(BaseModel):
    athlete_user_id: int
    start_date: Optional[str] = None

router = APIRouter(prefix="/plans", tags=["Planes y Rutinas"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido")
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

@router.post("/", response_model=PlanResponse, status_code=201)
def create_plan(data: PlanCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ["coach", "admin"]:
        raise HTTPException(status_code=403, detail="Solo coaches pueden crear planes")

    plan = Plan(
        name=data.name,
        description=data.description,
        difficulty=data.difficulty,
        duration_weeks=data.duration_weeks,
        is_public=data.is_public,
        created_by=current_user.id
    )
    db.add(plan)
    db.flush()

    for day_data in data.days:
        day = PlanDay(plan_id=plan.id, day_number=day_data.day_number, name=day_data.name)
        db.add(day)
        db.flush()

        for ex_data in day_data.exercises:
            plan_ex = PlanExercise(plan_day_id=day.id, **ex_data.model_dump())
            db.add(plan_ex)

    db.commit()
    db.refresh(plan)
    return plan

@router.get("/", response_model=List[PlanResponse])
def get_plans(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role in ["coach", "admin"]:
        return db.query(Plan).filter(Plan.created_by == current_user.id).all()
    return db.query(Plan).join(AthletePlan).filter(AthletePlan.user_id == current_user.id).all()

@router.get("/{plan_id}", response_model=PlanResponse)
def get_plan(plan_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")
    return plan

@router.post("/{plan_id}/assign")
def assign_plan(plan_id: int, data: AssignPlanRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ["coach", "admin"]:
        raise HTTPException(status_code=403, detail="Solo coaches pueden asignar planes")

    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")

    athlete = db.query(User).filter(User.id == data.athlete_user_id).first()
    if not athlete:
        raise HTTPException(status_code=404, detail="Atleta no encontrado")

    assignment = AthletePlan(
        user_id=data.athlete_user_id,
        plan_id=plan_id,
        assigned_by=current_user.id
    )
    db.add(assignment)
    db.commit()
    return {"message": f"Plan asignado correctamente al atleta {data.athlete_user_id}"}