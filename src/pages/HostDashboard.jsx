import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

export default function HostDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-6 lg:px-10 py-12">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">Host dashboard</p>
            <h1 className="text-3xl font-extrabold text-ink mt-1">
              Welcome, {user?.name || "Host"}
            </h1>
          </div>

          <Link
            to="/host"
            className="border border-line px-4 py-2 rounded-lg font-semibold"
          >
            Host information
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-10">
          <div className="border border-line rounded-xl p-6">
            <p className="text-sm text-muted">Active listings</p>
            <p className="text-3xl font-extrabold text-ink mt-2">0</p>
          </div>

          <div className="border border-line rounded-xl p-6">
            <p className="text-sm text-muted">Booking requests</p>
            <p className="text-3xl font-extrabold text-ink mt-2">0</p>
          </div>

          <div className="border border-line rounded-xl p-6">
            <p className="text-sm text-muted">Monthly earnings</p>
            <p className="text-3xl font-extrabold text-ink mt-2">
              KSh 0
            </p>
          </div>
        </div>

        <div className="mt-10 border border-line rounded-2xl p-8">
          <h2 className="text-xl font-bold text-ink">
            Your listings
          </h2>

          <p className="text-muted mt-2">
            You don't have any properties listed yet.
          </p>

          <button
            type="button"
            className="mt-5 bg-brand text-white px-5 py-3 rounded-lg font-bold"
            onClick={() =>
              alert("Listing creation will be added next.")
            }
          >
            Add a property
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
