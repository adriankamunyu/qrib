import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/useAuth";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
const TOKEN_KEY = "qrib_access_token";

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

export default function BookingConfirmation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    async function loadListingAndSubmitBooking() {
      try {
        const propertyResponse = await fetch(`${API_URL}/properties/${id}`);
        const propertyData = await propertyResponse.json();

        if (!propertyResponse.ok) {
          throw new Error(propertyData.error || "Property could not be loaded.");
        }

        const property = propertyData.property || propertyData;

        if (!cancelled) {
          setListing(property);
        }

        if (!user) {
          if (!cancelled) {
            setLoading(false);
          }
          return;
        }

        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        const bookingResponse = await fetch(`${API_URL}/bookings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            property_id: Number(id),
            student_id: Number(user.id),
            move_in_date: addDays(14),
          }),
        });

        const bookingData = await bookingResponse.json();

        if (!bookingResponse.ok) {
          throw new Error(bookingData.error || "Booking request failed.");
        }

        if (!cancelled) {
          setBooking(bookingData.booking || bookingData);
        }
      } catch (err) {
        console.error("Booking confirmation error:", err);
        if (!cancelled) {
          setError(err.message || "Unable to confirm this booking.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadListingAndSubmitBooking();

    return () => {
      cancelled = true;
    };
  }, [id, navigate, user]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto max-w-2xl px-6 py-20 text-center">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-10">
            <p className="text-lg font-semibold text-slate-700">Confirming your booking request...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-left">
            <h1 className="text-2xl font-extrabold text-red-700">Booking could not be confirmed</h1>
            <p className="mt-3 text-red-600">{error}</p>
            <Link to="/search" className="mt-6 inline-block rounded-lg bg-brand px-5 py-3 font-bold text-white">
              Browse listings
            </Link>
          </div>
        ) : (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
              ✓
            </div>

            <h1 className="mt-6 text-3xl font-extrabold text-ink">
              Booking request received
            </h1>

            <p className="mt-3 text-muted">
              Thanks {user?.name || "for choosing Qrib"}. Your accommodation request has been submitted to the host.
            </p>

            {listing && (
              <div className="mt-8 rounded-2xl border border-line bg-slate-50 p-6 text-left">
                <h2 className="text-xl font-bold text-ink">{listing.title}</h2>
                <p className="mt-2 text-muted">{listing.area}, {listing.city}</p>
                <p className="mt-4 text-2xl font-extrabold text-ink">KSh {Number(listing.price_per_month || listing.pricePerMonth || 0).toLocaleString()} / month</p>
                <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
                  <span className="text-slate-500">Status</span>
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
                    {booking?.status || "pending"}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => navigate(`/payment/${booking?.id || id}`)}
                className="rounded-lg bg-brand px-6 py-3 font-bold text-white"
              >
                Continue to payment
              </button>

              <Link to="/search" className="inline-block rounded-lg border border-slate-200 bg-white px-6 py-3 font-bold text-slate-700 hover:bg-slate-50">
                Browse more accommodation
              </Link>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
