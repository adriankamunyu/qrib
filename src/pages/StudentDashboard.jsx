import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PropertyCard from "../components/PropertyCard";
import { useAuth } from "../context/useAuth";

const API_URL = import.meta.env.VITE_API_URL;

const SAVED_LISTINGS_KEY = "qrib_saved_listings";
const TOKEN_KEY = "qrib_access_token";

/* =========================================================
   NORMALIZE PROPERTY
========================================================= */

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

    distanceKm:
      property.distance_km !== null &&
      property.distance_km !== undefined
        ? Number(property.distance_km)
        : null,

    rating: Number(property.rating || 0),

    furnished: Boolean(property.furnished),

    verifiedHost: Boolean(property.verified_host),

    hostId: property.host_id,

    universityId: property.university_id,

    universityName: property.university_name || "",

    latitude:
      property.latitude !== undefined
        ? Number(property.latitude)
        : null,

    longitude:
      property.longitude !== undefined
        ? Number(property.longitude)
        : null,
  };
}

/* =========================================================
   LOAD SAVED LISTINGS
========================================================= */

function loadSavedListings() {
  try {
    const data = localStorage.getItem(SAVED_LISTINGS_KEY);

    if (!data) {
      return [];
    }

    const parsed = JSON.parse(data);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/* =========================================================
   STUDENT DASHBOARD
========================================================= */

export default function StudentDashboard() {
  const { user } = useAuth();

  const navigate = useNavigate();

  /* =======================================================
     STATE
  ======================================================= */

  const [search, setSearch] = useState("");

  const [budget, setBudget] = useState("Any budget");

  const [propertyType, setPropertyType] =
    useState("Any type");

  const [listings, setListings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [savedIds, setSavedIds] =
    useState(loadSavedListings);

  /* =======================================================
     LOAD REAL PROPERTIES FROM FLASK API
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function fetchProperties() {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem(TOKEN_KEY);

        const headers = {
          Accept: "application/json",
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(
          `${API_URL}/properties`,
          {
            method: "GET",
            headers,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              data.message ||
              "Unable to load properties."
          );
        }

        const properties = Array.isArray(data)
          ? data
          : Array.isArray(data.properties)
          ? data.properties
          : [];

        const normalized = properties.map(
          normalizeProperty
        );

        if (!cancelled) {
          setListings(normalized);
        }
      } catch (err) {
        console.error(
          "Property loading error:",
          err
        );

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

  /* =======================================================
     FILTER LISTINGS
  ======================================================= */

  const filteredListings = useMemo(() => {
    let result = [...listings];

    const query = search.trim().toLowerCase();

    /* -------------------------------------------------------
       SEARCH
    ------------------------------------------------------- */

    if (query) {
      result = result.filter((listing) => {
        const searchableValues = [
          listing.title,
          listing.area,
          listing.city,
          listing.type,
          listing.propertyType,
          listing.universityName,
          listing.description,
        ];

        return searchableValues
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(query)
          );
      });
    }

    /* -------------------------------------------------------
       BUDGET
    ------------------------------------------------------- */

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

    /* -------------------------------------------------------
       PROPERTY TYPE
    ------------------------------------------------------- */

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
    search,
    budget,
    propertyType,
  ]);

  /* =======================================================
     FEATURED LISTINGS
  ======================================================= */

  const featuredListings =
    filteredListings.slice(0, 6);

  /* =======================================================
     USER
  ======================================================= */

  const savedProfile = (() => {
    try {
      return JSON.parse(localStorage.getItem("qrib_student_profile")) || {};
    } catch {
      return {};
    }
  })();

  const profileCompletion = (() => {
    const fields = [
      savedProfile.phone,
      savedProfile.university,
      savedProfile.course,
      savedProfile.yearOfStudy,
      savedProfile.studentId,
      savedProfile.bio,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  })();

  const firstName = user?.name
    ? user.name.split(" ")[0]
    : "Student";

  const initials = getInitials(
    user?.name || "Student"
  );

  /* =======================================================
     SAVE / UNSAVE PROPERTY
  ======================================================= */

  function toggleSaved(listingId) {
    setSavedIds((current) => {
      const exists = current.includes(listingId);

      const next = exists
        ? current.filter(
            (id) => id !== listingId
          )
        : [...current, listingId];

      localStorage.setItem(
        SAVED_LISTINGS_KEY,
        JSON.stringify(next)
      );

      return next;
    });
  }

  /* =======================================================
     SEARCH PAGE
     
     We now pass the filters to /search instead of simply
     opening the search page with no context.
  ======================================================= */

  function handleSearch() {
    const params = new URLSearchParams();

    if (search.trim()) {
      params.set(
        "q",
        search.trim()
      );
    }

    if (budget !== "Any budget") {
      params.set("budget", budget);
    }

    if (propertyType !== "Any type") {
      params.set(
        "type",
        propertyType
      );
    }

    const queryString = params.toString();

    navigate(
      queryString
        ? `/search?${queryString}`
        : "/search"
    );
  }

  /* =======================================================
     AREA SEARCH
  ======================================================= */

  function handleAreaSearch(area) {
    setSearch(area);

    navigate(
      `/search?q=${encodeURIComponent(area)}`
    );
  }

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  function clearFilters() {
    setSearch("");
    setBudget("Any budget");
    setPropertyType("Any type");
  }

  /* =======================================================
     RETRY
  ======================================================= */

  function retryLoading() {
    window.location.reload();
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <Navbar />

      <main>
        {/* =================================================
            HERO
        ================================================== */}

        <section className="relative overflow-hidden bg-slate-950">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950" />

          <div className="absolute -right-32 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-3xl" />

          <div className="absolute -left-40 bottom-[-180px] h-[500px] w-[500px] rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative mx-auto max-w-[1280px] px-5 py-10 sm:px-8 lg:px-10 lg:py-16">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-blue-200">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />

                Student accommodation in Kenya
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                Find a place that feels like home.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Discover real student-friendly apartments,
                rooms and residences close to your university.
              </p>
            </div>

            {/* =================================================
                SEARCH PANEL
            ================================================== */}

            <div className="mt-9 rounded-2xl border border-white/10 bg-white p-3 shadow-2xl">
              <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr_1fr_auto]">

                {/* SEARCH */}

                <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                  <SearchIcon />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    placeholder="Search university, area or property"
                    className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>

                {/* BUDGET */}

                <select
                  value={budget}
                  onChange={(event) =>
                    setBudget(
                      event.target.value
                    )
                  }
                  className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none"
                >
                  <option>
                    Any budget
                  </option>

                  <option>
                    Under KSh 10,000
                  </option>

                  <option>
                    KSh 10,000 - 15,000
                  </option>

                  <option>
                    KSh 15,000 - 25,000
                  </option>

                  <option>
                    Above KSh 25,000
                  </option>
                </select>

                {/* PROPERTY TYPE */}

                <select
                  value={propertyType}
                  onChange={(event) =>
                    setPropertyType(
                      event.target.value
                    )
                  }
                  className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none"
                >
                  <option>
                    Any type
                  </option>

                  <option>
                    Studio
                  </option>

                  <option>
                    Apartment
                  </option>

                  <option>
                    Bedsitter
                  </option>

                  <option>
                    Hostel
                  </option>

                  <option>
                    Single Room
                  </option>
                </select>

                {/* SEARCH BUTTON */}

                <button
                  type="button"
                  onClick={handleSearch}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  Search
                  <ArrowIcon />
                </button>
              </div>
            </div>

            {/* =================================================
                POPULAR AREAS
            ================================================== */}

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-semibold text-slate-400">
                Popular:
              </span>

              {[
                "Roysambu",
                "Kasarani",
                "Parklands",
                "Kilimani",
                "Madaraka",
              ].map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() =>
                    handleAreaSearch(area)
                  }
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* =================================================
            CONTENT
        ================================================== */}

        <div className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8 lg:px-10 lg:py-12">

          {/* =================================================
              WELCOME
          ================================================== */}

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                Your Qrib dashboard
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Welcome back, {firstName}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Here is what is happening with your
                accommodation search.
              </p>
            </div>

            <Link
              to="/search"
              className="hidden items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 sm:flex"
            >
              Explore all homes
              <ArrowIcon />
            </Link>
          </div>

          {/* =================================================
              STATS
          ================================================== */}

          <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <DashboardStat
              icon={<HeartIcon />}
              label="Saved homes"
              value={savedIds.length}
              description="Your shortlisted properties"
            />

            <DashboardStat
              icon={<DocumentIcon />}
              label="Applications"
              value="0"
              description="Accommodation requests"
            />

            <DashboardStat
              icon={<CalendarIcon />}
              label="Upcoming stays"
              value="0"
              description="Confirmed bookings"
            />

            <DashboardStat
              icon={<MessageIcon />}
              label="Messages"
              value="0"
              description="Unread conversations"
            />
          </section>

          {/* =================================================
              MAIN GRID
          ================================================== */}

          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_330px]">

            {/* =================================================
                LISTINGS
            ================================================== */}

            <section>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900">
                      Recommended homes
                    </h2>

                    <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-600">
                      {filteredListings.length}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    Real accommodation currently available on Qrib.
                  </p>
                </div>

                <Link
                  to="/search"
                  className="text-sm font-bold text-blue-600 hover:text-blue-700"
                >
                  View all
                </Link>
              </div>

              {/* LOADING */}

              {loading && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                  <p className="mt-4 text-sm font-semibold text-slate-600">
                    Loading accommodation...
                  </p>
                </div>
              )}

              {/* ERROR */}

              {!loading && error && (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <AlertIcon />
                    </div>

                    <div>
                      <p className="font-bold text-red-700">
                        Could not load properties
                      </p>

                      <p className="mt-2 text-sm leading-6 text-red-600">
                        {error}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={retryLoading}
                    className="mt-5 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* PROPERTIES */}

              {!loading &&
                !error &&
                featuredListings.length > 0 && (
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    {featuredListings.map(
                      (listing) => (
                        <div
                          key={listing.id}
                          className="relative"
                        >
                          <PropertyCard
                            listing={listing}
                          />

                          <button
                            type="button"
                            aria-label={
                              savedIds.includes(
                                listing.id
                              )
                                ? "Remove from saved homes"
                                : "Save home"
                            }
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();

                              toggleSaved(
                                listing.id
                              );
                            }}
                            className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full shadow-md backdrop-blur transition ${
                              savedIds.includes(
                                listing.id
                              )
                                ? "bg-blue-600 text-white"
                                : "bg-white/95 text-slate-700 hover:bg-white"
                            }`}
                          >
                            <HeartIcon
                              filled={savedIds.includes(
                                listing.id
                              )}
                            />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}

              {/* EMPTY */}

              {!loading &&
                !error &&
                featuredListings.length === 0 && (
                  <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                      <HomeIcon />
                    </div>

                    <h3 className="mt-4 font-black text-slate-800">
                      {listings.length === 0
                        ? "No accommodation available yet"
                        : "No homes match your search"}
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                      {listings.length === 0
                        ? "Verified properties will appear here once hosts publish them on Qrib."
                        : "Try changing your search, budget or property type to find more accommodation."}
                    </p>

                    {(search ||
                      budget !==
                        "Any budget" ||
                      propertyType !==
                        "Any type") && (
                      <button
                        onClick={clearFilters}
                        className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-700"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                )}
            </section>

            {/* =================================================
                SIDEBAR
            ================================================== */}

            <aside className="space-y-6">

              {/* PROFILE */}

              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-lg font-black text-white">
                    {initials}
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate font-black text-slate-900">
                      {user?.name ||
                        "Student"}
                    </h3>

                    <p className="truncate text-sm text-slate-500">
                      {user?.email || ""}
                    </p>
                  </div>
                </div>

                {/* PROFILE COMPLETION */}

                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">
                      Profile completion
                    </span>

                    <span className="text-xs font-black text-blue-600">
                      {profileCompletion}%
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{ width: `${profileCompletion}%` }}
                    />
                  </div>
                </div>

                {/* FIXED PROFILE LINK */}

                <Link
                  to="/student/profile"
                  className="mt-5 flex items-center justify-center rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                >
                  Complete your profile
                </Link>
              </section>

              {/* QUICK ACTIONS */}

              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="font-black text-slate-900">
                  Quick actions
                </h3>

                <div className="mt-4 space-y-2">

                  <QuickAction
                    icon={<SearchIcon />}
                    title="Find accommodation"
                    description="Search available homes"
                    to="/search"
                  />

                  <QuickAction
                    icon={<HeartIcon />}
                    title="Saved homes"
                    description={`${savedIds.length} properties saved`}
                    to="/student/saved"
                  />

                  {/* REAL COMMUNICATION ENTRY POINT */}

                  <QuickAction
                    icon={<MessageIcon />}
                    title="Contact a host"
                    description="Chat with a property host"
                    to="/student/messages"
                  />

                </div>
              </section>

              {/* AREAS */}

              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="font-black text-slate-900">
                  Explore Nairobi
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Popular student areas
                </p>

                <div className="mt-4 space-y-3">
                  {[
                    ["Roysambu", "KCA, USIU"],
                    ["Parklands", "UoN, KMTC"],
                    ["Kilimani", "Strathmore"],
                    ["Madaraka", "Strathmore"],
                    ["Kasarani", "KCA, USIU"],
                  ].map(
                    ([area, schools]) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() =>
                          handleAreaSearch(area)
                        }
                        className="flex w-full items-center justify-between rounded-xl p-3 text-left transition hover:bg-slate-50"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {area}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {schools}
                          </p>
                        </div>

                        <ArrowIcon />
                      </button>
                    )
                  )}
                </div>
              </section>
            </aside>
          </div>

          {/* =================================================
              BENEFITS
          ================================================== */}

          <section className="mt-14 grid gap-5 md:grid-cols-3">
            <FeatureCard
              icon={<SearchIcon />}
              title="Student-focused"
              description="Built around the way students search, compare and secure accommodation."
            />

            <FeatureCard
              icon={<LocationIcon />}
              title="Close to campus"
              description="Compare real properties using their location and distance from campus."
            />

            <FeatureCard
              icon={<CheckIcon />}
              title="Better decisions"
              description="Compare price, property type, amenities and location before choosing."
            />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getInitials(name) {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "S";
  }

  if (parts.length === 1) {
    return parts[0]
      .charAt(0)
      .toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[1].charAt(0)
  ).toUpperCase();
}

/* =========================================================
   DASHBOARD STAT
========================================================= */

function DashboardStat({
  icon,
  label,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>

        <div>
          <p className="text-2xl font-black text-slate-900">
            {value}
          </p>

          <p className="text-xs font-bold text-slate-500">
            {label}
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  icon,
  title,
  description,
  to,
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-slate-50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-800">
          {title}
        </p>

        <p className="text-xs text-slate-400">
          {description}
        </p>
      </div>
    </Link>
  );
}

/* =========================================================
   FEATURE CARD
========================================================= */

function FeatureCard({
  icon,
  title,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <h3 className="mt-4 font-black text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   SEARCH ICON
========================================================= */

function SearchIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="shrink-0"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path
        d="m20 20-4-4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   ARROW ICON
========================================================= */

function ArrowIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M5 12h14"
        strokeLinecap="round"
      />

      <path
        d="m13 6 6 6-6 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* =========================================================
   HEART ICON
========================================================= */

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

/* =========================================================
   DOCUMENT ICON
========================================================= */

function DocumentIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect
        x="5"
        y="3"
        width="14"
        height="18"
        rx="2"
      />

      <path
        d="M9 8h6M9 12h6M9 16h4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   CALENDAR ICON
========================================================= */

function CalendarIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
      />

      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

/* =========================================================
   MESSAGE ICON
========================================================= */

function MessageIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H8l-4 2v-4.5A7.5 7.5 0 1 1 20 11.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* =========================================================
   HOME ICON
========================================================= */

function HomeIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-blue-600"
    >
      <path
        d="m3 11 9-8 9 8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M5 10v10h14V10M9 20v-6h6v6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* =========================================================
   LOCATION ICON
========================================================= */

function LocationIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        cx="12"
        cy="10"
        r="2.5"
      />
    </svg>
  );
}

/* =========================================================
   CHECK ICON
========================================================= */

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="m5 12 4 4L19 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* =========================================================
   ALERT ICON
========================================================= */

function AlertIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M12 9v4"
        strokeLinecap="round"
      />

      <path
        d="M12 17h.01"
        strokeLinecap="round"
      />

      <path
        d="M10.3 3.7 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}