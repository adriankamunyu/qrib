import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { Upload, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function HostVerification() {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id_number: "",
    document_url: "",
  });

  useEffect(() => {
    if (user?.role === "host" && token) {
      fetchVerificationStatus();
    }
  }, [token, user]);

  const fetchVerificationStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/host-verification/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setVerification(data);
      }
    } catch (error) {
      console.error("Error fetching verification status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.id_number || !formData.document_url) {
      showToast("Please fill in all fields", "error");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${BACKEND_URL}/api/host-verification`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showToast("Verification submitted successfully", "success");
        fetchVerificationStatus();
        setFormData({ id_number: "", document_url: "" });
      } else {
        const error = await response.json();
        showToast(error.error || "Failed to submit verification", "error");
      }
    } catch (error) {
      showToast("Error submitting verification", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.role !== "host") {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto max-w-md px-6 py-16 text-center">
          <AlertCircle className="mx-auto h-16 w-16 text-amber-500 mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
          <p className="mt-2 text-slate-600">Only hosts can access this page.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-2xl px-6 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black text-slate-900">Host Verification</h1>
          <p className="mt-2 text-slate-600">
            Get verified to build trust with students and unlock unlimited property listings.
          </p>

          {loading ? (
            <div className="mt-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
              <p className="mt-4 text-slate-600">Loading verification status...</p>
            </div>
          ) : verification?.verified ? (
            <div className="mt-8 rounded-xl bg-green-50 border border-green-200 p-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-bold text-green-900">You're Verified!</h2>
                  <p className="mt-1 text-sm text-green-800">
                    Your account has been verified. You can now list unlimited properties and enjoy all host benefits.
                  </p>
                </div>
              </div>
            </div>
          ) : verification?.status === "pending" ? (
            <div className="mt-8 rounded-xl bg-amber-50 border border-amber-200 p-6">
              <div className="flex items-start gap-4">
                <Clock className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-bold text-amber-900">Verification Pending</h2>
                  <p className="mt-1 text-sm text-amber-800">
                    Your verification is under review. We'll notify you once it's complete.
                  </p>
                  <p className="mt-3 text-xs text-amber-700">
                    Submitted: {new Date(verification.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ) : verification?.status === "rejected" ? (
            <div className="mt-8 rounded-xl bg-red-50 border border-red-200 p-6 mb-8">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-bold text-red-900">Verification Rejected</h2>
                  <p className="mt-1 text-sm text-red-800">
                    {verification.notes || "Your verification was rejected. Please try again with updated information."}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {!verification?.verified && (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-900">
                  ID Number *
                </label>
                <input
                  type="text"
                  value={formData.id_number}
                  onChange={(e) =>
                    setFormData({ ...formData, id_number: e.target.value })
                  }
                  placeholder="e.g., ID12345678"
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                />
                <p className="mt-1 text-xs text-slate-600">
                  Your national ID number (at least 5 characters)
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900">
                  ID Document URL *
                </label>
                <input
                  type="url"
                  value={formData.document_url}
                  onChange={(e) =>
                    setFormData({ ...formData, document_url: e.target.value })
                  }
                  placeholder="https://example.com/my-id-document.jpg"
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                />
                <p className="mt-1 text-xs text-slate-600">
                  Paste the URL of your ID document (hosted on a cloud service like Cloudinary or AWS S3)
                </p>
              </div>

              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <p className="text-sm text-blue-900 font-semibold">How to upload your document:</p>
                <ol className="mt-2 text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Take a clear photo of your national ID</li>
                  <li>Upload it to a cloud service (Cloudinary, AWS S3, Google Drive, Dropbox)</li>
                  <li>Get the direct link to the image</li>
                  <li>Paste the URL above</li>
                </ol>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {submitting ? "Submitting..." : "Submit Verification"}
              </button>
            </form>
          )}

          <div className="mt-10 rounded-lg bg-slate-100 p-6">
            <h3 className="font-bold text-slate-900">Benefits of Verification:</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Verified badge on your profile</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Unlimited property listings</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Higher trust rating from students</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Increased visibility in search results</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Access to premium host features</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
