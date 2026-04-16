# 🥛 Amul Dairy Management System

## Project Structure
```
dairy-app/
├── backend/      ← Node.js + Express + MongoDB API
└── frontend/     ← React + TypeScript + Vite app
```

## Quick Start

### 1. Backend
```bash
cd backend
npm install
# Update .env with your new MongoDB password
npm run dev
```

### 2. Create admin account (run once)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}'
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## ⚠️ Important
- Change your MongoDB password at cloud.mongodb.com
- Update backend/.env with the new password
- Add your IP to MongoDB Atlas → Network Access
