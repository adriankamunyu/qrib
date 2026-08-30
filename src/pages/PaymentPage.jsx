import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState("");

  const bookingAmount = useMemo(() => {
    return Number(payment?.amount || 0);
  }, [payment]);

  useEffect(() => {
    if (!user) {
      showToast("Please log in to continue with payment.", "error");
      navigate("/login");
      return;
    }

    const token = localStorage.getItem("qrib_access_token");

    if (!token) {
      showToast("Your session has expired.", "error");
      navigate("/login");
      return;
    }

    async function initiatePayment() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/payments/initiate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            booking_id: Number(bookingId),
            amount: 0,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to initiate payment.");
        }

        setPayment(data.payment || null);
      } catch (err) {
        console.error("Payment initiation failed:", err);
        setError(err.message || "Unable to initiate payment.");
      } finally {
        setLoading(false);
      }
    }

    initiatePayment();
  }, [bookingId, navigate, showToast, user]);

  const handlePay = () => {
    if (!payment) {
      return;
    }

    showToast(
      "Sandbox payment is ready. Connect your Flutterwave keys in production to complete live checkout.",
      "success"
    );
  };

  return (
    <div className="min-h-screen bg-slate-50"> 
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Payment</p>
          <h1 className="mt-3 text-3xl font-extrabold text-slate-900">Complete your booking payment</h1>

          {loading && (
            <div className="mt-8 rounded-2xl bg-slate-100 p-5 text-slate-600">
              Preparing your secure payment session...
            </div>
          )}

          {error && (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
              {error}
            </div>
          )}

          {!loading && payment && (
            <>
              <div className="mt-8 rounded-2xl bg-slate-50 p-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Reference</span>
                  <span className="font-mono text-sm font-semibold text-slate-900">{payment.reference}</span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <span className="text-slate-500">Amount</span>
                  <span className="text-2xl font-extrabold text-slate-900">KSh {bookingAmount.toLocaleString()}</span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <span className="text-slate-500">Status</span>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">{payment.status}</span>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
                This is a Flutterwave-compatible sandbox setup for Kenyan student accommodation payments.
                Add your live keys in production to enable real checkout.
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handlePay}
                  className="inline-flex items-center justify-center rounded-xl bg-brand px-6 py-3 font-bold text-white transition hover:opacity-90"
                >
                  Pay now
                </button>

                <Link
                  to="/student/dashboard"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 font-bold text-slate-700 transition hover:border-slate-300"
                >
                  Back to dashboard
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
