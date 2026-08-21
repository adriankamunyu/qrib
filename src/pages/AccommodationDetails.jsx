import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { listings } from "../data/listings";
import { getUniversity } from "../data/universities";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function AccommodationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const listing = listings.find((item) => item.id === id);

  if (!listing) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h1 className="text-3xl font-extrabold text-ink">
            Property not found
          </h1>
          <Link
            to="/search"
            className="inline-block mt-6 bg-brand text-white px-5 py-3 rounded-lg font-bold"
          >
            Browse properties
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const university = getUniversity(listing.universityId);

  const handleBooking = () => {
    if (!user) {
      showToast("Please log in before booking.", "error");
      navigate("/login");
      return;
    }

    navigate(`/booking/${listing.id}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-6 lg:px-10 py-10">
        <Link
          to="/search"
          className="text-sm font-semibold text-brand hover:underline"
        >
          ← Back to search
        </Link>

        <div className="grid lg:grid-cols-2 gap-10 mt-6">
          <div>
            <img
              src={listing.image}
              alt={listing.title}
              className="w-full h-[480px] object-cover rounded-2xl"
            />
          </div>

          <div>
            {listing.verifiedHost && (
              <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full">
                ✓ Verified host
              </span>
            )}

            <h1 className="text-4xl font-extrabold text-ink mt-4">
              {listing.title}
            </h1>

            <p className="text-muted mt-3">
              {listing.area}, {listing.city}
            </p>

            <div className="flex gap-5 mt-5 text-sm font-semibold text-ink">
              <span>★ {listing.rating}</span>
              <span>{listing.bedrooms} bedroom</span>
              <span>{listing.bathrooms} bathroom</span>
              {listing.furnished && <span>Furnished</span>}
            </div>

            <p className="text-3xl font-extrabold text-ink mt-8">
              KSh {listing.pricePerMonth.toLocaleString()}
              <span className="text-base font-medium text-muted">
                {" "}
                / month
              </span>
            </p>

            <p className="text-muted leading-relaxed mt-6">
              {listing.description}
            </p>

            <div className="mt-7">
              <h2 className="font-bold text-xl text-ink mb-4">
                Amenities
              </h2>

              <div className="flex flex-wrap gap-2">
                {listing.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-sm font-semibold"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-7 p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-muted">Nearby university</p>
              <p className="font-bold text-ink mt-1">
                {university?.name}
              </p>
              <p className="text-sm text-brand font-semibold mt-1">
                {listing.distanceKm} km away
              </p>
            </div>

            <button
              onClick={handleBooking}
              className="w-full mt-7 bg-brand text-white py-4 rounded-xl font-extrabold hover:opacity-90 transition"
            >
              Book this accommodation
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
