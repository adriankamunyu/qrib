import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getListing } from "../data/listings";
import { getUniversity } from "../data/universities";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function BookingConfirmation() {
  const { id } = useParams();
  const listing = getListing(id);
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [method, setMethod] = useState("mpesa");
  const [agree, setAgree] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    institution: "",
    studentId: "",
    phone: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const [submitting, setSubmitting] = useState(false);

  if (!listing) {
    return (
      <div className="max-w-[1440px] mx-auto px-20 py-32 text-center">
        <p className="text-xl font-bold text-ink">Listing not found</p>
        <Link to="/search" className="text-brand font-semibold hover:underline">Back to search</Link>
      </div>
    );
  }

  const uni = getUniversity(listing.universityId);
  const totalMonths = 4;
  const rent = listing.pricePerMonth * totalMonths;
  const bookingFee = 500;
  const discount = user?.role === "student" ? Math.round(rent * 0.1) : 0;
  const total = rent + bookingFee - discount;

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      showToast("Please enter your first and last name.", "error");
      return;
    }
    if (!form.institution.trim()) {
      showToast("Please enter your university or college.", "error");
      return;
    }
    if (!form.studentId.trim()) {
      showToast("Please enter your student ID number.", "error");
      return;
    }
    if (method === "mpesa" && !/^0\d{9}$/.test(form.phone)) {
      showToast("Enter a valid M-Pesa phone number, e.g. 0712345678.", "error");
      return;
    }
    if (method === "card") {
      if (!/^\d{13,19}$/.test(form.cardNumber.replace(/\s/g, ""))) {
        showToast("Enter a valid card number.", "error");
        return;
      }
      if (!/^\d{2}\s?\/\s?\d{2}$/.test(form.expiry)) {
        showToast("Enter a valid expiry date, e.g. 09/28.", "error");
        return;
      }
      if (!/^\d{3,4}$/.test(form.cvv)) {
        showToast("Enter a valid CVV.", "error");
        return;
      }
    }
    if (!agree) {
      showToast("Please agree to the housing terms to continue.", "error");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      showToast("Booking confirmed! The host has been notified.", "success");
      navigate("/");
    }, 1200);
  };

  return (
    <div className="w-full">
      <header className="w-full border-b border-line h-[70px] flex items-center justify-between px-20">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-extrabold text-ink">Qrib</span>
        </Link>
        <span className="text-sm font-semibold text-muted flex items-center gap-2">🔒 Secure Student Checkout</span>
      </header>

      <div className="max-w-[1440px] mx-auto px-20 py-12 grid grid-cols-1 lg:grid-cols-[812px_1fr] gap-10">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <h1 className="font-extrabold text-3xl text-ink">Confirm and pay</h1>

          <div className="border border-line rounded-xl p-8">
            <h2 className="font-bold text-xl text-ink mb-5">Student Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-ink">First Name</label>
                <input value={form.firstName} onChange={update("firstName")} className="border border-line rounded-lg p-3.5" placeholder="Wanjiku" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-ink">Last Name</label>
                <input value={form.lastName} onChange={update("lastName")} className="border border-line rounded-lg p-3.5" placeholder="Kamau" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-ink">University / College</label>
                <input value={form.institution} onChange={update("institution")} className="border border-line rounded-lg p-3.5" placeholder={uni?.name} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-ink">Student ID Number</label>
                <input value={form.studentId} onChange={update("studentId")} className="border border-line rounded-lg p-3.5" placeholder="UON-849372" />
              </div>
            </div>
          </div>

          <div className="border border-line rounded-xl p-8">
            <h2 className="font-bold text-xl text-ink mb-5">Payment Method</h2>
            <div className="bg-panel p-1 rounded-xl flex mb-6">
              <button type="button" onClick={() => setMethod("mpesa")} className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition ${method === "mpesa" ? "bg-white text-ink shadow-sm" : "text-muted"}`}>
                📱 M-Pesa
              </button>
              <button type="button" onClick={() => setMethod("card")} className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition ${method === "card" ? "bg-white text-ink shadow-sm" : "text-muted"}`}>
                💳 Credit / Debit Card
              </button>
            </div>

            {method === "mpesa" ? (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-ink">M-Pesa Phone Number</label>
                <input value={form.phone} onChange={update("phone")} className="border border-line rounded-lg p-3.5" placeholder="0712 345 678" />
                <p className="text-xs text-faint">You'll receive an STK push to complete payment.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-ink">Card Number</label>
                  <input value={form.cardNumber} onChange={update("cardNumber")} className="border border-line rounded-lg p-3.5" placeholder="4111 2222 3333 4444" />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-ink">Expiration Date</label>
                    <input value={form.expiry} onChange={update("expiry")} className="border border-line rounded-lg p-3.5" placeholder="09 / 28" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-ink">CVV</label>
                    <input value={form.cvv} onChange={update("cvv")} className="border border-line rounded-lg p-3.5" placeholder="123" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <label className="flex items-start gap-3 text-sm text-muted">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 w-[18px] h-[18px] accent-brand" />
            I agree to the student housing terms, cancellation policies, and confirm I am currently enrolled in a certified higher education institution in Kenya.
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="bg-brand hover:bg-brand-dark transition text-white font-bold py-4 rounded-lg disabled:opacity-60"
          >
            {submitting ? "Processing…" : "Confirm Booking"}
          </button>
        </form>

        {/* Summary */}
        <div className="h-fit border border-line rounded-xl p-6">
          <div className="flex gap-4 mb-6">
            <img src={listing.image} className="w-[100px] h-[100px] object-cover rounded-lg" alt={listing.title} />
            <div>
              {listing.verifiedHost && (
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full">🛡️ VERIFIED HOST</span>
              )}
              <p className="font-bold text-ink mt-2">{listing.title}</p>
              <p className="text-sm text-muted">{listing.area}</p>
            </div>
          </div>
          <hr className="border-line mb-6" />
          <div className="mb-6">
            <p className="text-sm font-semibold text-ink mb-2">Selected Term</p>
            <p className="text-sm text-muted flex items-center gap-2">📅 Sept 2026 – Jan 2027 ({totalMonths} months)</p>
          </div>
          <hr className="border-line mb-6" />
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">KSh {listing.pricePerMonth.toLocaleString()} x {totalMonths} Months Rent</span>
              <span className="font-semibold text-ink">KSh {rent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">All-Inclusive Bills</span>
              <span className="font-semibold text-emerald-600">Free</span>
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
            <div className="flex justify-between">
              <span className="font-bold text-ink">Total (KSh)</span>
              <span className="font-extrabold text-ink text-lg">KSh {total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
