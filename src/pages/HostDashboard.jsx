import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/useAuth";
import { getUniversity } from "../data/universities";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
const TOKEN_KEY = "qrib_access_token";
const HOST_VERIFICATION_KEY = "qrib_host_verification";

function getHostVerificationState() {
  try {
    const raw = localStorage.getItem(HOST_VERIFICATION_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);
    return {
      legalName: Boolean(data.legalName && String(data.legalName).trim()),
      phone: Boolean(data.phone && String(data.phone).trim()),
      idNumber: Boolean(data.idNumber && String(data.idNumber).trim()),
      ownershipProof: Boolean(data.ownershipProof && String(data.ownershipProof).trim()),
      address: Boolean(data.address && String(data.address).trim()),
      photoUploaded: Boolean(data.photoUploaded),
      agreed: Boolean(data.agreed),
    };
  } catch {
    return null;
  }
}

function normalizeListing(listing) {
  return {
    id: listing.id,
    title: listing.title || "Student accommodation",
    area: listing.area || "",
    city: listing.city || "",
    description: listing.description || "",
    image: listing.image || "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80",
    pricePerMonth: Number(listing.price_per_month || listing.pricePerMonth || 0),
    type: listing.property_type || listing.type || "Accommodation",
    bedrooms: Number(listing.bedrooms || 0),
    bathrooms: Number(listing.bathrooms || 0),
    furnished: Boolean(listing.furnished),
    distanceKm: Number(listing.distance_km || listing.distanceKm || 0),
    universityId: listing.university_id || listing.universityId,
    hostId: listing.host_id || listing.hostId,
  };
}

