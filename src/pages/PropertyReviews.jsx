import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { Star, Trash2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function PropertyReviews() {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [propertyId, setPropertyId] = useState(null);
  const [userReview, setUserReview] = useState(null);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: "",
  });

  // Assuming propertyId is passed via route params or context
  useEffect(() => {
    // This should be passed from parent component or URL params
    const id = new URLSearchParams(window.location.search).get("property_id") || 1;
    setPropertyId(id);
    if (id) fetchReviews(id);
  }, [token]);

  const fetchReviews = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BACKEND_URL}/api/reviews/property/${id}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (response.ok) {
        const data = await response.json();
        setReviews(data.data);
        setRatingStats(data.rating_stats);
        
        // Check if user has reviewed this property
        const userRev = data.data.find((r) => r.user_id === user?.id);
        setUserReview(userRev);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!token) {
      showToast("Please log in to leave a review", "error");
      return;
    }

    if (formData.comment.length < 10) {
      showToast("Comment must be at least 10 characters", "error");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${BACKEND_URL}/api/reviews`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          property_id: parseInt(propertyId),
          rating: formData.rating,
          comment: formData.comment,
        }),
      });

      if (response.ok) {
        showToast("Review submitted successfully", "success");
        setFormData({ rating: 5, comment: "" });
        fetchReviews(propertyId);
      } else {
        const error = await response.json();
        showToast(error.error || "Failed to submit review", "error");
      }
    } catch (error) {
      showToast("Error submitting review", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        showToast("Review deleted", "success");
        fetchReviews(propertyId);
      }
    } catch (error) {
      showToast("Error deleting review", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black text-slate-900">Reviews</h1>

          {loading ? (
            <div className="mt-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
            </div>
          ) : (
            <>
              {/* Rating Summary */}
              {ratingStats && (
                <div className="mt-8 grid grid-cols-2 gap-6 rounded-xl bg-blue-50 border border-blue-200 p-6">
                  <div>
                    <p className="text-sm text-blue-600 font-semibold">Average Rating</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-4xl font-black text-blue-900">
                        {ratingStats.average.toFixed(1)}
                      </span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i <= Math.round(ratingStats.average)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-semibold">Total Reviews</p>
                    <p className="mt-2 text-4xl font-black text-blue-900">
                      {ratingStats.total}
                    </p>
                  </div>
                </div>
              )}

              {/* Rating Distribution */}
              {ratingStats && (
                <div className="mt-8 space-y-3">
                  <h3 className="font-bold text-slate-900">Rating Breakdown</h3>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-4">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i <= star
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400"
                          style={{
                            width: `${
                              ratingStats.total > 0
                                ? (ratingStats.distribution[`${star}_star`] /
                                    ratingStats.total) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-600 w-8">
                        {ratingStats.distribution[`${star}_star`]}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Review Form */}
              {user?.role === "student" && !userReview && (
                <form onSubmit={handleSubmitReview} className="mt-8 space-y-6 rounded-xl bg-slate-50 border border-slate-200 p-6">
                  <h2 className="font-bold text-slate-900">Leave a Review</h2>

                  <div>
                    <label className="block text-sm font-bold text-slate-900">
                      Rating *
                    </label>
                    <div className="mt-3 flex gap-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating: i })}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-8 w-8 cursor-pointer transition ${
                              i <= formData.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900">
                      Your Review *
                    </label>
                    <textarea
                      value={formData.comment}
                      onChange={(e) =>
                        setFormData({ ...formData, comment: e.target.value })
                      }
                      placeholder="Share your experience with this property..."
                      rows="4"
                      className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-slate-600">
                      {formData.comment.length} characters (minimum 10)
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Submitting..." : "Post Review"}
                  </button>
                </form>
              )}

              {userReview && (
                <div className="mt-8 rounded-xl bg-blue-50 border border-blue-200 p-4">
                  <p className="text-sm text-blue-900 font-semibold">
                    You've already reviewed this property
                  </p>
                </div>
              )}

              {/* Reviews List */}
              <div className="mt-8 space-y-4">
                <h2 className="font-bold text-slate-900">All Reviews</h2>
                {reviews.length === 0 ? (
                  <p className="text-slate-600">No reviews yet. Be the first to review!</p>
                ) : (
                  reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-lg border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900">{review.user_name}</p>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i <= review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-slate-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {user?.id === review.user_id && (
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <p className="mt-2 text-slate-700">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
