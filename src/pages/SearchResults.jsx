import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PropertyCard from "../components/PropertyCard";
import MapView from "../components/MapView";
import { listings } from "../data/listings";
import { universities, getUniversity } from "../data/universities";

const propertyTypes = ["Private Room", "Entire Studio", "Shared Flat"];

export default function SearchResults() {
  const [params] = useSearchParams();
  const initialCity = params.get("city") || "";
  const initialQuery = (params.get("q") || "").toLowerCase();

  const [universityId, setUniversityId] = useState("");
  const [city, setCity] = useState(initialCity);
  const [maxPrice, setMaxPrice] = useState(30000);
  const [types, setTypes] = useState([]);
  const [sort, setSort] = useState("recommended");
  const [selected, setSelected] = useState(null);

  const toggleType = (t) =>
    setTypes((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  const filtered = useMemo(() => {
    let result = listings.filter((l) => {
      const uni = getUniversity(l.universityId);
      if (city && uni.city !== city) return false;
      if (universityId && l.universityId !== universityId) return false;
      if (l.pricePerMonth > maxPrice) return false;
      if (types.length && !types.includes(l.type)) return false;
      if (
        initialQuery &&
        !`${l.title} ${uni.name} ${l.area}`.toLowerCase().includes(initialQuery)
      )
        return false;
      return true;
    });
    if (sort === "price-asc") result = [...result].sort((a, b) => a.pricePerMonth - b.pricePerMonth);
    if (sort === "price-desc") result = [...result].sort((a, b) => b.pricePerMonth - a.pricePerMonth);
    if (sort === "distance") result = [...result].sort((a, b) => a.distanceKm - b.distanceKm);
    if (sort === "rating") result = [...result].sort((a, b) => b.rating - a.rating);
    return result;
  }, [city, universityId, maxPrice, types, sort, initialQuery]);

  const mapUniversities = universityId ? universities.filter((u) => u.id === universityId) : universities;
  const mapCenter = universityId
    ? (() => {
        const u = getUniversity(universityId);
        return [u.lat, u.lng];
      })()
    : undefined;

  return (
    <div className="w-full">
      <Navbar />
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row">
        {/* Sidebar filters */}
        <aside className="w-full lg:w-[320px] shrink-0 p-8 border-r border-line">
          <h2 className="font-extrabold text-xl text-ink mb-6">Filters</h2>

          <div className="mb-8">
            <label className="text-sm font-bold text-ink block mb-2">Near University</label>
            <select
              value={universityId}
              onChange={(e) => setUniversityId(e.target.value)}
              className="w-full border border-line rounded-lg p-3 text-sm"
            >
              <option value="">All institutions</option>
              {universities.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.city}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-8">
            <label className="text-sm font-bold text-ink block mb-2">
              Max Price (KSh / month): {maxPrice.toLocaleString()}
            </label>
            <input
              type="range"
              min="5000"
              max="30000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-brand"
            />
          </div>

          <div className="mb-8">
            <label className="text-sm font-bold text-ink block mb-3">Property Type</label>
            <div className="flex flex-col gap-3">
              {propertyTypes.map((t) => (
                <label key={t} className="flex items-center gap-3 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={types.includes(t)}
                    onChange={() => toggleType(t)}
                    className="w-[18px] h-[18px] accent-brand rounded"
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setUniversityId("");
              setCity("");
              setMaxPrice(30000);
              setTypes([]);
            }}
            className="text-sm font-semibold text-brand hover:underline"
          >
            Clear all filters
          </button>
        </aside>

        {/* Listings */}
        <section className="flex-1 p-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <p className="text-sm text-muted">
              Showing {filtered.length} of {listings.length} student accommodations
              {city ? ` in ${city}` : ""}
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border border-line rounded-lg px-3 py-2 text-sm font-semibold text-ink"
            >
              <option value="recommended">Sort by: Recommended</option>
              <option value="distance">Closest to campus</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          <div className="flex flex-col gap-5">
            {filtered.length === 0 && (
              <p className="text-muted text-sm">No listings match those filters yet — try widening your search.</p>
            )}
            {filtered.map((l) => (
              <div
                key={l.id}
                onMouseEnter={() => setSelected(l)}
                className="flex flex-col sm:flex-row gap-5 border border-line rounded-xl overflow-hidden hover:shadow-md transition"
              >
                <img src={l.image} alt={l.title} className="w-full sm:w-[220px] h-[180px] object-cover" />
                <div className="flex-1 p-5">
                  <div className="flex items-center justify-between text-sm text-muted mb-2">
                    <span>{l.area}</span>
                    <span className="font-semibold text-ink">★ {l.rating}</span>
                  </div>
                  <h3 className="font-bold text-ink text-lg mb-2">{l.title}</h3>
                  <p className="text-xs text-brand font-semibold mb-3">
                    {l.distanceKm} km from {getUniversity(l.universityId)?.name}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {l.amenities.slice(0, 2).map((a) => (
                      <span key={a} className="text-xs bg-panel text-muted px-2.5 py-1 rounded-full">
                        {a}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-extrabold text-ink text-lg">
                      KSh {l.pricePerMonth.toLocaleString()} <span className="text-sm font-medium text-muted">/ month</span>
                    </p>
                    <a
                      href={`/property/${l.id}`}
                      className="bg-brand text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-brand-dark transition"
                    >
                      View Details
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Map */}
        <div className="w-full lg:w-[480px] h-[500px] lg:h-auto sticky top-20 shrink-0 p-4">
          <MapView listings={filtered} universities={mapUniversities} center={mapCenter} onSelect={setSelected} />
        </div>
      </div>
      <Footer />
    </div>
  );
}