import os
import re
from datetime import timedelta

from flask import Flask, request
from flask_cors import CORS
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager

from .extensions import db, migrate
from .models import User, Property, University, Booking, Payment

UNIVERSITY_SEED = [
    {"id": 1, "name": "University of Nairobi", "city": "Nairobi"},
    {"id": 2, "name": "Kenyatta University", "city": "Nairobi"},
    {"id": 3, "name": "Jomo Kenyatta University of Agriculture and Technology", "city": "Kiambu"},
    {"id": 4, "name": "Strathmore University", "city": "Nairobi"},
    {"id": 5, "name": "United States International University - Africa", "city": "Nairobi"},
    {"id": 6, "name": "Moi University", "city": "Eldoret"},
    {"id": 7, "name": "Egerton University", "city": "Njoro"},
    {"id": 8, "name": "Maseno University", "city": "Kisumu"},
    {"id": 9, "name": "Kisii University", "city": "Kisii"},
    {"id": 10, "name": "Maasai Mara University", "city": "Narok"},
    {"id": 11, "name": "Mount Kenya University", "city": "Thika"},
    {"id": 12, "name": "Daystar University", "city": "Nairobi"},
    {"id": 13, "name": "Catholic University of Eastern Africa", "city": "Nairobi"},
    {"id": 14, "name": "Africa Nazarene University", "city": "Nairobi"},
    {"id": 15, "name": "University of Embu", "city": "Embu"},
    {"id": 16, "name": "Dedan Kimathi University of Technology", "city": "Nyeri"},
    {"id": 17, "name": "Technical University of Kenya", "city": "Nairobi"},
    {"id": 18, "name": "Multimedia University of Kenya", "city": "Nairobi"},
    {"id": 19, "name": "KCA University", "city": "Nairobi"},
    {"id": 20, "name": "Riara University", "city": "Nairobi"},
    {"id": 21, "name": "St. Paul’s University", "city": "Limuru"},
    {"id": 22, "name": "University of Eldoret", "city": "Eldoret"},
    {"id": 23, "name": "Machakos University", "city": "Machakos"},
    {"id": 24, "name": "Nakuru University", "city": "Nakuru"},
    {"id": 25, "name": "Meru University of Science and Technology", "city": "Meru"},
    {"id": 26, "name": "Murang’a University of Technology", "city": "Murang’a"},
    {"id": 27, "name": "Co-operative University of Kenya", "city": "Nairobi"},
    {"id": 28, "name": "Karatina University", "city": "Karatina"},
]
from .routes.properties import properties_bp
from .routes.universities import universities_bp
from .routes.bookings import bookings_bp
from .routes.auth import auth_bp
from .routes.payments import payments_bp
from .routes.admin import admin_bp
from .routes.reviews import reviews_bp
from .routes.messages import messages_bp
from .routes.host_verification import host_verification_bp
from .routes.notifications import notifications_bp


load_dotenv()


def create_app():
    app = Flask(__name__)

    # ============================================================
    # DATABASE
    # ============================================================

    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL",
        "sqlite:///qrib.db",
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # ============================================================
    # JWT
    # ============================================================

    jwt_secret = os.getenv("JWT_SECRET_KEY")
    if not jwt_secret:
        raise RuntimeError("JWT_SECRET_KEY environment variable is not set")
    app.config["JWT_SECRET_KEY"] = jwt_secret
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)

    # ============================================================
    # INITIALIZE EXTENSIONS
    # ============================================================

    db.init_app(app)
    migrate.init_app(app, db)
    JWTManager(app)

    with app.app_context():
        db.create_all()

        for university in UNIVERSITY_SEED:
            entry = db.session.get(University, university["id"])
            if entry is None:
                db.session.add(
                    University(
                        id=university["id"],
                        name=university["name"],
                        city=university["city"],
                    )
                )
            else:
                entry.name = university["name"]
                entry.city = university["city"]

        db.session.commit()

    # ============================================================
    # CORS
    # ============================================================

    configured_origins = os.getenv("CORS_ALLOWED_ORIGINS", "")
    allowed_origins = [
        "http://172.29.254.86:5173",
        "http://localhost:5173",
        "http://localhost:4173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:4173",
        "http://0.0.0.0:5173",
        "https://qrib-mu.vercel.app",
        "https://qrib-f4sk.onrender.com",
        os.getenv("FRONTEND_URL", "https://qrib-mu.vercel.app"),
    ]

    if configured_origins:
        allowed_origins.extend(
            origin.strip()
            for origin in configured_origins.split(",")
            if origin.strip()
        )

    allowed_origins = [
        origin.strip()
        for origin in allowed_origins
        if origin and origin.strip()
    ]
    allowed_origins = list(dict.fromkeys(allowed_origins))

    def is_allowed_origin(origin):
        if not origin:
            return False

        if origin in allowed_origins:
            return True

        return bool(
            re.match(r"^https://[a-z0-9-]+\.vercel\.app$", origin)
            or re.match(r"^https://[a-z0-9-]+\.onrender\.com$", origin)
        )

    @app.after_request
    def apply_cors_headers(response):
        origin = request.headers.get("Origin")

        if origin and is_allowed_origin(origin):
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Vary"] = "Origin"

            if request.method == "OPTIONS":
                response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
                response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
                response.headers["Access-Control-Max-Age"] = "600"

        return response

    @app.route("/api/<path:subpath>", methods=["OPTIONS"])
    def api_preflight(subpath):
        origin = request.headers.get("Origin")
        if not origin or not is_allowed_origin(origin):
            return jsonify({"error": "Origin not allowed"}), 403

        response = jsonify({"ok": True})
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Max-Age"] = "600"
        response.headers["Vary"] = "Origin"
        return response, 200

    CORS(
        app,
        resources={r"/api/*": {"origins": allowed_origins}},
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
        supports_credentials=True,
    )

    # ============================================================
    # ROUTES
    # ============================================================

    app.register_blueprint(auth_bp)
    app.register_blueprint(properties_bp)
    app.register_blueprint(universities_bp)
    app.register_blueprint(bookings_bp)
    app.register_blueprint(payments_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(reviews_bp)
    app.register_blueprint(messages_bp)
    app.register_blueprint(host_verification_bp)
    app.register_blueprint(notifications_bp)

    # ============================================================
    # FLASK SHELL
    # ============================================================

    @app.shell_context_processor
    def make_shell_context():
        return {
            "db": db,
            "User": User,
            "Property": Property,
            "University": University,
            "Booking": Booking,
        }

    # ============================================================
    # HEALTH CHECK
    # ============================================================

    @app.get("/api/health")
    def health():
        return {
            "status": "ok",
            "message": "Qrib API is running",
        }

    return app
