from fastapi import FastAPI, APIRouter, HTTPException, Cookie, Response, Request, Depends
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials
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
import secrets

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

class StudentRegistration(BaseModel):
    model_config = ConfigDict(extra="ignore")
    registration_id: str
    name: str
    email: str
    phone: str
    course_interest: str
    message: Optional[str] = None
    status: str = "pending"
    created_at: datetime

class StudentRegistrationCreate(BaseModel):
    name: str
    email: str
    phone: str
    course_interest: str
    message: Optional[str] = None

class Course(BaseModel):
    model_config = ConfigDict(extra="ignore")
    course_id: str
    title: str
    category: str
    duration: str
    price: str
    rating: float
    students: int
    image: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class CourseCreate(BaseModel):
    title: str
    category: str
    duration: str
    price: str
    rating: float = 4.5
    students: int = 0
    image: str
    description: Optional[str] = None

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    duration: Optional[str] = None
    price: Optional[str] = None
    rating: Optional[float] = None
    students: Optional[int] = None
    image: Optional[str] = None
    description: Optional[str] = None

class Note(BaseModel):
    model_config = ConfigDict(extra="ignore")
    note_id: str
    title: str
    subject: str
    description: Optional[str] = None
    file_url: str
    file_type: str
    created_at: datetime
    updated_at: datetime

class NoteCreate(BaseModel):
    title: str
    subject: str
    description: Optional[str] = None
    file_url: str
    file_type: str = "pdf"

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    subject: Optional[str] = None
    description: Optional[str] = None
    file_url: Optional[str] = None
    file_type: Optional[str] = None

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminSession(BaseModel):
    admin_token: str
    expires_at: datetime


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

ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'cvi@admin123')

