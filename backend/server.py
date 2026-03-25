from fastapi import FastAPI, APIRouter, HTTPException, Cookie, Response, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime

class SessionData(BaseModel):
    user_id: str
    session_token: str
    expires_at: datetime

class SessionRequest(BaseModel):
    session_id: str

class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    project_id: str
    student_id: str
    student_name: str
    student_email: str
    title: str
    description: str
    images: List[str] = []
    demo_link: Optional[str] = None
    github_link: Optional[str] = None
    tech_stack: List[str] = []
    slug: str
    views: int = 0
    created_at: datetime
    updated_at: datetime

class ProjectCreate(BaseModel):
    title: str
    description: str
    images: List[str] = []
    demo_link: Optional[str] = None
    github_link: Optional[str] = None
    tech_stack: List[str] = []

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    images: Optional[List[str]] = None
    demo_link: Optional[str] = None
    github_link: Optional[str] = None
    tech_stack: Optional[List[str]] = None

class Inquiry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    inquiry_id: str
    name: str
    email: str
    phone: Optional[str] = None
    course_interest: Optional[str] = None
    message: Optional[str] = None
    created_at: datetime

class InquiryCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    course_interest: Optional[str] = None
    message: Optional[str] = None

class DashboardStats(BaseModel):
    total_projects: int
    total_views: int

def create_slug(title: str) -> str:
    """Create URL-friendly slug from title"""
    slug = title.lower().replace(' ', '-')
    slug = ''.join(c for c in slug if c.isalnum() or c == '-')
    return slug[:50]

async def get_current_user(request: Request, session_token: Optional[str] = Cookie(None)) -> User:
    """Get current user from session token (cookie or header)"""
    if not session_token:
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            session_token = auth_header.replace('Bearer ', '')
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        await db.user_sessions.delete_one({"session_token": session_token})
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

