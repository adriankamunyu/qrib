import { Link } from "react-router-dom";
import { useMemo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/useAuth";
import { getUniversity } from "../data/universities";

const DEMO_LISTINGS_KEY = "qrib_listings";

function loadHostListings(email) {
  try {
    const listings =
      JSON.parse(localStorage.getItem(DEMO_LISTINGS_KEY)) || [];

    return listings.filter(
      (listing) => listing.hostEmail === email
    );
  } catch {
    return [];
  }
}

export default function HostDashboard() {
  const { user } = useAuth();

  const hostEmail = user?.email;

const hostListings = useMemo(() => {
  if (!hostEmail) return [];
   return loadHostListings(hostEmail);
},  [hostEmail]);
  const activeListings = hostListings.length;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-6 lg:px-10 py-12">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <p className="text-sm text-muted">
              Host dashboard
            </p>

            <h1 className="text-3xl font-extrabold text-ink mt-1">
              Welcome, {user?.name || "Host"}
            </h1>

            <p className="text-muted mt-2">
              Manage your Qrib properties and booking requests.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/host"
              className="border border-line px-4 py-2 rounded-lg font-semibold hover:bg-slate-50"
            >
              Host information
            </Link>

            <Link
              to="/host/add-property"
              className="bg-brand text-white px-4 py-2 rounded-lg font-bold hover:opacity-90"
            >
              + Add property
            </Link>
          </div>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-6 mt-10">

          <div className="border border-line rounded-xl p-6">
            <p className="text-sm text-muted">
              Active listings
            </p>

            <p className="text-3xl font-extrabold text-ink mt-2">
              {activeListings}
            </p>
          </div>

          <div className="border border-line rounded-xl p-6">
            <p className="text-sm text-muted">
              Booking requests
            </p>

            <p className="text-3xl font-extrabold text-ink mt-2">
              0
            </p>
          </div>

          <div className="border border-line rounded-xl p-6">
            <p className="text-sm text-muted">
              Monthly earnings
            </p>

            <p className="text-3xl font-extrabold text-ink mt-2">
              KSh 0
            </p>
          </div>

        </div>

        {/* LISTINGS */}
        <section className="mt-10">

          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-ink">
                Your listings
              </h2>

              <p className="text-sm text-muted mt-1">
                Properties you've published on Qrib.
              </p>
            </div>
          </div>

          {hostListings.length === 0 ? (
            <div className="border border-line rounded-2xl p-10 text-center">

              <div className="w-14 h-14 mx-auto rounded-full bg-brand/10 flex items-center justify-center text-2xl font-black text-brand">
                H
              </div>

              <h3 className="text-xl font-bold text-ink mt-4">
                No properties yet
              </h3>

              <p className="text-muted mt-2 max-w-md mx-auto">
                Add your first property and start connecting with
                students looking for accommodation.
              </p>

              <Link
                to="/host/add-property"
                className="inline-block mt-5 bg-brand text-white px-5 py-3 rounded-lg font-bold hover:opacity-90"
              >
                Add your first property
              </Link>

            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">

              {hostListings.map((listing) => {
                const university = getUniversity(
                  listing.universityId
                );

                return (
                  <div
                    key={listing.id}
                    className="border border-line rounded-2xl overflow-hidden bg-white"
                  >

                    {/* IMAGE */}
                    <div className="relative h-56">
                      <img
                        src={listing.image}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />

                      <span className="absolute top-3 left-3 bg-white/95 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full">
                        ● Active
                      </span>
                    </div>

                    {/* CONTENT */}
                    <div className="p-6">

                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-ink">
                            {listing.title}
                          </h3>

                          <p className="text-sm text-muted mt-1">
                            {listing.area}, {listing.city}
                          </p>
                        </div>

                        <p className="font-extrabold text-lg text-ink whitespace-nowrap">
                          KSh{" "}
                          {listing.pricePerMonth.toLocaleString()}
                        </p>
                      </div>

                      <p className="text-sm text-brand font-semibold mt-3">
                        {listing.distanceKm} km from{" "}
                        {university?.name || "university"}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-4">

                        <span className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700">
                          {listing.type}
                        </span>

                        <span className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700">
                          {listing.bedrooms} bedroom
                        </span>

                        <span className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700">
                          {listing.bathrooms} bathroom
                        </span>

                        {listing.furnished && (
                          <span className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700">
                            Furnished
                          </span>
                        )}

                      </div>

                      <div className="flex gap-3 mt-6">

                        <Link
                          to={`/property/${listing.id}`}
                          className="flex-1 text-center border border-line px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-50"
                        >
                          View
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            alert(
                              "Property editing will be added next."
                            )
                          }
                          className="flex-1 border border-line px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-50"
                        >
                          Edit
                        </button>

                      </div>

                    </div>
                  </div>
                );
              })}

            </div>
          )}

        </section>

      </main>

      <Footer />
    </div>
  );
}