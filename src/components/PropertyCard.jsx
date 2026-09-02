import { Link } from "react-router-dom";
import { getUniversity } from "../data/universities";

const fallbackImage =
  "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80";

function getSafeImageUrl(imageUrl) {
  if (typeof imageUrl !== "string" || !imageUrl.trim()) {
    return fallbackImage;
  }

  const trimmed = imageUrl.trim();

  if (trimmed.startsWith("data:image/")) {
    return trimmed;
  }

  return trimmed;
}

export default function PropertyCard({ listing }) {
  const uni = getUniversity(listing.universityId);
  const imageSrc = getSafeImageUrl(listing.image);

  return (
    <Link
      to={`/property/${listing.id}`}
      className="group block w-full overflow-hidden rounded-xl border border-line transition hover:shadow-lg"
    >
      <div className="relative h-[220px] overflow-hidden">
        <img
          src={imageSrc}
          alt={listing.title}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = fallbackImage;
          }}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />

        {listing.verifiedHost && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-brand">
            ✓ Verified
          </span>
        )}

        {listing.furnished && (
          <span className="absolute right-3 top-3 rounded-full bg-slate-950/80 px-2.5 py-1 text-[11px] font-bold text-white">
            Furnished
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="mb-2 flex items-center justify-between text-sm text-muted">
          <span>{listing.area}</span>

          <span className="flex items-center gap-1 font-semibold text-ink">
            ★ {listing.rating}
          </span>
        </div>

        <h3 className="mb-1 line-clamp-2 text-lg font-bold leading-snug text-ink">
          {listing.title}
        </h3>

        <p className="mb-3 text-xs font-semibold text-brand">
          {listing.distanceKm} km from{" "}
          {uni?.name || listing.universityName || "campus"}
        </p>

        <p className="text-xl font-extrabold text-ink">
          KSh {Number(listing.pricePerMonth || 0).toLocaleString()}
          <span className="text-sm font-medium text-muted">
            {" "}
            / month
          </span>
        </p>

        {listing.type && (
          <div className="mt-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {listing.type}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}