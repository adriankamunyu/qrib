import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PropertyCard from "../components/PropertyCard";
import { universities } from "../data/universities";

const API_URL = import.meta.env.VITE_API_URL;

const destinations = [
  {
    city: "Nairobi",
    blurb: "Home to UoN, KU, Strathmore, USIU & more",
    img: "https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=700&q=80",
  },
  {
    city: "Kiambu",
    blurb: "JKUAT & surrounding student towns",
    img: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=700&q=80",
  },
  {
    city: "Eldoret",
    blurb: "Moi University neighbourhood",
    img: "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=700&q=80",
  },
  {
    city: "Njoro",
    blurb: "Egerton University area",
    img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=700&q=80",
  },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // =========================================================
  // LOAD PROPERTIES FROM FLASK API
  // =========================================================

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/properties`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load properties"
          );
        }

        setProperties(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Property loading error:", err);

        setError(
          "Unable to load properties. Please make sure the Qrib backend is running."
        );

        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Only show the first 4 properties on the homepage
  const featured = properties.slice(0, 4);

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearch = (e) => {
    e.preventDefault();

    const trimmedQuery = query.trim();

    if (trimmedQuery) {
      navigate(
        `/search?q=${encodeURIComponent(trimmedQuery)}`
      );
    } else {
      navigate("/search");
    }
  };

  // =========================================================
  // DESTINATION SEARCH
  // =========================================================

  const handleDestinationSearch = (city) => {
    navigate(
      `/search?city=${encodeURIComponent(city)}`
    );
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1600&q=80"
            alt="Student accommodation"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-slate-950/70" />

          <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-3xl" />

          <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-500/20 blur-3xl" />
        </div>

        <div className="relative mx-auto flex min-h-[560px] max-w-[1280px] items-center px-5 py-16 sm:px-8 lg:px-10">
          <div className="w-full max-w-4xl">

            {/* Badge */}

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-blue-400" />

              <span className="text-sm font-bold text-blue-100">
                Student accommodation in Kenya
              </span>
            </div>

            {/* Heading */}

            <h1 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find a place that feels like home.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
              Discover safe, affordable student apartments,
              rooms, bedsitters and hostels close to your
              university.
            </p>

            {/* SEARCH */}

            <form
              onSubmit={handleSearch}
              className="mt-9 rounded-2xl border border-white/10 bg-white p-3 shadow-2xl"
            >
              <div className="flex flex-col gap-3 sm:flex-row">

                <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                  <SearchIcon />

                  <input
                    type="text"
                    value={query}
                    onChange={(e) =>
                      setQuery(e.target.value)
                    }
                    placeholder="Search university, area or property"
                    className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>

                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  Search
                  <ArrowIcon />
                </button>

              </div>
            </form>

            {/* POPULAR SEARCHES */}

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-bold text-slate-400">
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
                  onClick={() => setQuery(area)}
                  className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/20 hover:text-white"
                >
                  {area}
                </button>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          TRUST SIGNALS
      ====================================================== */}

      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-5 py-8 sm:grid-cols-3 sm:px-8 lg:px-10">

          {[
            {
              icon: "🛡️",
              title: "Trusted accommodation",
              desc: "Find student-friendly homes listed on Qrib.",
            },
            {
              icon: "🔒",
              title: "Simple booking",
              desc: "Manage your accommodation search in one place.",
            },
            {
              icon: "🎓",
              title: "Built for students",
              desc: "Search by university, area, budget and property type.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-4 rounded-2xl p-4"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-2xl">
                {item.icon}
              </div>

              <div>
                <p className="font-bold text-slate-900">
                  {item.title}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}

        </div>
      </section>

      {/* =====================================================
          FEATURED PROPERTIES
      ====================================================== */}

      <section className="mx-auto max-w-[1280px] px-5 py-12 sm:px-8 lg:px-10 lg:py-16">

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

          <div>
            <p className="text-sm font-bold text-blue-600">
              Featured accommodation
            </p>

            <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
              Popular student properties
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Explore accommodation near major Kenyan universities.
            </p>
          </div>

          <Link
            to="/search"
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            View all properties
            <ArrowIcon />
          </Link>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-[360px] animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">

            <div className="text-3xl">
              ⚠️
            </div>

            <p className="mt-3 font-bold text-red-700">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Try again
            </button>

          </div>
        )}

        {/* PROPERTIES */}

        {!loading &&
          !error &&
          featured.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

              {featured.map((property) => (
                <PropertyCard
                  key={property.id}
                  listing={property}
                />
              ))}

            </div>
          )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          featured.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">

              <div className="text-4xl">
                🏠
              </div>

              <p className="mt-3 font-bold text-slate-700">
                No properties available yet.
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Check back soon for new student accommodation.
              </p>

              <Link
                to="/search"
                className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Browse properties
              </Link>

            </div>
          )}

      </section>

      {/* =====================================================
          DESTINATIONS
      ====================================================== */}

      <section className="bg-slate-50">

        <div className="mx-auto max-w-[1280px] px-5 py-12 sm:px-8 lg:px-10 lg:py-16">

          <div className="mb-8">

            <p className="text-sm font-bold text-blue-600">
              Explore locations
            </p>

            <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
              Popular destinations for students
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Find accommodation around some of Kenya's
              biggest student communities.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {destinations.map((destination) => (
              <button
                key={destination.city}
                type="button"
                onClick={() =>
                  handleDestinationSearch(destination.city)
                }
                className="group relative h-[320px] overflow-hidden rounded-2xl text-left shadow-sm"
              >

                <img
                  src={destination.img}
                  alt={destination.city}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                <div className="absolute bottom-5 left-5 right-5 text-white">

                  <p className="text-xl font-black">
                    {destination.city}
                  </p>

                  <p className="mt-1 text-sm text-slate-200">
                    {destination.blurb}
                  </p>

                  <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-blue-200">
                    Explore accommodation
                    <ArrowIcon />
                  </div>

                </div>

              </button>
            ))}

          </div>

          <p className="mt-6 text-xs text-slate-400">
            Covering {universities.length} major institutions
            across Kenya, including{" "}
            {universities
              .slice(0, 3)
              .map((university) => university.name)
              .join(", ")}{" "}
            and more.
          </p>

        </div>

      </section>

      {/* =====================================================
          HOST CTA
      ====================================================== */}

      <section className="mx-auto max-w-[1280px] px-5 py-12 sm:px-8 lg:px-10 lg:py-16">

        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 sm:p-10 lg:p-12">

          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">

            <div className="max-w-2xl">

              <p className="text-sm font-bold text-blue-300">
                For property owners
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Have a property near a university?
              </h2>

              <p className="mt-4 text-sm leading-6 text-slate-300 sm:text-base">
                List your accommodation on Qrib and connect
                with students looking for their next home.
              </p>

            </div>

            <Link
              to="/login?mode=signup"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              List your property
              <ArrowIcon />
            </Link>

          </div>

        </div>

      </section>

      <Footer />
    </div>
  );
}

/* =========================================================
   ICONS
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
      className="shrink-0 text-slate-400"
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