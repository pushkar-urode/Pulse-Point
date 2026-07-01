# Pulse Point 🏥

A comprehensive hospital management system built with **Cursor AI** that helps manage appointments, beds, medicines, and emergency services.

## 🌐 Live Demo
Project Live Link - https://pulse-point-liart.vercel.app

## ✨ Features
- **Authentication** - Secure user login & registration
- **Hospital Management** - Browse and manage hospitals
- **Appointments** - Schedule and track appointments
- **Bed Management** - Real-time bed availability tracking
- **Medicine Management** - Track medicines and prescriptions
- **Emergency Services** - Quick emergency request handling
- **Location-based Search** - Find hospitals near you (Leaflet Maps)

## 🛠️ Tech Stack

### Backend
- **Node.js** + Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Bcrypt** for password hashing

### Frontend
- **React 19** + Vite
- **Tailwind CSS** for styling
- **Leaflet** for maps
- **Axios** for API calls
- **React Router** for navigation

## 📦 Setup Instructions

### Backend (.ENV)
```env
PORT=5000
MONGO_URI=<your_mongodb_connection_string>
```

### Frontend (.ENV)
```env
VITE_BASE_URL=<your_backend_url>
```

### Installation
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## 📝 License
ISC
