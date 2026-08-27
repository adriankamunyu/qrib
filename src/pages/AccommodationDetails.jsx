import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  CheckCircle2,
  Home,
  MapPin,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getUniversity } from "../data/universities";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import PropertyWeather from "../components/PropertyWeather";

const API_URL = "http://172.29.254.86:5000/api";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1400&q=85";

function normalizeProperty(property) {
  if (!property) return null;

  return {
    id: property.id,
    title: property.title || "Student Accommodation",
    area: property.area || "",
    city: property.city || "",
    description:
      property.description ||
      "Comfortable student accommodation in a convenient location.",
    image: property.image || FALLBACK_IMAGE,
    pricePerMonth: Number(property.price_per_month || 0),
    propertyType: property.property_type || "Accommodation",
    bedrooms: Number(property.bedrooms || 0),
    bathrooms: Number(property.bathrooms || 0),
    distanceKm: Number(property.distance_km || 0),
    rating: Number(property.rating || 0),
    furnished: Boolean(property.furnished),
    verifiedHost: Boolean(property.verified_host),
    hostId: property.host_id,
    universityId: property.university_id,
    universityName: property.university_name || "",
    latitude: property.latitude,
    longitude: property.longitude,
    amenities: Array.isArray(property.amenities)
      ? property.amenities
      : [],
  };
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto max-w-[1200px] px-6 py-10 lg:px-10">
        <div className="animate-pulse">
          <div className="mb-8 h-5 w-32 rounded bg-slate-200" />

          <div className="grid gap-10 lg:grid-cols-2">
            <div className="h-[480px] rounded-2xl bg-slate-200" />

            <div className="space-y-6">
              <div className="h-6 w-28 rounded bg-slate-200" />
              <div className="h-12 w-3/4 rounded bg-slate-200" />
              <div className="h-5 w-1/2 rounded bg-slate-200" />
              <div className="h-10 w-40 rounded bg-slate-200" />
              <div className="h-28 w-full rounded bg-slate-200" />
              <div className="h-20 w-full rounded bg-slate-200" />
              <div className="h-14 w-full rounded-xl bg-slate-200" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ErrorState({ error }) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto flex min-h-[65vh] max-w-4xl items-center justify-center px-6 py-20">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Home className="h-8 w-8 text-slate-500" />
          </div>

          <h1 className="mt-6 text-3xl font-extrabold text-slate-900">
            Property not found
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-slate-500">
            {error ||
              "This accommodation could not be found or is no longer available."}
          </p>

          <Link
            to="/search"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-bold text-white transition hover:opacity-90"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse properties
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function AccommodationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { showToast } = useToast();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return undefined;

    let cancelled = false;

    async function fetchProperty() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/properties/${id}`);

        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (!response.ok) {
          throw new Error(
            data.error ||
              data.message ||
              "Unable to load property."
          );
        }

        const property = data.property || data;
        const normalizedProperty = normalizeProperty(property);

        if (!normalizedProperty) {
          throw new Error("Property data is unavailable.");
        }

        if (!cancelled) {
          setListing(normalizedProperty);
        }
      } catch (err) {
        console.error("Property details error:", err);

        if (!cancelled) {
          setError(
            err.message || "Unable to load this accommodation."
          );
          setListing(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProperty();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleBooking = () => {
    if (!user) {
      showToast(
        "Please log in before booking this accommodation.",
        "error"
      );

      navigate("/login");
      return;
    }

    navigate(`/booking/${listing.id}`);
  };

  if (!id) {
    return <ErrorState error="No property was selected." />;
  }

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!listing) {
    return <ErrorState error={error} />;
  }

  const university = getUniversity(listing.universityId);

  const universityName =
    university?.name ||
    listing.universityName ||
    "University campus";

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-[1200px] px-6 py-8 lg:px-10 lg:py-12">
        <Link
          to="/search"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to search
        </Link>

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative">
            <img
              src={listing.image}
              alt={listing.title}
              className="h-[320px] w-full object-cover sm:h-[420px] lg:h-[520px]"
              onError={(event) => {
                event.currentTarget.src = FALLBACK_IMAGE;
              }}
            />

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-6 lg:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  {listing.verifiedHost && (
                    <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm">
                      <ShieldCheck className="h-4 w-4" />
                      Verified host
                    </span>
                  )}

                  <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
                    {listing.title}
                  </h1>

                  <div className="mt-2 flex items-center gap-2 text-sm font-medium text-white/90">
                    <MapPin className="h-4 w-4" />

                    <span>
                      {listing.area}
                      {listing.area && listing.city ? ", " : ""}
                      {listing.city}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-white px-5 py-3 shadow-lg">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Monthly rent
                  </p>

                  <p className="mt-1 text-2xl font-extrabold text-slate-900">
                    KSh {listing.pricePerMonth.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-10 p-6 lg:grid-cols-[1fr_360px] lg:p-10">
            <div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <BedDouble className="h-5 w-5 text-brand" />

                  <p className="mt-3 text-lg font-extrabold text-slate-900">
                    {listing.bedrooms}
                  </p>

                  <p className="text-sm text-slate-500">
                    {listing.bedrooms === 1
                      ? "Bedroom"
                      : "Bedrooms"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <Bath className="h-5 w-5 text-brand" />

                  <p className="mt-3 text-lg font-extrabold text-slate-900">
                    {listing.bathrooms}
                  </p>

                  <p className="text-sm text-slate-500">
                    {listing.bathrooms === 1
                      ? "Bathroom"
                      : "Bathrooms"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <Star className="h-5 w-5 fill-current text-amber-500" />

                  <p className="mt-3 text-lg font-extrabold text-slate-900">
                    {listing.rating > 0
                      ? listing.rating.toFixed(1)
                      : "New"}
                  </p>

                  <p className="text-sm text-slate-500">Rating</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <Building2 className="h-5 w-5 text-brand" />

                  <p className="mt-3 truncate text-lg font-extrabold text-slate-900">
                    {listing.propertyType}
                  </p>

                  <p className="text-sm text-slate-500">
                    Property type
                  </p>
                </div>
              </div>

              <section className="mt-10">
                <h2 className="text-2xl font-extrabold text-slate-900">
                  About this accommodation
                </h2>

                <p className="mt-4 leading-7 text-slate-600">
                  {listing.description}
                </p>
              </section>

              <section className="mt-10">
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Property features
                </h2>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {listing.furnished && (
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />

                      <div>
                        <p className="font-bold text-slate-900">
                          Furnished
                        </p>

                        <p className="text-sm text-slate-500">
                          Furnished accommodation
                        </p>
                      </div>
                    </div>
                  )}

                  {listing.verifiedHost && (
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                      <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />

                      <div>
                        <p className="font-bold text-slate-900">
                          Verified host
                        </p>

                        <p className="text-sm text-slate-500">
                          Host identity has been verified
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                    <MapPin className="h-5 w-5 shrink-0 text-brand" />

                    <div>
                      <p className="font-bold text-slate-900">
                        Convenient location
                      </p>

                      <p className="text-sm text-slate-500">
                        {listing.distanceKm > 0
                          ? `${listing.distanceKm} km from campus`
                          : "Campus distance available"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                    <Home className="h-5 w-5 shrink-0 text-brand" />

                    <div>
                      <p className="font-bold text-slate-900">
                        Student accommodation
                      </p>

                      <p className="text-sm text-slate-500">
                        Suitable for university students
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {listing.amenities.length > 0 && (
                <section className="mt-10">
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    Amenities
                  </h2>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {listing.amenities.map((amenity, index) => (
                      <div
                        key={`${amenity}-${index}`}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        {amenity}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="mt-10">
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Nearby university
                </h2>

                <div className="mt-5 flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/10">
                    <Building2 className="h-6 w-6 text-brand" />
                  </div>

                  <div>
                    <p className="font-bold text-slate-900">
                      {universityName}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {listing.distanceKm > 0
                        ? `${listing.distanceKm} km from the accommodation`
                        : "Nearby campus"}
                    </p>
                  </div>
                </div>
              </section>

              <PropertyWeather
                city={listing.city}
                latitude={listing.latitude}
                longitude={listing.longitude}
              />
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Monthly rent
                    </p>

                    <p className="mt-1 text-3xl font-extrabold text-slate-900">
                      KSh {listing.pricePerMonth.toLocaleString()}
                    </p>
                  </div>

                  {listing.rating > 0 && (
                    <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1.5 text-sm font-bold text-amber-700">
                      <Star className="h-4 w-4 fill-current" />
                      {listing.rating.toFixed(1)}
                    </div>
                  )}
                </div>

                <div className="my-6 h-px bg-slate-200" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Property type
                    </span>

                    <span className="font-bold text-slate-900">
                      {listing.propertyType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Bedrooms</span>

                    <span className="font-bold text-slate-900">
                      {listing.bedrooms}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Bathrooms
                    </span>

                    <span className="font-bold text-slate-900">
                      {listing.bathrooms}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Campus distance
                    </span>

                    <span className="font-bold text-slate-900">
                      {listing.distanceKm > 0
                        ? `${listing.distanceKm} km`
                        : "Available"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleBooking}
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-4 font-extrabold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Book this accommodation
                </button>

                <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                  You will need to be logged in before you can
                  continue with a booking.
                </p>

                {user && (
                  <div className="mt-5 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10">
                      <UserRound className="h-5 w-5 text-brand" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-500">
                        Signed in as
                      </p>

                      <p className="truncate text-sm font-bold text-slate-900">
                        {user.name ||
                          user.email ||
                          "Authenticated user"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}