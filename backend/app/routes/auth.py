from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import os

from app.extensions import db
from app.models import User


auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/api/auth"
)


def user_to_dict(user):
    return {
        "id": user.id,
        "username": user.username,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at.isoformat(),
    }


# =========================
# REGISTER
# =========================
@auth_bp.post("/register")
def register():
    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    required_fields = [
        "name",
        "email",
        "password",
        "role",
    ]

    missing = [
        field
        for field in required_fields
        if data.get(field) in (None, "")
    ]

    if missing:
        return jsonify({
            "error": "Missing required fields",
            "fields": missing
        }), 400

    name = data["name"].strip()
    email = data["email"].strip().lower()
    password = data["password"]
    role = data["role"].strip().lower()

    if len(name) < 2:
        return jsonify({
            "error": "Name must be at least 2 characters"
        }), 400

    if "@" not in email:
        return jsonify({
            "error": "Invalid email address"
        }), 400

    if len(password) < 6:
        return jsonify({
            "error": "Password must be at least 6 characters"
        }), 400

    if role not in ("student", "host"):
        return jsonify({
            "error": "Role must be student or host"
        }), 400

    # Check email
    existing_email = User.query.filter_by(
        email=email
    ).first()

    if existing_email:
        return jsonify({
            "error": "An account with this email already exists"
        }), 409

    # Generate username
    username = email.split("@")[0]

    existing_username = User.query.filter_by(
        username=username
    ).first()

    if existing_username:
        username = f"{username}_{User.query.count() + 1}"

    # Create user
    user = User(
        username=username,
        email=email,
        name=name,
        role=role,
        hashed_password=generate_password_hash(password),
    )

    db.session.add(user)
    db.session.commit()

    # Automatically create JWT after registration
    access_token = create_access_token(
        identity=str(user.id)
    )

    return jsonify({
        "message": "Account created successfully",
        "access_token": access_token,
        "user": user_to_dict(user)
    }), 201


# =========================
# LOGIN
# =========================
@auth_bp.post("/login")
def login():
    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "error": "Email and password are required"
        }), 400

    email = email.strip().lower()

    user = User.query.filter_by(
        email=email
    ).first()

    if not user:
        return jsonify({
            "error": "Invalid email or password"
        }), 401

    if not check_password_hash(
        user.hashed_password,
        password
    ):
        return jsonify({
            "error": "Invalid email or password"
        }), 401

    # Create JWT
    access_token = create_access_token(
        identity=str(user.id)
    )

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": user_to_dict(user)
    }), 200


# =========================
# GOOGLE AUTH
# =========================
@auth_bp.post("/google")
def google_auth():
    data = request.get_json()

    if not data or not data.get("credential"):
        return jsonify({"error": "Google credential is required"}), 400

    try:
        id_info = id_token.verify_oauth2_token(
            data["credential"],
            google_requests.Request(),
            os.getenv("GOOGLE_CLIENT_ID")
        )
    except ValueError:
        return jsonify({"error": "Invalid Google token"}), 401

    google_id = id_info["sub"]
    email = id_info["email"].lower()
    name = id_info.get("name", email.split("@")[0])

    user = User.query.filter_by(google_id=google_id).first()

    if not user:
        user = User.query.filter_by(email=email).first()

    if not user:
        username = email.split("@")[0]
        if User.query.filter_by(username=username).first():
            username = f"{username}_{User.query.count() + 1}"

        user = User(
            username=username,
            email=email,
            name=name,
            role="student",
            auth_provider="google",
            google_id=google_id,
        )
        db.session.add(user)

    user.google_id = google_id
    user.auth_provider = "google"
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        "message": "Google login successful",
        "access_token": access_token,
        "user": user_to_dict(user)
    }), 200


# =========================
# CURRENT USER
# =========================
@auth_bp.get("/me")
@jwt_required()
def get_current_user():

    user_id = get_jwt_identity()

    user = db.session.get(
        User,
        int(user_id)
    )

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    return jsonify({
        "user": user_to_dict(user)
    }), 200