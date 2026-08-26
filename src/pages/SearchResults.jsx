import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PropertyCard from "../components/PropertyCard";
import MapView from "../components/MapView";
import { getAllListings } from "../data/listings";
import { universities } from "../data/universities";

export default function SearchResults() {
  const [searchParams] = useSearchParams();

  const city = searchParams.get("city") || "";
  const universityId = searchParams.get("university") || "";
  const maxPrice = Number(searchParams.get("maxPrice")) || Infinity;

  const results = useMemo(() => {
    const listings = getAllListings();

    return listings.filter((listing) => {
      const matchesCity =
        !city || listing.city.toLowerCase() === city.toLowerCase();

      const matchesUniversity =
        !universityId || listing.universityId === universityId;

      const matchesPrice = listing.pricePerMonth <= maxPrice;

      return matchesCity && matchesUniversity && matchesPrice;
    });
  }, [city, universityId, maxPrice]);

  const university = universities.find((u) => u.id === universityId);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-[1440px] mx-auto px-6 lg:px-20 py-10">
        <div className="mb-8">
          <Link
            to="/"
            className="text-sm font-semibold text-brand hover:underline"
          >
            ← Back home
          </Link>

          <h1 className="text-3xl font-extrabold text-ink mt-4">
            Student accommodation
          </h1>

          <p className="text-muted mt-2">
            {city
              ? `Showing accommodation in ${city}`
              : university
              ? `Showing accommodation near ${university.name}`
              : "Find a place that fits your budget and campus."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
          <section>
            <div className="flex items-center justify-between mb-5">
              <p className="font-semibold text-ink">
                {results.length} {results.length === 1 ? "property" : "properties"} found
              </p>
            </div>

            {results.length === 0 ? (
              <div className="border border-line rounded-2xl p-10 text-center">
                <h2 className="text-xl font-bold text-ink">
                  No accommodation found
                </h2>
                <p className="text-muted mt-2">
                  Try another city, university, or price range.
                </p>

                <Link
                  to="/search"
                  className="inline-block mt-5 bg-brand text-white px-5 py-3 rounded-lg font-bold"
                >
                  View all properties
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {results.map((listing) => (
                  <PropertyCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </section>

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
