from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone

from app.extensions import db
from app.models import HostVerification, User, Notification

host_verification_bp = Blueprint(
    "host_verification",
    __name__,
    url_prefix="/api/host-verification",
)


# ============================================================
# SUBMIT VERIFICATION
# POST /api/host-verification
# ============================================================

@host_verification_bp.post("")
@jwt_required()
def submit_verification():
    """Submit host verification documents"""
    
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    if user.role != "host":
        return jsonify({"error": "Only hosts can submit verification"}), 403
    
    # Check if host already has a verification record
    existing_verification = HostVerification.query.filter_by(host_id=user_id).first()
    
    if existing_verification and existing_verification.status == "pending":
        return jsonify({"error": "You already have a pending verification"}), 409
    
    id_number = data.get("id_number", "").strip()
    document_url = data.get("document_url", "").strip()
    
    if not id_number or not document_url:
        return jsonify({"error": "ID number and document URL are required"}), 400
    
    if len(id_number) < 5:
        return jsonify({"error": "ID number must be at least 5 characters"}), 400
    
    if not document_url.startswith("http"):
        return jsonify({"error": "Document URL must be a valid URL"}), 400
    
    # Create or update verification
    if existing_verification:
        existing_verification.id_number = id_number
        existing_verification.document_url = document_url
        existing_verification.status = "pending"
        existing_verification.notes = None
        existing_verification.updated_at = datetime.now(timezone.utc)
        verification = existing_verification
    else:
        verification = HostVerification(
            host_id=user_id,
            id_number=id_number,
            document_url=document_url,
            status="pending",
        )
        db.session.add(verification)
    
    db.session.commit()
    
    # Send notification to admins (you could add a notification to a dedicated admin user)
    # For now, we'll just log the event
    
    return jsonify({
        "message": "Verification submitted successfully",
        "verification_id": verification.id,
        "status": verification.status,
    }), 201


# ============================================================
# GET MY VERIFICATION STATUS
# GET /api/host-verification/me
# ============================================================

@host_verification_bp.get("/me")
@jwt_required()
def get_my_verification():
    """Get current user's verification status"""
    
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    if user.role != "host":
        return jsonify({"error": "Only hosts can view verification status"}), 403
    
    verification = HostVerification.query.filter_by(host_id=user_id).first()
    
    if not verification:
        return jsonify({
            "message": "No verification submitted yet",
            "verified": False,
        }), 200
    
    return jsonify({
        "id": verification.id,
        "host_id": verification.host_id,
        "id_number": verification.id_number or "",
        "status": verification.status,
        "notes": verification.notes or "",
        "created_at": verification.created_at.isoformat(),
        "updated_at": verification.updated_at.isoformat(),
        "verified": verification.status == "approved",
    }), 200


# ============================================================
# GET VERIFICATION STATUS
# GET /api/host-verification/<host_id>
# ============================================================

@host_verification_bp.get("/<int:host_id>")
def get_host_verification(host_id):
    """Get a host's verification status (public endpoint)"""
    
    host = db.session.get(User, host_id)
    
    if not host or host.role != "host":
        return jsonify({"error": "Host not found"}), 404
    
    verification = HostVerification.query.filter_by(host_id=host_id).first()
    
    if not verification:
        return jsonify({
            "verified": False,
            "status": "not_submitted",
        }), 200
    
    # Only return non-sensitive information
    return jsonify({
        "verified": verification.status == "approved",
        "status": verification.status,
        "created_at": verification.created_at.isoformat(),
    }), 200


# ============================================================
# UPDATE VERIFICATION (SELF)
# PATCH /api/host-verification
# ============================================================

@host_verification_bp.patch("")
@jwt_required()
def update_verification():
    """Update verification information"""
    
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    if user.role != "host":
        return jsonify({"error": "Only hosts can update verification"}), 403
    
    verification = HostVerification.query.filter_by(host_id=user_id).first()
    
    if not verification:
        return jsonify({"error": "No verification found"}), 404
    
    # Can only update if pending or rejected
    if verification.status not in ("pending", "rejected"):
        return jsonify({"error": "Can only update pending or rejected verification"}), 409
    
    if "id_number" in data:
        id_number = data["id_number"].strip()
        if len(id_number) < 5:
            return jsonify({"error": "ID number must be at least 5 characters"}), 400
        verification.id_number = id_number
    
    if "document_url" in data:
        document_url = data["document_url"].strip()
        if not document_url.startswith("http"):
            return jsonify({"error": "Document URL must be a valid URL"}), 400
        verification.document_url = document_url
    
    verification.status = "pending"
    verification.updated_at = datetime.now(timezone.utc)
    db.session.commit()
    
    return jsonify({
        "message": "Verification updated successfully",
        "verification_id": verification.id,
        "status": verification.status,
    }), 200


# ============================================================
# DELETE VERIFICATION
# DELETE /api/host-verification
# ============================================================

@host_verification_bp.delete("")
@jwt_required()
def delete_verification():
    """Delete verification (only if pending or rejected)"""
    
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    if user.role != "host":
        return jsonify({"error": "Only hosts can delete verification"}), 403
    
    verification = HostVerification.query.filter_by(host_id=user_id).first()
    
    if not verification:
        return jsonify({"error": "No verification found"}), 404
    
    if verification.status == "approved":
        return jsonify({"error": "Cannot delete approved verification"}), 409
    
    db.session.delete(verification)
    db.session.commit()
    
    return jsonify({"message": "Verification deleted successfully"}), 200


# ============================================================
# GET VERIFICATION BADGE
# GET /api/host-verification/badge/<host_id>
# ============================================================

@host_verification_bp.get("/badge/<int:host_id>")
def get_verification_badge(host_id):
    """Get verification badge status for display"""
    
    host = db.session.get(User, host_id)
    
    if not host or host.role != "host":
        return jsonify({"error": "Host not found"}), 404
    
    verification = HostVerification.query.filter_by(host_id=host_id).first()
    
    if not verification:
        return jsonify({
            "verified": False,
            "badge_color": "gray",
            "badge_text": "Unverified",
        }), 200
    
    badge_map = {
        "approved": {"verified": True, "badge_color": "green", "badge_text": "Verified"},
        "pending": {"verified": False, "badge_color": "yellow", "badge_text": "Pending"},
        "rejected": {"verified": False, "badge_color": "red", "badge_text": "Rejected"},
    }
    
    badge_info = badge_map.get(verification.status, {"verified": False, "badge_color": "gray", "badge_text": "Unknown"})
    
    return jsonify(badge_info), 200
