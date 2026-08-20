import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PropertyCard from "../components/PropertyCard";
import MapView from "../components/MapView";
import listings from "../data/listings";

const PROPERTY_TYPES = ["Private Room", "Entire Studio", "Shared Flat"];
const DISTANCE_OPTIONS = [
  { key: "walk5", label: "Within 5 min walk" },
  { key: "transport15", label: "Within 15 min transport" },
  { key: "miles3", label: "Under 3 miles" },
];
const AMENITIES = ["High-speed Wi-Fi", "Laundry in building", "Study Lounge", "Bike Storage"];
const SORT_OPTIONS = ["Recommended", "Price: Low to High", "Price: High to Low", "Top Rated"];

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const city = searchParams.get("city") || "Nairobi";

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [distances, setDistances] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [sortBy, setSortBy] = useState("Recommended");
  const [activeId, setActiveId] = useState(null);

  const typeCounts = useMemo(() => {
    const counts = {};
    PROPERTY_TYPES.forEach((t) => {
      counts[t] = listings.filter((l) => l.propertyType === t).length;
    });
    return counts;
  }, []);

  const toggle = (value, list, setList) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const filtered = useMemo(() => {
    let result = listings.filter((l) => {
      if (minPrice && l.price < Number(minPrice)) return false;
      if (maxPrice && l.price > Number(maxPrice)) return false;
      if (propertyTypes.length && !propertyTypes.includes(l.propertyType)) return false;
      if (distances.length && !distances.includes(l.distanceCategory)) return false;
      if (amenities.length && !amenities.every((a) => l.amenities.includes(a))) return false;
      return true;
    });

    if (sortBy === "Price: Low to High") result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === "Price: High to Low") result = [...result].sort((a, b) => b.price - a.price);
    if (sortBy === "Top Rated") result = [...result].sort((a, b) => b.rating - a.rating);

    return result;
  }, [minPrice, maxPrice, propertyTypes, distances, amenities, sortBy]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr_420px]">
        {/* Filters sidebar */}
        <aside>
          <h2 className="mb-4 text-lg font-bold text-gray-900">Filters</h2>

          <div className="mb-6">
            <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500">
              PRICE RANGE (MONTHLY)
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="KSh 0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-1/2 rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="KSh 120,000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-1/2 rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="mb-6">
            <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500">
              PROPERTY TYPE
            </p>
            {PROPERTY_TYPES.map((type) => (
              <label key={type} className="mb-2 flex items-center justify-between text-sm text-gray-700">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={propertyTypes.includes(type)}
                    onChange={() => toggle(type, propertyTypes, setPropertyTypes)}
                    className="h-4 w-4 rounded accent-teal-600"
                  />
                  {type}
                </span>
                <span className="text-gray-400">{typeCounts[type]}</span>
              </label>
            ))}
          </div>

          <div className="mb-6">
            <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500">
              DISTANCE TO CAMPUS
            </p>
            {DISTANCE_OPTIONS.map((opt) => (
              <label key={opt.key} className="mb-2 flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={distances.includes(opt.key)}
                  onChange={() => toggle(opt.key, distances, setDistances)}
                  className="h-4 w-4 rounded accent-teal-600"
                />
                {opt.label}
              </label>
            ))}
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500">
              KEY AMENITIES
            </p>
            {AMENITIES.map((a) => (
              <label key={a} className="mb-2 flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={amenities.includes(a)}
                  onChange={() => toggle(a, amenities, setAmenities)}
                  className="h-4 w-4 rounded accent-teal-600"
                />
                {a}
              </label>
            ))}
          </div>
        </aside>

        {/* Results list */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filtered.length} of {listings.length} student hostels in {city}
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>Sort by: {opt}</option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <p className="text-gray-500">No listings match your filters.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {filtered.map((listing) => (
                <div
                  key={listing.id}
                  onMouseEnter={() => setActiveId(listing.id)}
                  className={`rounded-2xl transition ${
                    activeId === listing.id ? "ring-2 ring-teal-500" : ""
                  }`}
                >
                  <PropertyCard listing={listing} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Map */}
        <div className="h-[500px] lg:sticky lg:top-6 lg:h-[calc(100vh-8rem)]">
          <MapView listings={filtered} activeId={activeId} onMarkerClick={setActiveId} />
        </div>
      </div>
    </div>
  );
}