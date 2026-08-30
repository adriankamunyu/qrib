import os

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager

from .extensions import db, migrate
from .models import User, Property, University, Booking, Payment
from .routes.properties import properties_bp
from .routes.universities import universities_bp
from .routes.bookings import bookings_bp
from .routes.auth import auth_bp
from .routes.payments import payments_bp


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

    # ============================================================
    # INITIALIZE EXTENSIONS
    # ============================================================

    db.init_app(app)
    migrate.init_app(app, db)
    JWTManager(app)

    # ============================================================
    # CORS
    # ============================================================

    default_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://0.0.0.0:5173",
    ]
    configured_origins = os.getenv("CORS_ALLOWED_ORIGINS")
    if configured_origins:
        default_origins.extend(
            [origin.strip() for origin in configured_origins.split(",") if origin.strip()]
        )

    CORS(
        app,
        resources={r"/api/*": {"origins": default_origins}},
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