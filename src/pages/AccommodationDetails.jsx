import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MapView from "../components/MapView";
import listings from "../data/listings";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function AccommodationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const listing = useMemo(
  () => listings.find((l) => String(l.id) === id) || null,
  [id]
);
  const [activeImage, setActiveImage] = useState(0);
  const [prevId, setPrevId] = useState(id);

  if (id !== prevId) {
    setPrevId(id);
    setActiveImage(0);
  }

  const handleBook = () => {
    if (!user) {
      showToast?.("Please log in to book this place", "error");
      navigate("/login", { state: { from: `/accommodation/${id}` } });
      return;
    }
    navigate(`/booking-confirmation/${id}`);
  };

  if (!listing) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Listing not found.</p>
        <button onClick={() => navigate("/search")} className="mt-2 text-teal-600 hover:underline">
          Back to search
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Gallery */}
      <div className="mb-6">
        <img
          src={listing.images?.[activeImage]}
          alt={listing.title}
          className="h-80 w-full rounded-2xl object-cover"
        />
        {listing.images?.length > 1 && (
          <div className="mt-2 flex gap-2 overflow-x-auto">
            {listing.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${listing.title} ${idx + 1}`}
                onClick={() => setActiveImage(idx)}
                className={`h-16 w-24 cursor-pointer rounded-lg object-cover ${
                  idx === activeImage ? "ring-2 ring-teal-500" : "opacity-80"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Details */}
        <div className="lg:col-span-2">
          <p className="text-sm font-medium text-teal-600">{listing.location}</p>
          <div className="mt-1 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
            <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
              ⭐ {listing.rating}
            </span>
          </div>

          <div className="mt-3 flex gap-2">
            {listing.amenities?.slice(0, 3).map((a) => (
              <span key={a} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                {a}
              </span>
            ))}
          </div>

          <p className="mt-6 leading-relaxed text-gray-700">{listing.description}</p>

          {listing.amenities?.length > 0 && (
            <>
              <h2 className="mt-6 mb-2 text-lg font-semibold">Amenities</h2>
              <ul className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                {listing.amenities.map((a) => (
                  <li key={a} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                    {a}
                  </li>
                ))}
              </ul>
            </>
          )}

          <h2 className="mt-8 mb-2 text-lg font-semibold">Location</h2>
          <div className="h-72">
            <MapView listings={[listing]} />
          </div>
        </div>

        {/* Booking summary card, echoing the "Confirm and pay" sidebar style */}
        <div className="h-fit rounded-2xl border border-gray-200 p-5 lg:sticky lg:top-6">
          <div className="mb-3 flex items-center gap-1 text-xs font-medium text-teal-600">
            🛡️ VERIFIED HOST
          </div>
          <p className="mb-4 text-lg font-semibold text-gray-900">
            KSh {listing.price?.toLocaleString()}
            <span className="text-sm font-normal text-gray-500"> / month</span>
          </p>
          <button
            onClick={handleBook}
            className="w-full rounded-xl bg-teal-600 py-2.5 font-medium text-white hover:bg-teal-700"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}