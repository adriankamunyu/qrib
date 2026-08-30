from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func

from app.extensions import db
from app.models import Property, User, University


properties_bp = Blueprint(
    "properties",
    __name__,
    url_prefix="/api/properties"
)


# ============================================================
# SERIALIZE PROPERTY
# ============================================================

def property_to_dict(property):
    return {
        "id": property.id,
        "title": property.title,
        "area": property.area,
        "city": property.city,
        "description": property.description,
        "price_per_month": float(property.price_per_month),
        "property_type": property.property_type,
        "bedrooms": property.bedrooms,
        "bathrooms": property.bathrooms,
        "furnished": property.furnished,
        "image": property.image or "",
        "distance_km": float(property.distance_km or 0),
        "rating": float(property.rating or 0),
        "verified_host": property.verified_host,
        "host_id": property.host_id,
        "university_id": property.university_id,
        "created_at": property.created_at.isoformat(),
    }


def normalize_university_id(value):
    if value is None or value == "":
        raise ValueError("University ID is required")

    if isinstance(value, str):
        value = value.strip()

        if value.isdigit():
            value = int(value)
        else:
            slug_map = {
                "uon": "University of Nairobi",
                "ku": "Kenyatta University",
                "jkuat": "Jomo Kenyatta University of Agriculture and Technology",
                "strathmore": "Strathmore University",
                "usiu": "United States International University - Africa",
                "moi": "Moi University",
                "egerton": "Egerton University",
            }

            lookup_name = slug_map.get(value.lower())
            if lookup_name:
                university = University.query.filter(
                    func.lower(University.name) == lookup_name.lower()
                ).first()
                if university:
                    return university.id
                raise ValueError(f"University '{lookup_name}' was not found")

            try:
                value = int(value)
            except (TypeError, ValueError):
                raise ValueError("University ID must be a valid integer or university slug")

    if isinstance(value, float) and value.is_integer():
        value = int(value)

    if not isinstance(value, int):
        raise ValueError("University ID must be a valid integer or university slug")

    university = db.session.get(University, value)
    if not university:
        raise ValueError(f"University with ID {value} was not found")

    return value


# ============================================================
# CREATE PROPERTY
# POST /api/properties
# ============================================================

@properties_bp.post("")
@jwt_required()
def create_property():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    required_fields = [
        "title",
        "area",
        "city",
        "description",
        "price_per_month",
        "property_type",
        "university_id",
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

    try:
        normalized_university_id = normalize_university_id(data["university_id"])
    except ValueError as exc:
        return jsonify({
            "error": str(exc)
        }), 400

    user_id = int(get_jwt_identity())

    user = db.session.get(User, user_id)

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    if user.role != "host":
        return jsonify({
            "error": "Only hosts can create properties"
        }), 403

    property = Property(
        title=data["title"],
        area=data["area"],
        city=data["city"],
        description=data["description"],
        price_per_month=data["price_per_month"],
        property_type=data["property_type"],
        bedrooms=data.get("bedrooms", 1),
        bathrooms=data.get("bathrooms", 1),
        furnished=data.get("furnished", True),
        image=data.get("image"),
        distance_km=data.get("distance_km", 0),
        rating=data.get("rating", 0),
        verified_host=False,
        host_id=user_id,
        university_id=normalized_university_id,
    )

    db.session.add(property)
    db.session.commit()

    return jsonify({
        "message": "Property created successfully",
        "property": property_to_dict(property)
    }), 201


# ============================================================
# GET ALL PROPERTIES
# GET /api/properties
# ============================================================

@properties_bp.get("")
def get_properties():

    properties = (
        Property.query
        .order_by(Property.created_at.desc())
        .all()
    )

    return jsonify([
        property_to_dict(property)
        for property in properties
    ]), 200


# ============================================================
# GET SINGLE PROPERTY
# GET /api/properties/<property_id>
# ============================================================

@properties_bp.get("/<int:property_id>")
def get_property(property_id):

    property = db.session.get(
        Property,
        property_id
    )

    if not property:
        return jsonify({
            "error": "Property not found"
        }), 404

    return jsonify({
        "property": property_to_dict(property)
    }), 200


# ============================================================
# UPDATE PROPERTY
# PATCH /api/properties/<property_id>
# ============================================================

@properties_bp.patch("/<int:property_id>")
@jwt_required()
def update_property(property_id):

    property = db.session.get(
        Property,
        property_id
    )

    if not property:
        return jsonify({
            "error": "Property not found"
        }), 404

    user_id = int(get_jwt_identity())

    if property.host_id != user_id:
        return jsonify({
            "error": "You can only edit your own property"
        }), 403

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    allowed_fields = [
        "title",
        "area",
        "city",
        "description",
        "price_per_month",
        "property_type",
        "bedrooms",
        "bathrooms",
        "furnished",
        "image",
        "distance_km",
    ]

    for field in allowed_fields:

        if field in data:
            setattr(property, field, data[field])

    db.session.commit()

    return jsonify({
        "message": "Property updated successfully",
        "property": property_to_dict(property)
    }), 200


# ============================================================
# DELETE PROPERTY
# DELETE /api/properties/<property_id>
# ============================================================

@properties_bp.delete("/<int:property_id>")
@jwt_required()
def delete_property(property_id):

    property = db.session.get(
        Property,
        property_id
    )

    if not property:
        return jsonify({
            "error": "Property not found"
        }), 404

    user_id = int(get_jwt_identity())

    if property.host_id != user_id:
        return jsonify({
            "error": "You can only delete your own property"
        }), 403

    db.session.delete(property)
    db.session.commit()

    return jsonify({
        "message": "Property deleted successfully"
    }), 200
