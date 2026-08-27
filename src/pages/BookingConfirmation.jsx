import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { listings } from "../data/listings";
import { useAuth } from "../context/useAuth";

export default function BookingConfirmation() {
  const { id } = useParams();
  const { user } = useAuth();

  const listing = listings.find((item) => item.id === id);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-3xl">
          ✓
        </div>

        <h1 className="text-3xl font-extrabold text-ink mt-6">
          Booking request received
        </h1>

        <p className="text-muted mt-3">
          Thanks {user?.name || "for choosing Qrib"}. Your accommodation
          request has been recorded.
        </p>

        {listing && (
          <div className="mt-8 p-6 border border-line rounded-2xl text-left">
            <h2 className="font-bold text-xl text-ink">
              {listing.title}
            </h2>
            <p className="text-muted mt-2">
              {listing.area}, {listing.city}
            </p>
            <p className="font-extrabold text-xl mt-4">
              KSh {listing.pricePerMonth.toLocaleString()} / month
            </p>
          </div>
        )}

        <Link
          to="/search"
          className="inline-block mt-8 bg-brand text-white px-6 py-3 rounded-lg font-bold"
        >
          Browse more accommodation
        </Link>
      </main>

      <Footer />
    </div>
  );
}
