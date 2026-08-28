import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PropertyCard from "../components/PropertyCard";

const API_URL = "http://172.29.254.86:5000/api";
const SAVED_LISTINGS_KEY = "qrib_saved_listings";
const TOKEN_KEY = "qrib_access_token";

function loadSavedIds() {
  try {
    const data = localStorage.getItem(SAVED_LISTINGS_KEY);
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeProperty(property) {
  return {
    id: property.id,
    title: property.title || "Student Accommodation",
    area: property.area || "",
    city: property.city || "",
    description: property.description || "",
    image:
      property.image ||
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&q=80",
    pricePerMonth: Number(property.price_per_month || 0),
    propertyType: property.property_type || "Accommodation",
    type: property.property_type || "Accommodation",
    bedrooms: Number(property.bedrooms || 0),
    bathrooms: Number(property.bathrooms || 0),
    distanceKm: Number(property.distance_km || 0),
    rating: Number(property.rating || 0),
    furnished: Boolean(property.furnished),
    verifiedHost: Boolean(property.verified_host),
    universityId: property.university_id,
    universityName: property.university_name || "",
  };
}

export default function SavedHomes() {
  const [savedIds, setSavedIds] = useState(loadSavedIds);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchProperties() {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem(TOKEN_KEY);
        const headers = { Accept: "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const response = await fetch(`${API_URL}/properties`, {
          method: "GET",
          headers,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || data.message || "Unable to load properties.");
        }

        const properties = Array.isArray(data)
          ? data
          : Array.isArray(data.properties)
          ? data.properties
          : [];

        if (!cancelled) {
          setListings(properties.map(normalizeProperty));
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Unable to load saved homes.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProperties();
    return () => { cancelled = true; };
  }, []);

  function unsave(id) {
    setSavedIds((current) => {
      const next = current.filter((savedId) => savedId !== id);
      localStorage.setItem(SAVED_LISTINGS_KEY, JSON.stringify(next));
      return next;
    });
  }

  const savedListings = listings.filter((l) => savedIds.includes(l.id));

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <Navbar />

      <main className="mx-auto max-w-[1280px] px-5 py-10 sm:px-8 lg:px-10">
        <Link
          to="/student/dashboard"
          className="text-sm font-semibold text-blue-600 hover:underline"
        >
          ← Back to dashboard
        </Link>

        <div className="mt-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Saved homes</h1>
            <p className="mt-2 text-slate-500">
              Properties you have shortlisted.
            </p>
          </div>

          {savedListings.length > 0 && (
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-600">
              {savedListings.length} saved
            </span>
          )}
        </div>

        <div className="mt-8">
          {/* LOADING */}
          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
              <p className="mt-4 text-sm font-semibold text-slate-600">
                Loading your saved homes...
              </p>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <p className="font-bold text-red-700">Could not load properties</p>
              <p className="mt-2 text-sm text-red-600">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 transition"
              >
                Try again
              </button>
            </div>
          )}

          {/* EMPTY */}
          {!loading && !error && savedListings.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                <HeartIcon />
              </div>
              <h2 className="mt-4 font-black text-slate-800">No saved homes yet</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                Browse accommodation and tap the heart icon to save properties here.
              </p>
              <Link
                to="/search"
                className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 transition"
              >
                Find accommodation
              </Link>
            </div>
          )}

          {/* SAVED LISTINGS */}
          {!loading && !error && savedListings.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {savedListings.map((listing) => (
                <div key={listing.id} className="relative">
                  <PropertyCard listing={listing} />

                  {/* Unsave button */}
                  <button
                    type="button"
                    aria-label="Remove from saved homes"
                    onClick={() => unsave(listing.id)}
                    className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition hover:bg-red-500"
                  >
                    <HeartIcon filled />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function HeartIcon({ filled = false }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M20.8 8.8c0 5-8.8 10.2-8.8 10.2S3.2 13.8 3.2 8.8A4.8 4.8 0 0 1 8 4c1.4 0 2.7.6 4 2 1.3-1.4 2.6-2 4-2a4.8 4.8 0 0 1 4.8 4.8Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
