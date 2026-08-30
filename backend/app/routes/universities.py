from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from app.extensions import db
from app.models import University


universities_bp = Blueprint(
    "universities",
    __name__,
    url_prefix="/api/universities"
)


@universities_bp.get("")
def get_universities():
    universities = (
        University.query
        .order_by(University.name.asc())
        .all()
    )

    return jsonify([
        university_to_dict(university)
        for university in universities
    ]), 200


@universities_bp.post("")
@jwt_required()
def create_university():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body is required"}), 400

    if not data.get("name"):
        return jsonify({"error": "University name is required"}), 400

    university = University(
        name=data["name"],
        city=data.get("city", "Nairobi"),
    )

    db.session.add(university)
    db.session.commit()

    return jsonify({
        "message": "University created successfully",
        "university": university_to_dict(university)
    }), 201


def university_to_dict(university):
    return {
        "id": university.id,
        "name": university.name,
        "city": university.city,
    }
