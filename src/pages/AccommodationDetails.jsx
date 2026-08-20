import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MapView from "../components/MapView";
import { getListing } from "../data/listings";
import { getUniversity } from "../data/universities";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

const reviews = [
  { name: "Amina Yusuf", date: "June 2026", rating: 5, text: "The study desk and superfast internet made exam week so much easier! The host was very responsive." },
  { name: "Brian Kiplangat", date: "May 2026", rating: 5, text: "Perfect location — literally 5 minutes to campus. The compound is quiet and rarely overcrowded." },
];

export default function AccommodationDetails() {
  const { id } = useParams();
  const listing = getListing(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  if (!listing) {
    return (
      <div className="w-full">
        <Navbar />
        <div className="max-w-[1440px] mx-auto px-20 py-32 text-center">
          <p className="text-xl font-bold text-ink">Listing not found</p>
          <Link to="/search" className="text-brand font-semibold hover:underline">Back to search</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const uni = getUniversity(listing.universityId);
  const bookingFee = 500;
  const totalMonths = 4;
  const rent = listing.pricePerMonth * totalMonths;
  const discount = user?.role === "student" ? Math.round(rent * 0.1) : 0;
  const total = rent + bookingFee - discount;

  const handleBook = () => {
    if (!user) {
      showToast("Please sign in to book this accommodation.", "error");
      navigate("/login");
      return;
    }
    navigate(`/booking/${listing.id}`);
  };

  return (
    <div className="w-full">
      <Navbar />

      {/* Gallery */}
      <div className="max-w-[1440px] mx-auto px-20 pt-12 grid grid-cols-1 lg:grid-cols-[680px_1fr] gap-4 h-[420px]">
        <img src={listing.gallery[0]} alt={listing.title} className="w-full h-full object-cover rounded-xl" />
        <div className="hidden lg:flex flex-col gap-4">
          <img src={listing.gallery[1]} alt="" className="w-full h-[202px] object-cover rounded-xl" />
          <img src={listing.gallery[2]} alt="" className="w-full h-[202px] object-cover rounded-xl" />
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-20 py-16 grid grid-cols-1 lg:grid-cols-[852px_1fr] gap-10">
        {/* Left column */}
        <div className="flex flex-col gap-9">
          <div>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {listing.verifiedHost && (
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                  🛡️ VERIFIED HOST
                </span>
              )}
              <span className="bg-panel text-muted text-xs font-bold px-3 py-1.5 rounded-full">
                {listing.type.toUpperCase()}
              </span>
            </div>
            <h1 className="font-extrabold text-4xl text-ink mb-3">{listing.title}</h1>
            <p className="text-muted flex items-center gap-2">
              📍 {listing.area} · {listing.distanceKm} km to {uni?.name}
            </p>
          </div>

          <hr className="border-line" />

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-brand/10 flex items-center justify-center font-bold text-brand text-lg">
                {listing.host.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="font-bold text-ink">Hosted by {listing.host.name}</p>
                <p className="text-sm text-muted">Host since {listing.host.since} · Response rate: {listing.host.responseRate}%</p>
              </div>
            </div>
            <button
              onClick={() => showToast(`Message sent to ${listing.host.name}. They usually reply within a day.`, "success")}
              className="border border-line font-bold text-ink px-5 py-2.5 rounded-lg hover:bg-panel transition"
            >
              Contact Host
            </button>
          </div>

          <hr className="border-line" />

          <div>
            <h2 className="font-bold text-2xl text-ink mb-4">About the accommodation</h2>
            <p className="text-muted leading-relaxed">{listing.description}</p>
          </div>

          <hr className="border-line" />

          <div>
            <h2 className="font-bold text-2xl text-ink mb-5">What this place offers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {listing.amenities.map((a) => (
                <div key={a} className="flex items-center gap-3 text-ink">
                  <span className="text-emerald-600">✓</span>
                  {a}
                </div>
              ))}
            </div>
          </div>

          <hr className="border-line" />

          <div>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-bold text-2xl text-ink">Student Reviews</h2>
              <span className="text-ink font-semibold flex items-center gap-1">
                ★ {listing.rating} ({listing.reviewsCount})
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {reviews.map((r) => (
                <div key={r.name} className="border border-line rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-panel" />
                      <div>
                        <p className="font-semibold text-ink text-sm">{r.name}</p>
                        <p className="text-xs text-faint">{r.date}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-ink">★ {r.rating}</span>
                  </div>
                  <p className="text-muted text-sm">{r.text}</p>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-line" />

          <div>
            <h2 className="font-bold text-2xl text-ink mb-4">Location</h2>
            <div className="h-[320px]">
              <MapView listings={[listing]} universities={uni ? [uni] : []} center={[listing.lat, listing.lng]} zoom={14} />
            </div>
          </div>
        </div>

        {/* Booking card */}
        <div className="lg:sticky lg:top-24 h-fit border border-line rounded-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <p className="font-extrabold text-3xl text-ink">
              KSh {listing.pricePerMonth.toLocaleString()}
              <span className="text-sm font-medium text-muted"> / month</span>
            </p>
            <span className="font-semibold text-ink">★ {listing.rating}</span>
          </div>
          <hr className="border-line mb-6" />
          <div className="flex flex-col gap-3 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-muted">Rent ({totalMonths} months semester)</span>
              <span className="font-semibold text-ink">KSh {rent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Utility Bills</span>
              <span className="font-semibold text-emerald-600">Inclusive</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Host Booking Fee</span>
              <span className="font-semibold text-ink">KSh {bookingFee.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted">Student ID Discount (10%)</span>
                <span className="font-semibold text-emerald-600">-KSh {discount.toLocaleString()}</span>
              </div>
            )}
            <hr className="border-line" />
            <div className="flex justify-between text-base">
              <span className="font-bold text-ink">Total (KSh)</span>
              <span className="font-extrabold text-ink text-lg">KSh {total.toLocaleString()}</span>
            </div>
          </div>
          <button
            onClick={handleBook}
            className="w-full bg-brand hover:bg-brand-dark transition text-white font-bold py-4 rounded-lg"
          >
            Book Now
          </button>
          <p className="text-xs text-faint text-center mt-4">
            No payments charged until the host confirms your booking
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}