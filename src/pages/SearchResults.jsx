import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PropertyCard from "../components/PropertyCard";
import MapView from "../components/MapView";

const API_URL = "http://172.29.254.86:5000/api";

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

    propertyType:
      property.property_type || "Accommodation",

    type:
      property.property_type || "Accommodation",

    bedrooms: Number(property.bedrooms || 0),
    bathrooms: Number(property.bathrooms || 0),

    distanceKm: Number(property.distance_km || 0),
    rating: Number(property.rating || 0),

    furnished: Boolean(property.furnished),
    verifiedHost: Boolean(property.verified_host),

    hostId: property.host_id,
    universityId: property.university_id,
    universityName: property.university_name || "",

    amenities: property.amenities || [],
  };
}

export default function SearchResults() {
  const [searchParams] = useSearchParams();

  const query = searchParams.get("q") || "";
  const area = searchParams.get("area") || "";
  const budget = searchParams.get("budget") || "Any budget";
  const propertyType =
    searchParams.get("type") || "Any type";

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchProperties() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/properties`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              data.message ||
              "Unable to load properties."
          );
        }

        const normalized = Array.isArray(data)
          ? data.map(normalizeProperty)
          : [];

        if (!cancelled) {
          setListings(normalized);
        }
      } catch (err) {
        console.error("Search property loading error:", err);

        if (!cancelled) {
          setError(
            err.message ||
              "Unable to load accommodation."
          );
          setListings([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProperties();

    return () => {
      cancelled = true;
    };
  }, []);

  const results = useMemo(() => {
    let result = [...listings];

    const normalizedQuery = query
      .trim()
      .toLowerCase();

    const normalizedArea = area
      .trim()
      .toLowerCase();

    // SEARCH
    if (normalizedQuery) {
      result = result.filter((listing) => {
        const values = [
          listing.title,
          listing.area,
          listing.city,
          listing.propertyType,
          listing.universityName,
          listing.description,
        ];

        return values
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(normalizedQuery)
          );
      });
    }

    // AREA
    if (normalizedArea) {
      result = result.filter((listing) =>
        String(listing.area || "")
          .toLowerCase()
          .includes(normalizedArea)
      );
    }

    // BUDGET
    if (budget !== "Any budget") {
      result = result.filter((listing) => {
        const price = Number(
          listing.pricePerMonth || 0
        );

        switch (budget) {
          case "Under KSh 10,000":
            return price < 10000;

          case "KSh 10,000 - 15,000":
            return (
              price >= 10000 &&
              price <= 15000
            );

          case "KSh 15,000 - 25,000":
            return (
              price > 15000 &&
              price <= 25000
            );

          case "Above KSh 25,000":
            return price > 25000;

          default:
            return true;
        }
      });
    }

    // PROPERTY TYPE
    if (propertyType !== "Any type") {
      result = result.filter((listing) => {
        const type = String(
          listing.propertyType ||
            listing.type ||
            ""
        ).toLowerCase();

        return (
          type === propertyType.toLowerCase()
        );
      });
    }

    return result;
  }, [
    listings,
    query,
    area,
    budget,
    propertyType,
  ]);

  const activeFilters = [
    query,
    area,
    budget !== "Any budget" ? budget : "",
    propertyType !== "Any type"
      ? propertyType
      : "",
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <Navbar />

      <main className="mx-auto max-w-[1440px] px-6 py-10 lg:px-20">

        {/* HEADER */}

        <div className="mb-8">
          <Link
            to="/student/dashboard"
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            ← Back to dashboard
          </Link>

          <h1 className="mt-4 text-3xl font-black text-slate-900">
            Find accommodation
          </h1>

          <p className="mt-2 text-slate-500">
            Search student accommodation available
            on Qrib.
          </p>

          {activeFilters.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <span
                  key={filter}
                  className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700"
                >
                  {filter}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="font-bold text-red-700">
              Could not load properties
            </p>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white"
            >
              Try again
            </button>
          </div>
        )}

        {/* RESULTS */}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_420px]">

          <section>
            <div className="mb-5 flex items-center justify-between">
              <p className="font-bold text-slate-900">
                {loading
                  ? "Loading..."
                  : `${results.length} ${
                      results.length === 1
                        ? "property"
                        : "properties"
                    } found`}
              </p>

              <Link
                to="/search"
                className="text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </Link>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                <p className="mt-4 text-sm font-semibold text-slate-600">
                  Loading accommodation...
                </p>
              </div>
            ) : results.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <h2 className="text-xl font-black text-slate-900">
                  No accommodation found
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Try changing your search or filters.
                </p>

                <Link
                  to="/search"
                  className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
                >
                  View all properties
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {results.map((listing) => (
                  <PropertyCard
                    key={listing.id}
                    listing={listing}
                  />
                ))}
              </div>
            )}
          </section>

          {/* MAP */}

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <MapView listings={results} />
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
