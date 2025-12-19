# Life Goals & Progress Dashboard

A full-stack productivity and goal-tracking application built using:

- **Django (Backend + API)**
- **React (Frontend UI)**
- **JWT Authentication**
- **AI Goal Suggestions & Task Generator**

The React app is fully integrated into Django using a production build, allowing the entire project to run from **one command**.

---

## 🚀 Features

### **1️⃣ Goal Management System (CRUD)**
Create, edit, delete, and manage personal goals with a clean and modern UI.

### **2️⃣ Subtasks & Progress Tracking**
Each goal contains subtasks. Progress is calculated automatically with real-time updates.

### **3️⃣ Analytics + Notifications Center**
A combined smart dashboard that provides:
- Progress & productivity charts  
- Weekly insights  
- Notifications for pending tasks and upcoming deadlines  

### **4️⃣ Focus Mode (Distraction-Free Mode)**
A dedicated clean workspace with a focus timer to help users concentrate on their tasks.

### **5️⃣ AI Goal Suggestions & AI Task Generator**
Custom AI API that:
- Suggests goals automatically  
- Generates tasks based on goals  
- Helps in better planning and productivity  

### **6️⃣ Habit Tracker**
Track daily habits with:
- Streaks  
- Completion percentage  
- Daily habit progress  

### **7️⃣ Profile Management**
Users can update:
- Avatar / Profile Photo  
- Username  
- Personal account details  

### **8️⃣ JWT Authentication**
Secure login system using Access + Refresh tokens.  
All important routes are protected.

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Backend | Django, Django REST Framework |
| Frontend | React, TailwindCSS |
| Authentication | JWT |
| Database | SQLite |
| AI | Custom AI Endpoints |
| Deployment | React Build served inside Django |

---

## 📁 Project Structure

```
LifeGoalsDashboard/
│
├── backend/
│   ├── backend/
│   ├── goals/
│   ├── ai/
│   ├── build/
│   ├── media/
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   └── life-goals-frontend/
│
└── README.md
```

---

## ▶️ How To Run The Project

### **1️⃣ Install Backend Dependencies**
```cd backend``` 
```pip install -r requirements.txt```
### **2️⃣ Run the Server**
```python manage.py runserver```
### ✔ App will start at:
http://127.0.0.1:8000/
React frontend will load automatically from Django.

---

## 🌐 API Endpoints (Main)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/token/ | Login (JWT) |
| POST | /api/token/refresh/ | Refresh Token |
| GET | /api/goals/ | List all goals |
| POST | /api/goals/ | Create goal |
| GET | /api/tasks/ | List goal tasks |
| POST | /api/ai/suggestions/ | AI Goal Suggestions |
| POST | /api/ai/generate_tasks/ | AI Task Generator |

---

## 👨‍🏫 Notes for Evaluators / Teachers

- React is integrated into Django using the `build/` folder  
- Project runs from **one server only (Django)**  
- Professional folder structure  
- AI-powered goal & task suggestions  
- JWT-secured backend  
- Modern UI using React + Tailwind  
- Fully working CRUD + Analytics + Habits + Profile  

This project demonstrates both **frontend and backend development skills**.

---

## ⭐ Author
Developed by **Athul Krishna**
