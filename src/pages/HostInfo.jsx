import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function HostInfo() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="max-w-3xl">
          <p className="text-brand font-bold">For property owners</p>

          <h1 className="text-4xl md:text-5xl font-extrabold text-ink mt-3">
            Turn your accommodation into a student-friendly rental.
          </h1>

          <p className="text-muted text-lg mt-5">
            List your property on Qrib and connect with students looking for
            accommodation near their university.
          </p>

          <Link
            to="/host/dashboard"
            className="inline-block mt-8 bg-brand text-white px-6 py-3 rounded-lg font-bold"
          >
            Go to host dashboard
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-14">
          <div className="border border-line rounded-xl p-6">
            <h2 className="font-bold text-xl">Reach students</h2>
            <p className="text-muted mt-2">
              Put your property in front of students searching for housing.
            </p>
          </div>

          <div className="border border-line rounded-xl p-6">
            <h2 className="font-bold text-xl">Manage listings</h2>
            <p className="text-muted mt-2">
              Keep your property information and availability organized.
            </p>
          </div>

          <div className="border border-line rounded-xl p-6">
            <h2 className="font-bold text-xl">Build trust</h2>
            <p className="text-muted mt-2">
              Verified listings help students make better decisions.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
