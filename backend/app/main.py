from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, profiles, exercises, plans, workouts

app = FastAPI(
    title="Calistenia App API",
    description="API para tracking de entrenamiento de calistenia",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(profiles.router)
app.include_router(exercises.router)
app.include_router(plans.router)
app.include_router(workouts.router)

@app.get("/")
def root():
    return {"message": "Calistenia App API funcionando ✓"}

@app.get("/health")
def health():
    return {"status": "ok"}