@api_router.post("/auth/session")
async def create_session(request: SessionRequest, response: Response):
    """Exchange session_id for session_token"""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": request.session_id},
                timeout=10.0
            )
            
            if resp.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session_id")
            
            data = resp.json()
            email = data.get("email")
            name = data.get("name")
            picture = data.get("picture")
            session_token = data.get("session_token")
            
            if not email or not session_token:
                raise HTTPException(status_code=400, detail="Invalid response from auth service")
            
            existing_user = await db.users.find_one({"email": email}, {"_id": 0})
            
            if existing_user:
                user_id = existing_user["user_id"]
                await db.users.update_one(
                    {"user_id": user_id},
                    {"$set": {"name": name, "picture": picture}}
                )
            else:
                user_id = f"user_{uuid.uuid4().hex[:12]}"
                user_doc = {
                    "user_id": user_id,
                    "email": email,
                    "name": name,
                    "picture": picture,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.users.insert_one(user_doc)
            
            await db.user_sessions.delete_many({"user_id": user_id})
            
            session_doc = {
                "user_id": user_id,
                "session_token": session_token,
                "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.user_sessions.insert_one(session_doc)
            
            response.set_cookie(
                key="session_token",
                value=session_token,
                httponly=True,
                secure=True,
                samesite="none",
                max_age=7 * 24 * 60 * 60,
                path="/"
            )
            
            user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
            if isinstance(user['created_at'], str):
                user['created_at'] = datetime.fromisoformat(user['created_at'])
            
            return {"user": User(**user).model_dump(mode='json'), "session_token": session_token}
    
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Auth service error: {str(e)}")

@api_router.get("/auth/me")
async def get_me(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get current user info"""
    user = await get_current_user(request, session_token)
    return user.model_dump(mode='json')

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response, session_token: Optional[str] = Cookie(None)):
    """Logout user"""
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie("session_token", path="/", samesite="none", secure=True)
    return {"message": "Logged out successfully"}

@api_router.get("/projects", response_model=List[Project])
async def get_all_projects(limit: int = 50):
    """Get all projects (public)"""
    projects = await db.projects.find({}, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(length=limit)
    
    for project in projects:
        if isinstance(project.get('created_at'), str):
            project['created_at'] = datetime.fromisoformat(project['created_at'])
        if isinstance(project.get('updated_at'), str):
            project['updated_at'] = datetime.fromisoformat(project['updated_at'])
    
    return projects

@api_router.post("/projects", response_model=Project, status_code=201)
async def create_project(project_data: ProjectCreate, request: Request, session_token: Optional[str] = Cookie(None)):
    """Create new project (protected)"""
    user = await get_current_user(request, session_token)
    
    project_id = f"proj_{uuid.uuid4().hex[:12]}"
    slug = create_slug(project_data.title)
    
    existing_slug = await db.projects.find_one({"slug": slug})
    if existing_slug:
        slug = f"{slug}-{uuid.uuid4().hex[:6]}"
    
    now = datetime.now(timezone.utc)
    project_doc = {
        "project_id": project_id,
        "student_id": user.user_id,
        "student_name": user.name,
        "student_email": user.email,
        "title": project_data.title,
        "description": project_data.description,
        "images": project_data.images,
        "demo_link": project_data.demo_link,
        "github_link": project_data.github_link,
        "tech_stack": project_data.tech_stack,
        "slug": slug,
        "views": 0,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    
    await db.projects.insert_one(project_doc)
    
    project_doc['created_at'] = now
    project_doc['updated_at'] = now
    
    return Project(**project_doc)

@api_router.get("/projects/{slug}", response_model=Project)
async def get_project(slug: str):
    """Get single project by slug (public)"""
    project = await db.projects.find_one({"slug": slug}, {"_id": 0})
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    await db.projects.update_one(
        {"slug": slug},
        {"$inc": {"views": 1}}
    )
    
    project['views'] = project.get('views', 0) + 1
    
    if isinstance(project.get('created_at'), str):
        project['created_at'] = datetime.fromisoformat(project['created_at'])
    if isinstance(project.get('updated_at'), str):
        project['updated_at'] = datetime.fromisoformat(project['updated_at'])
    
    return Project(**project)

@api_router.put("/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, project_data: ProjectUpdate, request: Request, session_token: Optional[str] = Cookie(None)):
    """Update project (protected)"""
    user = await get_current_user(request, session_token)
    
    project = await db.projects.find_one({"project_id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project["student_id"] != user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = {k: v for k, v in project_data.model_dump().items() if v is not None}
    
    if "title" in update_data:
        update_data["slug"] = create_slug(update_data["title"])
        existing_slug = await db.projects.find_one({
            "slug": update_data["slug"],
            "project_id": {"$ne": project_id}
        })
        if existing_slug:
            update_data["slug"] = f"{update_data['slug']}-{uuid.uuid4().hex[:6]}"
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.projects.update_one(
        {"project_id": project_id},
        {"$set": update_data}
    )
    
    updated_project = await db.projects.find_one({"project_id": project_id}, {"_id": 0})
    
    if isinstance(updated_project.get('created_at'), str):
        updated_project['created_at'] = datetime.fromisoformat(updated_project['created_at'])
    if isinstance(updated_project.get('updated_at'), str):
        updated_project['updated_at'] = datetime.fromisoformat(updated_project['updated_at'])
    
    return Project(**updated_project)

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, request: Request, session_token: Optional[str] = Cookie(None)):
    """Delete project (protected)"""
    user = await get_current_user(request, session_token)
    
    project = await db.projects.find_one({"project_id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project["student_id"] != user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.projects.delete_one({"project_id": project_id})
    
    return {"message": "Project deleted successfully"}

@api_router.get("/student/{student_name}")
async def get_student_profile(student_name: str):
    """Get student profile with their projects (public)"""
    student_name_normalized = student_name.lower().replace('-', ' ')
    
    user = await db.users.find_one(
        {"name": {"$regex": f"^{student_name_normalized}$", "$options": "i"}},
        {"_id": 0}
    )
    
    if not user:
        raise HTTPException(status_code=404, detail="Student not found")
    
    projects = await db.projects.find(
        {"student_id": user["user_id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(length=100)
    
    for project in projects:
        if isinstance(project.get('created_at'), str):
            project['created_at'] = datetime.fromisoformat(project['created_at'])
        if isinstance(project.get('updated_at'), str):
            project['updated_at'] = datetime.fromisoformat(project['updated_at'])
    
    if isinstance(user.get('created_at'), str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    return {
        "student": User(**user).model_dump(mode='json'),
        "projects": [Project(**p).model_dump(mode='json') for p in projects]
    }

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get student dashboard stats (protected)"""
    user = await get_current_user(request, session_token)
    
    total_projects = await db.projects.count_documents({"student_id": user.user_id})
    
    projects = await db.projects.find(
        {"student_id": user.user_id},
        {"_id": 0, "views": 1}
    ).to_list(length=1000)
    
    total_views = sum(p.get('views', 0) for p in projects)
    
    return {
        "total_projects": total_projects,
        "total_views": total_views
    }

@api_router.get("/dashboard/projects", response_model=List[Project])
async def get_my_projects(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get current user's projects (protected)"""
    user = await get_current_user(request, session_token)
    
    projects = await db.projects.find(
        {"student_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(length=100)
    
    for project in projects:
        if isinstance(project.get('created_at'), str):
            project['created_at'] = datetime.fromisoformat(project['created_at'])
        if isinstance(project.get('updated_at'), str):
            project['updated_at'] = datetime.fromisoformat(project['updated_at'])
    
    return projects

@api_router.post("/inquiry", response_model=Inquiry, status_code=201)
async def submit_inquiry(inquiry_data: InquiryCreate):
    """Submit inquiry form (public)"""
    inquiry_id = f"inq_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    
    inquiry_doc = {
        "inquiry_id": inquiry_id,
        "name": inquiry_data.name,
        "email": inquiry_data.email,
        "phone": inquiry_data.phone,
        "course_interest": inquiry_data.course_interest,
        "message": inquiry_data.message,
        "created_at": now.isoformat()
    }
    
    await db.inquiries.insert_one(inquiry_doc)
    
    inquiry_doc['created_at'] = now
    
    return Inquiry(**inquiry_doc)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()