async def get_admin(request: Request, admin_token: Optional[str] = Cookie(None)):
    """Verify admin authentication"""
    if not admin_token:
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            admin_token = auth_header.replace('Bearer ', '')
    
    if not admin_token:
        raise HTTPException(status_code=401, detail="Admin not authenticated")
    
    admin_session = await db.admin_sessions.find_one(
        {"admin_token": admin_token},
        {"_id": 0}
    )
    
    if not admin_session:
        raise HTTPException(status_code=401, detail="Invalid admin session")
    
    expires_at = admin_session["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        await db.admin_sessions.delete_one({"admin_token": admin_token})
        raise HTTPException(status_code=401, detail="Admin session expired")
    
    return True

async def check_student_approved(user_id: str) -> bool:
    """Check if student is approved"""
    approved = await db.approved_students.find_one({"user_id": user_id}, {"_id": 0})
    return approved is not None


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
                is_approved = await check_student_approved(user_id)
                if not is_approved:
                    raise HTTPException(
                        status_code=403, 
                        detail="Your account is pending approval from CVI admin. Please contact the institute."
                    )
                await db.users.update_one(
                    {"user_id": user_id},
                    {"$set": {"name": name, "picture": picture}}
                )
            else:
                raise HTTPException(
                    status_code=403,
                    detail="No account found. Please register first and wait for admin approval."
                )
            
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



@api_router.post("/student/register", status_code=201)
async def register_student(registration_data: StudentRegistrationCreate):
    """Student registration request (public)"""
    existing = await db.student_registrations.find_one({"email": registration_data.email}, {"_id": 0})
    if existing:
        if existing["status"] == "pending":
            raise HTTPException(status_code=400, detail="Registration already submitted. Waiting for admin approval.")
        elif existing["status"] == "approved":
            raise HTTPException(status_code=400, detail="Already registered. Please login.")
    
    registration_id = f"reg_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    
    registration_doc = {
        "registration_id": registration_id,
        "name": registration_data.name,
        "email": registration_data.email,
        "phone": registration_data.phone,
        "course_interest": registration_data.course_interest,
        "message": registration_data.message,
        "status": "pending",
        "created_at": now.isoformat()
    }
    
    await db.student_registrations.insert_one(registration_doc)
    
    return {"message": "Registration submitted successfully. You will be notified once approved by admin."}

@api_router.post("/admin/login")
async def admin_login(login_data: AdminLogin, response: Response):
    """Admin login"""
    if login_data.username != ADMIN_USERNAME or login_data.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    admin_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.admin_sessions.delete_many({})
    
    await db.admin_sessions.insert_one({
        "admin_token": admin_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    response.set_cookie(
        key="admin_token",
        value=admin_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,
        path="/"
    )
    
    return {"message": "Admin logged in successfully", "admin_token": admin_token}

@api_router.post("/admin/logout")
async def admin_logout(response: Response, admin_token: Optional[str] = Cookie(None)):
    """Admin logout"""
    if admin_token:
        await db.admin_sessions.delete_one({"admin_token": admin_token})
    
    response.delete_cookie("admin_token", path="/", samesite="none", secure=True)
    return {"message": "Admin logged out successfully"}

@api_router.get("/admin/pending-students")
async def get_pending_students(request: Request, admin_token: Optional[str] = Cookie(None)):
    """Get all pending student registrations (admin only)"""
    await get_admin(request, admin_token)
    
    registrations = await db.student_registrations.find(
        {"status": "pending"},
        {"_id": 0}
    ).sort("created_at", -1).to_list(length=1000)
    
    for reg in registrations:
        if isinstance(reg.get('created_at'), str):
            reg['created_at'] = datetime.fromisoformat(reg['created_at'])
    
    return registrations

@api_router.post("/admin/approve-student/{registration_id}")
async def approve_student(registration_id: str, request: Request, admin_token: Optional[str] = Cookie(None)):
    """Approve student registration (admin only)"""
    await get_admin(request, admin_token)
    
    registration = await db.student_registrations.find_one(
        {"registration_id": registration_id},
        {"_id": 0}
    )
    
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    if registration["status"] != "pending":
        raise HTTPException(status_code=400, detail="Registration already processed")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    
    user_doc = {
        "user_id": user_id,
        "email": registration["email"],
        "name": registration["name"],
        "picture": None,
        "created_at": now.isoformat()
    }
    await db.users.insert_one(user_doc)
    
    await db.approved_students.insert_one({
        "user_id": user_id,
        "email": registration["email"],
        "approved_at": now.isoformat()
    })
    
    await db.student_registrations.update_one(
        {"registration_id": registration_id},
        {"$set": {"status": "approved", "user_id": user_id}}
    )
    
    return {"message": "Student approved successfully", "user_id": user_id}

@api_router.delete("/admin/reject-student/{registration_id}")
async def reject_student(registration_id: str, request: Request, admin_token: Optional[str] = Cookie(None)):
    """Reject student registration (admin only)"""
    await get_admin(request, admin_token)
    
    result = await db.student_registrations.update_one(
        {"registration_id": registration_id},
        {"$set": {"status": "rejected"}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    return {"message": "Student registration rejected"}

@api_router.get("/courses")
async def get_courses():
    """Get all courses (public)"""
    courses = await db.courses.find({}, {"_id": 0}).sort("created_at", -1).to_list(length=1000)
    
    for course in courses:
        if isinstance(course.get('created_at'), str):
            course['created_at'] = datetime.fromisoformat(course['created_at'])
        if isinstance(course.get('updated_at'), str):
            course['updated_at'] = datetime.fromisoformat(course['updated_at'])
    
    return courses

@api_router.post("/admin/courses", response_model=Course, status_code=201)
async def create_course(course_data: CourseCreate, request: Request, admin_token: Optional[str] = Cookie(None)):
    """Create course (admin only)"""
    await get_admin(request, admin_token)
    
    course_id = f"course_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    
    course_doc = {
        "course_id": course_id,
        "title": course_data.title,
        "category": course_data.category,
        "duration": course_data.duration,
        "price": course_data.price,
        "rating": course_data.rating,
        "students": course_data.students,
        "image": course_data.image,
        "description": course_data.description,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    
    await db.courses.insert_one(course_doc)
    
    course_doc['created_at'] = now
    course_doc['updated_at'] = now
    
    return Course(**course_doc)

@api_router.put("/admin/courses/{course_id}", response_model=Course)
async def update_course(course_id: str, course_data: CourseUpdate, request: Request, admin_token: Optional[str] = Cookie(None)):
    """Update course (admin only)"""
    await get_admin(request, admin_token)
    
    update_data = {k: v for k, v in course_data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.courses.update_one(
        {"course_id": course_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    
    updated_course = await db.courses.find_one({"course_id": course_id}, {"_id": 0})
    
    if isinstance(updated_course.get('created_at'), str):
        updated_course['created_at'] = datetime.fromisoformat(updated_course['created_at'])
    if isinstance(updated_course.get('updated_at'), str):
        updated_course['updated_at'] = datetime.fromisoformat(updated_course['updated_at'])
    
    return Course(**updated_course)

@api_router.delete("/admin/courses/{course_id}")
async def delete_course(course_id: str, request: Request, admin_token: Optional[str] = Cookie(None)):
    """Delete course (admin only)"""
    await get_admin(request, admin_token)
    
    result = await db.courses.delete_one({"course_id": course_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return {"message": "Course deleted successfully"}

@api_router.get("/notes")
async def get_notes():
    """Get all notes (public)"""
    notes = await db.notes.find({}, {"_id": 0}).sort("created_at", -1).to_list(length=1000)
    
    for note in notes:
        if isinstance(note.get('created_at'), str):
            note['created_at'] = datetime.fromisoformat(note['created_at'])
        if isinstance(note.get('updated_at'), str):
            note['updated_at'] = datetime.fromisoformat(note['updated_at'])
    
    return notes

@api_router.post("/admin/notes", response_model=Note, status_code=201)
async def create_note(note_data: NoteCreate, request: Request, admin_token: Optional[str] = Cookie(None)):
    """Create note (admin only)"""
    await get_admin(request, admin_token)
    
    note_id = f"note_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    
    note_doc = {
        "note_id": note_id,
        "title": note_data.title,
        "subject": note_data.subject,
        "description": note_data.description,
        "file_url": note_data.file_url,
        "file_type": note_data.file_type,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    
    await db.notes.insert_one(note_doc)
    
    note_doc['created_at'] = now
    note_doc['updated_at'] = now
    
    return Note(**note_doc)

@api_router.put("/admin/notes/{note_id}", response_model=Note)
async def update_note(note_id: str, note_data: NoteUpdate, request: Request, admin_token: Optional[str] = Cookie(None)):
    """Update note (admin only)"""
    await get_admin(request, admin_token)
    
    update_data = {k: v for k, v in note_data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.notes.update_one(
        {"note_id": note_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    
    updated_note = await db.notes.find_one({"note_id": note_id}, {"_id": 0})
    
    if isinstance(updated_note.get('created_at'), str):
        updated_note['created_at'] = datetime.fromisoformat(updated_note['created_at'])
    if isinstance(updated_note.get('updated_at'), str):
        updated_note['updated_at'] = datetime.fromisoformat(updated_note['updated_at'])
    
    return Note(**updated_note)

@api_router.delete("/admin/notes/{note_id}")
async def delete_note(note_id: str, request: Request, admin_token: Optional[str] = Cookie(None)):
    """Delete note (admin only)"""
    await get_admin(request, admin_token)
    
    result = await db.notes.delete_one({"note_id": note_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    
    return {"message": "Note deleted successfully"}

@api_router.get("/admin/inquiries")
async def get_inquiries(request: Request, admin_token: Optional[str] = Cookie(None)):
    """Get all inquiries (admin only)"""
    await get_admin(request, admin_token)
    
    inquiries = await db.inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(length=1000)
    
    for inquiry in inquiries:
        if isinstance(inquiry.get('created_at'), str):
            inquiry['created_at'] = datetime.fromisoformat(inquiry['created_at'])
    
    return inquiries

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