# 🎓 AI Student Attendance System

An **AI-powered student attendance monitoring system** that uses **YOLOv8** and **TensorFlow** for real-time student detection and counting from classroom video feeds.  
This project integrates **Flask (Python)** for the backend, **React.js** for the frontend, and **MongoDB** for data storage — delivering a complete full-stack solution for automating attendance management in educational environments.

---

## 🧠 Overview

Traditional attendance methods are often inefficient and prone to human error.  
This project presents an **AI-driven camera-based attendance system** that automatically detects and counts students in classrooms using deep learning and computer vision.  

The system aims to:
- Eliminate manual attendance tracking.
- Provide **real-time student count** from live camera feeds.
- Store attendance records securely in a **database**.
- Offer an **interactive dashboard** for administrators and teachers.

---

## 🚀 Features

✅ **Automated Detection:** Real-time student detection using YOLOv8.  
✅ **Full-Stack Integration:** Frontend (React) ↔ Backend (Flask) ↔ Database (MongoDB).  
✅ **Secure Authentication:** JWT-based user login and role management.  
✅ **Attendance Analytics:** Graphs and visual reports on student participation trends.  
✅ **Responsive Dashboard:** Modern UI for both educators and administrators.  
✅ **Scalable Architecture:** Designed for future cloud and multi-classroom integration.

---

## 🏗 System Architecture

The system consists of four main layers:

| Layer | Description |
|-------|--------------|
| **Frontend** | React.js web interface for uploads, analytics, and reports |
| **Backend** | Flask API handling detection requests and authentication |
| **AI Model** | YOLOv8 (Ultralytics) + TensorFlow for student detection |
| **Database** | MongoDB for storing users, attendance logs, and session data |

**Data Flow:**
1. User uploads classroom image or video.  
2. Flask server sends data to YOLOv8 model for inference.  
3. Detected results (student count, annotated frame) are returned to the frontend.  
4. Attendance logs are saved in MongoDB.  
5. Dashboard visualizes attendance data in real-time.

---

## 💻 Tech Stack

| Component | Technology |
|------------|-------------|
| **Frontend** | React.js, HTML5, CSS3, JavaScript |
| **Backend** | Flask (Python), RESTful APIs |
| **AI / ML** | YOLOv8, TensorFlow, OpenCV |
| **Database** | MongoDB |
| **Authentication** | JWT, bcrypt |
| **Visualization** | Chart.js / Recharts |
| **Version Control** | Git, GitHub |

---

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js & npm
- MongoDB running locally or via Atlas
- GPU (optional but recommended for YOLOv8 inference)

### Backend Setup (Flask)
```bash
cd backend
python -m venv venv
source venv/bin/activate       # or venv\Scripts\activate on Windows
pip install -r requirements.txt

```
### Create a .env file:
```bash
MONGO_URI="your_mongodb_connection_string"
JWT_SECRET="your_secret_key"
```

### Run the server:
  ```bash 
  python app.py
  ```

### Frontend Setup (React)
  ```bash
  cd frontend
  npm install
  npm start
  ```

### Access the app at:
```bash
👉 http://localhost:3000
```
