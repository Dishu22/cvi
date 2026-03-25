# CodeVerse Institute - Complete Website

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green.svg)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green.svg)](https://www.mongodb.com/)

A modern, full-featured educational institute website with admin panel, student portfolio system, and dynamic content management.

## ✨ Features

### 🔐 Admin Panel
- Student registration approval system
- Dynamic course management (CRUD)
- Notes/resources upload
- Inquiry management from contact form
- Secure admin authentication

### 👨‍🎓 Student Portal
- Google OAuth authentication
- Personal project portfolio
- Project showcase with SEO
- Public profile pages
- Notes & resources access

### 🎨 Design
- Modern dark theme
- Volt Green (#CCFF00) & Electric Orange (#FF6B00) accents
- Smooth scrolling (Lenis)
- Glassmorphism effects
- Responsive design
- WhatsApp & Instagram floating buttons

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Python 3.11+
- MongoDB

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Dishu22/cvi.git
cd cvi
```

2. **Backend Setup**
```bash
cd backend
pip install -r requirements.txt

# Create .env file
echo "MONGO_URL=mongodb://localhost:27017" > .env
echo "DB_NAME=cvi_database" >> .env
echo "ADMIN_USERNAME=admin" >> .env
echo "ADMIN_PASSWORD=your_secure_password" >> .env

# Run server
python server.py
```

3. **Frontend Setup**
```bash
cd frontend
yarn install

# Create .env file
echo "REACT_APP_BACKEND_URL=http://localhost:8001" > .env

# Start development server
yarn start
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- Admin Panel: http://localhost:3000/admin/login

## 📁 Project Structure

```
cvi/
├── backend/
│   ├── server.py           # FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Backend configuration
│
├── frontend/
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   └── lib/           # Utilities
│   ├── package.json       # Node dependencies
│   └── .env              # Frontend configuration
│
└── README.md
```

## 🔑 Default Admin Credentials

- **URL**: `/admin/login`
- **Username**: `admin`
- **Password**: `cvi@admin123`

⚠️ **Important**: Change the admin password in production!

## 📱 Key Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Landing page with courses, gallery |
| Register | `/register` | Student registration |
| Login | `/login` | Google OAuth login |
| Admin Panel | `/admin/dashboard` | Manage students, courses, notes |
| Notes | `/notes` | View/download study materials |
| Dashboard | `/dashboard` | Student project management |
| Student Profile | `/student/{name}` | Public student portfolio |
| Project Detail | `/student/project/{slug}` | Individual project view |

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Tailwind CSS
- Shadcn UI Components
- Framer Motion
- React Router v6
- Lenis (Smooth Scroll)

**Backend:**
- FastAPI
- MongoDB (Motor - async driver)
- Pydantic
- Python 3.11+

**Authentication:**
- Google OAuth (Emergent-managed)
- Session-based auth
- JWT alternative ready

## 🎯 Admin Features

1. **Student Management**
   - Approve/reject registration requests
   - View all pending students
   - Manage student accounts

2. **Course Management**
   - Add new courses
   - Edit course details
   - Delete courses
   - Dynamic course loading

3. **Notes Management**
   - Upload study materials
   - Organize by subject
   - File URL management

4. **Inquiry Management**
   - View contact form submissions
   - Track student interests

## 👨‍💻 Development

### Running in Development

```bash
# Terminal 1 - Backend
cd backend
python server.py

# Terminal 2 - Frontend
cd frontend
yarn start
```

### Environment Variables

**Backend (.env)**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=cvi_database
CORS_ORIGINS=*
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_password_here
```

**Frontend (.env)**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 🔒 Security Notes

1. Never commit `.env` files to Git
2. Change default admin credentials
3. Use strong passwords in production
4. Enable HTTPS in production
5. Configure CORS properly for production

## 📞 Contact

- **Institute**: CodeVerse Institute
- **Location**: Sri Ganganagar, Rajasthan
- **Email**: institutecodeverse@gmail.com
- **Phone**: +91 97857 95669

## 📄 License

This project is built for CodeVerse Institute. All rights reserved.

---

**Made with ❤️ for CodeVerse Institute, Sri Ganganagar**
