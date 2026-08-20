import { Link } from "react-router-dom";
import { getUniversity } from "../data/universities";

export default function PropertyCard({ listing }) {
  const uni = getUniversity(listing.universityId);
  return (
    <Link
      to={`/property/${listing.id}`}
      className="block w-full rounded-xl overflow-hidden border border-line hover:shadow-lg transition group"
    >
      <div className="relative h-[220px] overflow-hidden">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
        {listing.verifiedHost && (
          <span className="absolute top-3 left-3 bg-white/95 text-brand text-[11px] font-bold px-2.5 py-1 rounded-full">
            ✓ Verified
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between text-sm text-muted mb-2">
          <span>{listing.area}</span>
          <span className="flex items-center gap-1 text-ink font-semibold">
            ★ {listing.rating}
          </span>
        </div>
        <h3 className="font-bold text-ink text-lg leading-snug mb-1 line-clamp-2">
          {listing.title}
        </h3>
        <p className="text-xs text-brand font-semibold mb-3">
          {listing.distanceKm} km from {uni?.name}
        </p>
        <p className="font-extrabold text-ink text-xl">
          KSh {listing.pricePerMonth.toLocaleString()}
          <span className="text-sm font-medium text-muted"> / month</span>
        </p>
      </div>
    </Link>
  );
}
