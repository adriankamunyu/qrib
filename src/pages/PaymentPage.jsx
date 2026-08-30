import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/useAuth";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
const TOKEN_KEY = "qrib_access_token";

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState(null);
  const [property, setProperty] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) {
      setError("Booking information is missing.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadBookingAndPreparePayment() {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        const bookingResponse = await fetch(`${API_URL}/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const bookingData = await bookingResponse.json();

        if (!bookingResponse.ok) {
          throw new Error(bookingData.error || "Booking not found.");
        }

        const nextBooking = bookingData.booking || bookingData;

        if (!cancelled) {
          setBooking(nextBooking);
        }

        const propertyResponse = await fetch(`${API_URL}/properties/${nextBooking.property_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const propertyData = await propertyResponse.json();
        if (!propertyResponse.ok) {
          throw new Error(propertyData.error || "Property details could not be loaded.");
        }

        const nextProperty = propertyData.property || propertyData;

        if (!cancelled) {
          setProperty(nextProperty);
        }

        const response = await fetch(`${API_URL}/payments/initiate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            booking_id: Number(bookingId),
            property_id: Number(nextBooking.property_id),
            amount: Number(nextProperty.price_per_month || nextProperty.pricePerMonth || 0),
            currency: "KES",
          }),
        });

        const paymentData = await response.json();

        if (!response.ok) {
          throw new Error(paymentData.error || "Unable to create payment request.");
        }

        if (!cancelled) {
          setPayment(paymentData.payment || paymentData);
        }
      } catch (err) {
        console.error("Payment initialization error:", err);
        if (!cancelled) {
          setError(err.message || "We could not initialize this payment.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBookingAndPreparePayment();
    return () => {
      cancelled = true;
    };
  }, [bookingId, navigate]);

  const amount = useMemo(() => {
    if (!property) return 0;
    const propertyAmount = Number(property.price_per_month || property.pricePerMonth || 0);
    return Number.isFinite(propertyAmount) && propertyAmount > 0 ? propertyAmount : 0;
  }, [property]);

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 py-16">
        <Link to="/search" className="text-sm font-semibold text-blue-600 hover:underline">
          ← Back to listings
        </Link>

        {loading && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
            <p className="mt-4 text-lg font-semibold text-slate-700">Preparing your payment...</p>
          </div>
        )}

        {!loading && error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-8">
            <h1 className="text-2xl font-black text-red-700">Payment setup failed</h1>
            <p className="mt-3 text-red-600">{error}</p>
            <Link to="/search" className="mt-6 inline-block rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white">
              Explore listings
            </Link>
          </div>
        )}

        {!loading && !error && (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Secure payment</p>
                <h1 className="mt-2 text-3xl font-black text-slate-900">Complete your booking payment</h1>
              </div>

              <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                Kenya-ready sandbox
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">Booking ID</span>
                <span className="text-sm font-bold text-slate-800">#{booking?.id || bookingId}</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">Student</span>
                <span className="text-sm font-bold text-slate-800">{user?.name || "Qrib student"}</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">Total due</span>
                <span className="text-2xl font-black text-slate-900">KSh {amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <h2 className="text-lg font-black text-slate-900">Payment options</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>• Card payment</li>
                <li>• M-Pesa / mobile money</li>
                <li>• USSD support in supported regions</li>
              </ul>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  if (payment?.reference) {
                    alert(`Sandbox payment initialized. Reference: ${payment.reference}\nSet FLUTTERWAVE keys to enable live checkout.`);
                    return;
                  }
                  alert("Sandbox checkout is ready. Add your Flutterwave keys to complete a real payment flow.");
                }}
                className="flex-1 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
              >
                Continue to payment
              </button>

              <button
                type="button"
                onClick={() => navigate(`/student/dashboard`, { replace: true })}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                Return to dashboard
              </button>
            </div>

            {payment?.reference && (
              <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                Sandbox reference: <span className="font-bold">{payment.reference}</span>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
