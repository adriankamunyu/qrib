from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import desc, func
from datetime import datetime, timezone

from app.extensions import db
from app.models import Review, Property, User, Booking, Notification

reviews_bp = Blueprint(
    "reviews",
    __name__,
    url_prefix="/api/reviews",
)


# ============================================================
# CREATE REVIEW
# POST /api/reviews
# ============================================================

@reviews_bp.post("")
@jwt_required()
def create_review():
    """Create a new review for a property"""
    
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    
    required_fields = ["property_id", "rating", "comment"]
    missing = [field for field in required_fields if data.get(field) in (None, "")]
    
    if missing:
        return jsonify({"error": "Missing required fields", "fields": missing}), 400
    
    try:
        property_id = int(data["property_id"])
        rating = int(data["rating"])
    except (ValueError, TypeError):
        return jsonify({"error": "property_id and rating must be integers"}), 400
    
    if rating < 1 or rating > 5:
        return jsonify({"error": "Rating must be between 1 and 5"}), 400
    
    comment = data.get("comment", "").strip()
    if len(comment) < 10:
        return jsonify({"error": "Comment must be at least 10 characters"}), 400
    
    user_id = int(get_jwt_identity())
    
    # Verify property exists
    prop = db.session.get(Property, property_id)
    if not prop:
        return jsonify({"error": "Property not found"}), 404
    
    # Check if user is a student and has a completed booking for this property
    user = db.session.get(User, user_id)
    if user.role != "student":
        return jsonify({"error": "Only students can leave reviews"}), 403
    
    completed_booking = Booking.query.filter_by(
        property_id=property_id,
        student_id=user_id,
        status="completed"
    ).first()
    
    if not completed_booking:
        return jsonify({"error": "You must have a completed booking to review this property"}), 403
    
    # Check if user already reviewed this property
    existing_review = Review.query.filter_by(
        property_id=property_id,
        user_id=user_id
    ).first()
    
    if existing_review:
        return jsonify({"error": "You have already reviewed this property"}), 409
    
    # Create review
    review = Review(
        property_id=property_id,
        user_id=user_id,
        rating=rating,
        comment=comment,
    )
    
    db.session.add(review)
    
    # Update property rating (average of all reviews)
    all_reviews = Review.query.filter_by(property_id=property_id).all()
    avg_rating = sum(r.rating for r in all_reviews) / len(all_reviews) if all_reviews else rating
    prop.rating = avg_rating
    
    db.session.commit()
    
    # Notify property host
    notification = Notification(
        user_id=prop.host_id,
        title="New Review",
        body=f"New review for '{prop.title}' - Rating: {rating}/5",
    )
    db.session.add(notification)
    db.session.commit()
    
    return jsonify({
        "message": "Review created successfully",
        "review_id": review.id,
    }), 201


# ============================================================
# GET PROPERTY REVIEWS
# GET /api/reviews/property/<property_id>
# ============================================================

@reviews_bp.get("/property/<int:property_id>")
def get_property_reviews(property_id):
    """Get all reviews for a property"""
    
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 10, type=int)
    
    prop = db.session.get(Property, property_id)
    if not prop:
        return jsonify({"error": "Property not found"}), 404
    
    reviews_pagination = Review.query.filter_by(
        property_id=property_id
    ).order_by(desc(Review.created_at)).paginate(page=page, per_page=limit, error_out=False)
    
    reviews_data = []
    for review in reviews_pagination.items:
        reviews_data.append({
            "id": review.id,
            "user_id": review.user_id,
            "user_name": review.user.name if review.user else "Anonymous",
            "rating": review.rating,
            "comment": review.comment,
            "created_at": review.created_at.isoformat(),
        })
    
    # Calculate rating statistics
    all_ratings = [r.rating for r in Review.query.filter_by(property_id=property_id).all()]
    rating_stats = {
        "average": sum(all_ratings) / len(all_ratings) if all_ratings else 0,
        "total": len(all_ratings),
        "distribution": {
            "five_star": len([r for r in all_ratings if r == 5]),
            "four_star": len([r for r in all_ratings if r == 4]),
            "three_star": len([r for r in all_ratings if r == 3]),
            "two_star": len([r for r in all_ratings if r == 2]),
            "one_star": len([r for r in all_ratings if r == 1]),
        }
    }
    
    return jsonify({
        "data": reviews_data,
        "rating_stats": rating_stats,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": reviews_pagination.total,
            "pages": reviews_pagination.pages,
        }
    }), 200