export default function HostDashboard() {
  const { user } = useAuth();

  const [hostListings, setHostListings] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const verificationState = getHostVerificationState();
  const verificationComplete = verificationState
    ? Object.values(verificationState).every(Boolean)
    : false;

  useEffect(() => {
    if (!user) return;

    async function loadDashboard() {
      try {
        const token = localStorage.getItem(TOKEN_KEY);

        const [propertiesResponse, bookingsResponse] = await Promise.all([
          fetch(`${API_URL}/properties`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
          fetch(`${API_URL}/bookings`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
        ]);

        const propertiesData = await propertiesResponse.json();
        const bookingsData = await bookingsResponse.json();

        if (!propertiesResponse.ok) {
          throw new Error(propertiesData.error || "Unable to load your listings.");
        }

        if (!bookingsResponse.ok) {
          throw new Error(bookingsData.error || "Unable to load booking requests.");
        }

        const normalizedProperties = Array.isArray(propertiesData)
          ? propertiesData.map(normalizeListing)
          : [];

        const myProperties = normalizedProperties.filter(
          (listing) => Number(listing.hostId) === Number(user.id)
        );

        const normalizedBookings = Array.isArray(bookingsData)
          ? bookingsData
          : [];

        const myBookingRequests = normalizedBookings.filter((booking) => {
          const property = normalizedProperties.find((item) => Number(item.id) === Number(booking.property_id));
          return property && Number(property.hostId) === Number(user.id);
        });

        setHostListings(myProperties);
        setBookingRequests(
          myBookingRequests.map((booking) => ({
            id: booking.id,
            student: booking.student_name || "Student",
            property: normalizedProperties.find((item) => Number(item.id) === Number(booking.property_id))?.title || "Property",
            status: booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : "Pending",
            date: booking.created_at ? new Date(booking.created_at).toLocaleDateString() : "Today",
          }))
        );
      } catch (error) {
        console.error("Host dashboard load error:", error);
        setHostListings([]);
        setBookingRequests([]);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user]);

  const activeListings = hostListings.length;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-6 lg:px-10 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <p className="text-sm text-muted">Host dashboard</p>

            <h1 className="text-3xl font-extrabold text-ink mt-1">
              Welcome, {user?.name || "Host"}
            </h1>

            <p className="text-muted mt-2">
              Manage your Qrib properties and booking requests.
            </p>
          </div>

          <div className="flex gap-3">
            <Link to="/host" className="border border-line px-4 py-2 rounded-lg font-semibold hover:bg-slate-50">
              Host information
            </Link>

            <Link
              to={verificationComplete ? "/host/add-property" : "/host"}
              className={`px-4 py-2 rounded-lg font-bold ${verificationComplete ? "bg-brand text-white hover:opacity-90" : "bg-slate-200 text-slate-500 cursor-not-allowed"}`}
              onClick={(event) => {
                if (!verificationComplete) {
                  event.preventDefault();
                  window.location.href = "/host";
                }
              }}
            >
              {verificationComplete ? "+ Add property" : "Complete verification"}
            </Link>
          </div>
        </div>

        {!verificationComplete && (
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-bold">Complete host verification to publish a property</p>
                <p className="text-sm mt-1">You must verify your identity, property authority, and listing details before listing on Qrib.</p>
              </div>

              <Link to="/host" className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700">
                Finish verification
              </Link>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mt-10">
          <div className="border border-line rounded-xl p-6">
            <p className="text-sm text-muted">Active listings</p>
            <p className="text-3xl font-extrabold text-ink mt-2">{activeListings}</p>
          </div>

          <div className="border border-line rounded-xl p-6">
            <p className="text-sm text-muted">Booking requests</p>
            <p className="text-3xl font-extrabold text-ink mt-2">{bookingRequests.length}</p>
          </div>

          <div className="border border-line rounded-xl p-6">
            <p className="text-sm text-muted">Monthly earnings</p>
            <p className="text-3xl font-extrabold text-ink mt-2">KSh {hostListings.reduce((total, item) => total + Number(item.pricePerMonth || 0), 0).toLocaleString()}</p>
          </div>
        </div>

        <section className="mt-10 rounded-2xl border border-line bg-slate-50 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-ink">Booking requests</h2>
              <p className="text-sm text-muted mt-1">Manage new interest and student inquiries.</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">{bookingRequests.length} requests</span>
          </div>

          <div className="mt-5 space-y-3">
            {loading ? (
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Loading bookings...</div>
            ) : bookingRequests.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">No booking requests yet.</div>
            ) : (
              bookingRequests.map((request) => (
                <div key={request.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold text-slate-800">{request.student}</p>
                    <p className="text-sm text-slate-500">{request.property}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      request.status === "Accepted" || request.status === "Approved"
                        ? "bg-emerald-100 text-emerald-700"
                        : request.status === "Reviewing"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-200 text-slate-700"
                    }`}>
                      {request.status}
                    </span>
                    <span className="text-xs text-slate-400">{request.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-ink">Your listings</h2>
              <p className="text-sm text-muted mt-1">Properties you've published on Qrib.</p>
            </div>
          </div>

          {hostListings.length === 0 ? (
            <div className="border border-line rounded-2xl p-10 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-brand/10 flex items-center justify-center text-2xl font-black text-brand">H</div>

              <h3 className="text-xl font-bold text-ink mt-4">No properties yet</h3>

              <p className="text-muted mt-2 max-w-md mx-auto">
                Add your first property and start connecting with students looking for accommodation.
              </p>

              <Link to="/host/add-property" className="inline-block mt-5 bg-brand text-white px-5 py-3 rounded-lg font-bold hover:opacity-90">
                Add your first property
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {hostListings.map((listing) => {
                const university = getUniversity(listing.universityId);

                return (
                  <div key={listing.id} className="border border-line rounded-2xl overflow-hidden bg-white">
                    <div className="relative h-56">
                      <img
                        src={listing.image}
                        alt={listing.title}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.src = "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80";
                        }}
                        className="w-full h-full object-cover"
                      />

                      <span className="absolute top-3 left-3 bg-white/95 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full">● Active</span>
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-ink">{listing.title}</h3>
                          <p className="text-sm text-muted mt-1">{listing.area}, {listing.city}</p>
                        </div>

                        <p className="font-extrabold text-lg text-ink whitespace-nowrap">KSh {listing.pricePerMonth.toLocaleString()}</p>
                      </div>

                      <p className="text-sm text-brand font-semibold mt-3">{listing.distanceKm} km from {university?.name || "university"}</p>

                      <div className="flex flex-wrap gap-2 mt-4">
                        <span className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700">{listing.type}</span>
                        <span className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700">{listing.bedrooms} bedroom</span>
                        <span className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700">{listing.bathrooms} bathroom</span>
                        {listing.furnished && (
                          <span className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700">Furnished</span>
                        )}
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