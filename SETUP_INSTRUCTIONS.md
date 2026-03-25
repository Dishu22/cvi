# CodeVerse Institute Website - Setup Instructions

## 🎉 Complete Website Features

### Admin Panel System
- **Admin Login**: `/admin/login`
  - Username: `admin`
  - Password: `cvi@admin123`
- Student approval workflow
- Courses management (Add/Edit/Delete)
- Notes upload & management
- View all inquiries

### Student Features
- Student registration with admin approval
- Google OAuth login (after approval)
- Project portfolio upload
- Public student profiles
- SEO-optimized project pages

### Design
- Dark theme with Volt Green (#CCFF00) & Electric Orange (#FF6B00)
- WhatsApp & Instagram floating buttons
- Smooth animations & modern UI

---

## 🚀 How to Push to GitHub

### Method 1: Using Git Commands (Recommended)

```bash
# 1. Clone this code to your local machine first
# 2. Navigate to the project folder
cd cvi

# 3. Initialize git (if not already done)
git init

# 4. Add GitHub remote
git remote add origin https://github.com/Dishu22/cvi.git

# 5. Add all files
git add .

# 6. Commit
git commit -m "Initial commit - CodeVerse Institute website"

# 7. Push to GitHub
git branch -M main
git push -u origin main
```

### Method 2: GitHub Desktop (Easy)
1. Download GitHub Desktop app
2. Sign in with your GitHub account
3. Click "Add" → "Add Existing Repository"
4. Select this folder
5. Click "Publish repository"

### Method 3: Direct Upload
1. Go to https://github.com/Dishu22/cvi
2. Click "uploading an existing file"
3. Drag and drop the zip file or all folders
4. Commit changes

---

## 📦 Installation & Running

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python server.py
```

### Frontend Setup
```bash
cd frontend
yarn install
yarn start
```

### Environment Variables
Create `.env` files:

**backend/.env**:
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
CORS_ORIGINS=*
ADMIN_USERNAME=admin
ADMIN_PASSWORD=cvi@admin123
```

**frontend/.env**:
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## 📱 Contact Information

- **WhatsApp**: +91 97857 95669
- **Instagram**: @codeverseinstitute
- **Email**: institutecodeverse@gmail.com
- **Address**: 291, behind Adrash cinema, near bus stand, Sri Ganganagar

---

## 🔐 Important Notes

1. `.env` files are NOT included in git for security
2. Change admin password in production
3. Update WhatsApp number & Instagram handle in `SocialFloating.jsx`
4. MongoDB should be running on localhost:27017

---

## 📄 Project Structure

```
/app
├── backend/              # FastAPI backend
│   ├── server.py        # Main backend file
│   ├── requirements.txt # Python dependencies
│   └── .env            # Backend environment variables
│
├── frontend/            # React frontend
│   ├── src/
│   │   ├── pages/      # All page components
│   │   ├── components/ # Reusable components
│   │   └── lib/        # Utility functions
│   ├── package.json
│   └── .env           # Frontend environment variables
│
└── README.md

```

---

## 🎯 Key URLs

- Landing Page: `/`
- Student Register: `/register`
- Student Login: `/login`
- Admin Login: `/admin/login`
- Admin Dashboard: `/admin/dashboard`
- Notes: `/notes`
- Student Dashboard: `/dashboard`

---

**Built with ❤️ for CodeVerse Institute**