# ============================================================
# GET REVIEW BY ID
# GET /api/reviews/<review_id>
# ============================================================

@reviews_bp.get("/<int:review_id>")
def get_review(review_id):
    """Get a single review by ID"""
    
    review = db.session.get(Review, review_id)
    
    if not review:
        return jsonify({"error": "Review not found"}), 404
    
    return jsonify({
        "id": review.id,
        "property_id": review.property_id,
        "user_id": review.user_id,
        "user_name": review.user.name if review.user else "Anonymous",
        "rating": review.rating,
        "comment": review.comment,
        "created_at": review.created_at.isoformat(),
    }), 200


# ============================================================
# UPDATE REVIEW
# PATCH /api/reviews/<review_id>
# ============================================================

@reviews_bp.patch("/<int:review_id>")
@jwt_required()
def update_review(review_id):
    """Update a review (only by the author)"""
    
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    
    review = db.session.get(Review, review_id)
    
    if not review:
        return jsonify({"error": "Review not found"}), 404
    
    user_id = int(get_jwt_identity())
    
    # Only the reviewer can update their review
    if review.user_id != user_id:
        return jsonify({"error": "You can only update your own reviews"}), 403
    
    # Update fields if provided
    if "rating" in data:
        try:
            rating = int(data["rating"])
            if rating < 1 or rating > 5:
                return jsonify({"error": "Rating must be between 1 and 5"}), 400
            review.rating = rating
        except (ValueError, TypeError):
            return jsonify({"error": "Rating must be an integer"}), 400
    
    if "comment" in data:
        comment = data["comment"].strip()
        if len(comment) < 10:
            return jsonify({"error": "Comment must be at least 10 characters"}), 400
        review.comment = comment
    
    db.session.commit()
    
    # Update property rating
    prop = review.property
    all_reviews = Review.query.filter_by(property_id=prop.id).all()
    avg_rating = sum(r.rating for r in all_reviews) / len(all_reviews) if all_reviews else 0
    prop.rating = avg_rating
    db.session.commit()
    
    return jsonify({
        "message": "Review updated successfully",
        "review_id": review_id,
    }), 200


# ============================================================
# DELETE REVIEW
# DELETE /api/reviews/<review_id>
# ============================================================

@reviews_bp.delete("/<int:review_id>")
@jwt_required()
def delete_review(review_id):
    """Delete a review (only by the author or admin)"""
    
    review = db.session.get(Review, review_id)
    
    if not review:
        return jsonify({"error": "Review not found"}), 404
    
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    
    # Only the reviewer or admin can delete
    if review.user_id != user_id and user.role != "admin":
        return jsonify({"error": "You can only delete your own reviews"}), 403
    
    property_id = review.property_id
    db.session.delete(review)
    db.session.commit()
    
    # Update property rating
    prop = db.session.get(Property, property_id)
    all_reviews = Review.query.filter_by(property_id=property_id).all()
    avg_rating = sum(r.rating for r in all_reviews) / len(all_reviews) if all_reviews else 0
    prop.rating = avg_rating
    db.session.commit()
    
    return jsonify({"message": "Review deleted successfully"}), 200


# ============================================================
# GET USER REVIEWS
# GET /api/reviews/user/<user_id>
# ============================================================

@reviews_bp.get("/user/<int:user_id>")
def get_user_reviews(user_id):
    """Get all reviews written by a user"""
    
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 10, type=int)
    
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    reviews_pagination = Review.query.filter_by(
        user_id=user_id
    ).order_by(desc(Review.created_at)).paginate(page=page, per_page=limit, error_out=False)
    
    reviews_data = []
    for review in reviews_pagination.items:
        reviews_data.append({
            "id": review.id,
            "property_id": review.property_id,
            "property_title": review.property.title if review.property else "Unknown",
            "rating": review.rating,
            "comment": review.comment,
            "created_at": review.created_at.isoformat(),
        })
    
    return jsonify({
        "data": reviews_data,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": reviews_pagination.total,
            "pages": reviews_pagination.pages,
        }
    }), 200
