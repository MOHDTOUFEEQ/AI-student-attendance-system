from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from datetime import datetime
import cv2
import numpy as np
import base64
import tempfile
import os
from dotenv import load_dotenv
from pymongo import MongoClient
import os
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

load_dotenv()  # Load variables from .env

mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)
db = client["test"]  # You can name your database anything
users = db["users"]
attendance_logs = db["attendance_logs"]

app = Flask(__name__)
CORS(app)

# Load the trained YOLO model once
model = YOLO("best.pt")


bcrypt = Bcrypt(app)
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
jwt = JWTManager(app)

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")  # NEW
    password = bcrypt.generate_password_hash(data["password"]).decode("utf-8")

    # Check for missing fields
    if not username or not password or not email:
        return jsonify({"error": "Username, email, and password are required"}), 400

    # Check for duplicate username or email
    if users.find_one({"$or": [{"username": username}, {"email": email}]}):
        return jsonify({"error": "Username or email already exists"}), 400

    # Insert user
    users.insert_one({"username": username, "email": email, "password": password})
    return jsonify({"message": "User registered successfully"}), 201



@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = users.find_one({"username": data["username"]})

    if not user or not bcrypt.check_password_hash(user["password"], data["password"]):
        return jsonify({"error": "Invalid username or password"}), 401

    token = create_access_token(identity=data["username"])
    return jsonify({"access_token": token})

@app.route("/test_db")
def test_db():
    try:
        count = users.count_documents({})
        return jsonify({"message": f"Connected successfully! Users count: {count}"})
    except Exception as e:

        return jsonify({"error": str(e)})
@app.route("/log_attendance", methods=["POST"])
def log_attendance():
    try:
        data = request.get_json()
        print("📦 Incoming data:", data)  # 👈 debug print
        log_entry = {
            "classroom_id": data["classroom_id"],
            "module_name": data["module_name"],
            "lecture_name": data["lecture_name"],
            "timestamp": datetime.utcnow(),
            "num_students_detected": data["num_students_detected"],
            "total_students_expected": data["total_students_expected"],
            "absent_students": data["total_students_expected"] - data["num_students_detected"],
        }
        attendance_logs.insert_one(log_entry)
        print("✅ Attendance logged successfully")
        return jsonify({"message": "Attendance logged successfully"}), 201
    except Exception as e:
        print("❌ Error while logging attendance:", str(e))
        return jsonify({"error": str(e)}), 500
    
@app.route("/get_logs/<classroom_id>", methods=["GET"])
def get_logs(classroom_id):
    logs = list(attendance_logs.find(
        {"classroom_id": classroom_id},
        {"_id": 0}
    ).sort("timestamp", -1))
    return jsonify(logs)
    
# ------------------------------------------------------------
# 🔹 Image Prediction Endpoint
# ------------------------------------------------------------
@app.route("/predict_image", methods=["POST"])
def predict_image():
    try:
        data = request.get_json()
        image_data = data["file"].split(",")[1]  # remove base64 header
        image_bytes = base64.b64decode(image_data)

        # Convert bytes to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Run YOLO inference
        results = model(img)
        annotated = results[0].plot()
        num_students = len(results[0].boxes)

        # Encode output image to base64
        _, buffer = cv2.imencode(".jpg", annotated)
        output_b64 = base64.b64encode(buffer).decode("utf-8")

        return jsonify({
            "output": "data:image/jpeg;base64," + output_b64,
            "num_students": num_students
        })
    except Exception as e:
        return jsonify({"error": str(e)})


# ------------------------------------------------------------
# 🔹 Video Prediction Endpoint
# ------------------------------------------------------------
@app.route("/predict_video", methods=["POST"])
def predict_video():
    try:
        data = request.get_json()
        video_data = data["file"].split(",")[1]
        video_bytes = base64.b64decode(video_data)

        # Save uploaded video temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_input:
            temp_input.write(video_bytes)
            input_path = temp_input.name

        # Output temp video path
        output_path = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4").name

        cap = cv2.VideoCapture(input_path)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0  # fallback if fps = 0

        # ✅ Use mp4v codec for cross-browser playback
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

        total_students = 0
        frame_count = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            results = model(frame)
            annotated = results[0].plot()

            # ✅ Convert BGR → RGB → BGR to fix dark tint issue
            annotated = cv2.cvtColor(annotated, cv2.COLOR_RGB2BGR)

            out.write(annotated)
            total_students += len(results[0].boxes)
            frame_count += 1

        cap.release()
        out.release()

        avg_students = total_students // frame_count if frame_count > 0 else 0

        # ✅ Read back as proper MP4
        with open(output_path, "rb") as f:
            encoded_video = base64.b64encode(f.read()).decode("utf-8")

        # Cleanup
        os.remove(input_path)
        os.remove(output_path)

        return jsonify({
            "output": f"data:video/mp4;base64,{encoded_video}",
            "num_students": avg_students
        })


    except Exception as e:
        return jsonify({"error": str(e)})



# ------------------------------------------------------------
# 🔹 Root Endpoint (for testing)
# ------------------------------------------------------------
@app.route("/")
def home():
    return "✅ Flask backend is running for Student Detection AI!"

# ------------------------------------------------------------
# 📊 DASHBOARD ENDPOINTS (Subject / Classroom Wise)
# ------------------------------------------------------------

@app.route("/get_subjects", methods=["GET"])
def get_subjects():
    """Fetch all unique subjects (module_name) from attendance logs."""
    try:
        subjects = attendance_logs.distinct("module_name")
        return jsonify(subjects)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/get_logs_by_subject/<subject>", methods=["GET"])
def get_logs_by_subject(subject):
    """Fetch all attendance logs for a specific subject (module_name)."""
    try:
        logs = list(attendance_logs.find(
            {"module_name": subject},
            {"_id": 0}
        ).sort("timestamp", -1))
        return jsonify(logs)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/get_summary_by_subject/<subject>", methods=["GET"])
def get_summary_by_subject(subject):
    """Generate summary stats (total lectures, avg attendance %, etc.) for a subject."""
    try:
        logs = list(attendance_logs.find({"module_name": subject}))
        if not logs:
            return jsonify({"error": "No logs found for this subject"}), 404

        total_lectures = len(logs)
        avg_attendance = (
            sum(log["num_students_detected"] / log["total_students_expected"]
                for log in logs if log["total_students_expected"] > 0)
            / total_lectures
        ) * 100

        total_detected = sum(log["num_students_detected"] for log in logs)
        total_expected = sum(log["total_students_expected"] for log in logs)

        summary = {
            "subject": subject,
            "total_lectures": total_lectures,
            "average_attendance": round(avg_attendance, 2),
            "total_detected": total_detected,
            "total_expected": total_expected,
        }
        return jsonify(summary)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/get_chart_data_by_subject/<subject>", methods=["GET"])
def get_chart_data_by_subject(subject):
    """Return attendance trend (date vs attendance %) for a specific subject."""
    try:
        logs = list(attendance_logs.find(
            {"module_name": subject},
            {"timestamp": 1, "num_students_detected": 1, "total_students_expected": 1, "_id": 0}
        ).sort("timestamp", 1))

        chart_data = []
        for log in logs:
            if log["total_students_expected"] > 0:
                attendance_rate = (log["num_students_detected"] / log["total_students_expected"]) * 100
                chart_data.append({
                    "date": log["timestamp"].strftime("%Y-%m-%d"),
                    "attendance": round(attendance_rate, 2)
                })

        return jsonify(chart_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
