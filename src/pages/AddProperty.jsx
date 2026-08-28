import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = "qrib_access_token";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { universities } from "../data/universities";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";

const amenitiesList = [
  "WiFi",
  "Water",
  "Security",
  "Laundry",
  "Parking",
  "Study Room",
  "Gym",
];

export default function AddProperty() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    area: "",
    city: "Nairobi",
    universityId: "",
    pricePerMonth: "",
    type: "Apartment",
    bedrooms: "1",
    bathrooms: "1",
    furnished: true,
    image: "",
    description: "",
    distanceKm: "",
  });

  const [amenities, setAmenities] = useState([]);

  const update = (key) => (e) => {
    setForm((current) => ({
      ...current,
      [key]: e.target.value,
    }));
  };

  const toggleAmenity = (amenity) => {
    setAmenities((current) =>
      current.includes(amenity)
        ? current.filter((item) => item !== amenity)
        : [...current, amenity]
    );
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || user.role !== "host") {
      showToast("Only hosts can create properties.", "error");
      navigate("/login");
      return;
    }

    if (!form.title.trim()) {
      showToast("Please enter a property title.", "error");
      return;
    }

    if (!form.universityId) {
      showToast("Please select a nearby university.", "error");
      return;
    }

    if (!form.pricePerMonth || Number(form.pricePerMonth) <= 0) {
      showToast("Please enter a valid monthly rent.", "error");
      return;
    }

    if (!form.description.trim()) {
      showToast("Please enter a property description.", "error");
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem(TOKEN_KEY);

      const response = await fetch(`${API_URL}/properties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title.trim(),
          area: form.area.trim(),
          city: form.city,
          description: form.description.trim(),
          price_per_month: Number(form.pricePerMonth),
          property_type: form.type,
          university_id: form.universityId,
          bedrooms: Number(form.bedrooms),
          bathrooms: Number(form.bathrooms),
          furnished: form.furnished,
          image: form.image.trim() || null,
          distance_km: Number(form.distanceKm) || 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to publish property.");
      }

      showToast("Property published successfully!", "success");
      navigate("/host/dashboard");
    } catch (err) {
      showToast(err.message || "Unable to connect to server.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 lg:px-10 py-12">
        <button
          type="button"
          onClick={() => navigate("/host/dashboard")}
          className="text-sm font-semibold text-brand hover:underline"
        >
          ← Back to dashboard
        </button>

        <div className="mt-6">
          <h1 className="text-3xl font-extrabold text-ink">
            Add a property
          </h1>

          <p className="text-muted mt-2">
            Tell students about your accommodation and publish your listing
            on Qrib.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 border border-line rounded-2xl p-6 md:p-8 space-y-8"
        >
          {/* BASIC INFORMATION */}
          <section>
            <h2 className="text-xl font-bold text-ink">
              Property information
            </h2>

            <div className="grid md:grid-cols-2 gap-5 mt-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-ink mb-2">
                  Property title
                </label>

                <input
                  required
                  value={form.title}
                  onChange={update("title")}
                  placeholder="e.g. Sunrise Student Apartments"
                  className="w-full border border-slate-200 rounded-lg p-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Area
                </label>

                <input
                  required
                  value={form.area}
                  onChange={update("area")}
                  placeholder="e.g. Juja"
                  className="w-full border border-slate-200 rounded-lg p-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  City
                </label>

                <select
                  value={form.city}
                  onChange={update("city")}
                  className="w-full border border-slate-200 rounded-lg p-3.5 bg-white"
                >
                  <option>Nairobi</option>
                  <option>Kiambu</option>
                  <option>Eldoret</option>
                  <option>Njoro</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-ink mb-2">
                  Nearby university
                </label>

                <select
                  required
                  value={form.universityId}
                  onChange={update("universityId")}
                  className="w-full border border-slate-200 rounded-lg p-3.5 bg-white"
                >
                  <option value="">Select university</option>

                  {universities.map((university) => (
                    <option key={university.id} value={university.id}>
                      {university.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* RENT & PROPERTY DETAILS */}
          <section>
            <h2 className="text-xl font-bold text-ink">
              Rent and details
            </h2>

            <div className="grid md:grid-cols-2 gap-5 mt-5">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Monthly rent (KSh)
                </label>

                <input
                  required
                  type="number"
                  min="1"
                  value={form.pricePerMonth}
                  onChange={update("pricePerMonth")}
                  placeholder="10000"
                  className="w-full border border-slate-200 rounded-lg p-3.5"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Property type
                </label>

                <select
                  value={form.type}
                  onChange={update("type")}
                  className="w-full border border-slate-200 rounded-lg p-3.5 bg-white"
                >
                  <option>Apartment</option>
                  <option>Hostel</option>
                  <option>Bedsitter</option>
                  <option>Studio</option>
                  <option>House</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Bedrooms
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.bedrooms}
                  onChange={update("bedrooms")}
                  className="w-full border border-slate-200 rounded-lg p-3.5"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Bathrooms
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.bathrooms}
                  onChange={update("bathrooms")}
                  className="w-full border border-slate-200 rounded-lg p-3.5"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Distance from university (km)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.distanceKm}
                  onChange={update("distanceKm")}
                  placeholder="0.8"
                  className="w-full border border-slate-200 rounded-lg p-3.5"
                />
              </div>

              <div className="flex items-center gap-3 md:pt-8">
                <input
                  id="furnished"
                  type="checkbox"
                  checked={form.furnished}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      furnished: e.target.checked,
                    }))
                  }
                  className="w-5 h-5"
                />

                <label
                  htmlFor="furnished"
                  className="text-sm font-semibold text-ink"
                >
                  Furnished property
                </label>
              </div>
            </div>
          </section>

          {/* AMENITIES */}
          <section>
            <h2 className="text-xl font-bold text-ink">
              Amenities
            </h2>

            <div className="flex flex-wrap gap-3 mt-5">
              {amenitiesList.map((amenity) => {
                const selected = amenities.includes(amenity);

                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-4 py-2.5 rounded-lg border text-sm font-semibold transition ${
                      selected
                        ? "border-brand bg-brand/10 text-brand"
                        : "border-line text-muted hover:border-brand"
                    }`}
                  >
                    {selected ? "✓ " : ""}
                    {amenity}
                  </button>
                );
              })}
            </div>
          </section>

          {/* IMAGE & DESCRIPTION */}
          <section>
            <h2 className="text-xl font-bold text-ink">
              Listing content
            </h2>

            <div className="space-y-5 mt-5">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Property image URL
                </label>

                <input
                  type="url"
                  value={form.image}
                  onChange={update("image")}
                  placeholder="https://example.com/property.jpg"
                  className="w-full border border-slate-200 rounded-lg p-3.5"
                />

                <p className="text-xs text-muted mt-2">
                  You can leave this empty and Qrib will use a default image.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Description
                </label>

                <textarea
                  required
                  rows={6}
                  value={form.description}
                  onChange={update("description")}
                  placeholder="Describe the property, security, nearby facilities, transport, rules, etc."
                  className="w-full border border-slate-200 rounded-lg p-3.5 resize-none"
                />
              </div>
            </div>
          </section>

          {/* SUBMIT */}
          <div className="border-t border-line pt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/host/dashboard")}
              className="border border-line px-6 py-3 rounded-lg font-bold text-ink"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="bg-brand text-white px-7 py-3 rounded-lg font-extrabold hover:opacity-90 transition disabled:opacity-60"
            >
              {submitting ? "Publishing…" : "Publish property"}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}