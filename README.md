# Calistenia App

Una aplicación web para registrar y trackear entrenamientos de calistenia. Permite a atletas llevar un seguimiento de sus sesiones, ejercicios y progreso, mientras que los coaches pueden crear y gestionar planes de entrenamiento para su comunidad.

## Por qué hice este proyecto

Mi hermano es entrenador de calistenia y tiene una comunidad de atletas. Necesitaban una herramienta simple para registrar sus entrenamientos y ver su progreso. Aproveché esa necesidad real para construir algo que pueda usar gente de verdad mientras aprendía desarrollo web fullstack.

## Tecnologías

**Backend**
- Python con FastAPI
- PostgreSQL como base de datos
- SQLAlchemy para el manejo de modelos
- JWT para autenticación

**Frontend**
- React con Vite
- Tailwind CSS para los estilos
- Recharts para gráficos
- Configurado como PWA, instalable en Android e iOS

**Infraestructura**
- AWS EC2 para el servidor backend
- AWS RDS para la base de datos en producción
- AWS S3 y CloudFront para el deploy inicial del frontend
- Nginx como reverse proxy
- SSL con Let's Encrypt
- Dominio configurado con DuckDNS

## Funcionalidades

- Registro e inicio de sesión con roles (atleta y coach)
- Dashboard con métricas de sesiones y series totales
- Registro de sesiones de entrenamiento con ejercicios y series
- Catálogo de ejercicios filtrable por categoría
- Perfiles de usuario con datos físicos y nivel de experiencia
- Los coaches pueden agregar ejercicios al catálogo
- Instalable como app en el celular sin pasar por una tienda de aplicaciones

## Cómo correrlo localmente

**Requisitos**
- Python 3.10 o superior
- Node.js 18 o superior
- PostgreSQL

**Backend**

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Crear un archivo `.env` en la carpeta `backend` con estas variables:

```
DATABASE_URL=postgresql://postgres:TU_CONTRASEÑA@localhost:5432/calistenia_db
SECRET_KEY=una_clave_secreta_larga
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

```bash
uvicorn app.main:app --reload
```

La documentación de la API queda disponible en `http://localhost:8000/docs`

**Frontend**

```bash
npm install
npm run dev
```

## Estado del proyecto

Es un MVP funcional con usuarios reales. Hay varias features planeadas para las próximas versiones como progreso de skills, vista del coach para seguir a sus atletas, y notificaciones de entrenamiento.

## Demo

La app está desplegada en `https://calistenia-app.duckdns.org`
