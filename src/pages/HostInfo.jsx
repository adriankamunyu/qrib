import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";

const HOST_VERIFICATION_KEY = "qrib_host_verification";

const defaultVerification = {
  legalName: "",
  phone: "",
  idNumber: "",
  ownershipProof: "",
  address: "",
  photoUploaded: false,
  agreed: false,
};

export default function HostInfo() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const savedVerification = (() => {
    try {
      const raw = localStorage.getItem(HOST_VERIFICATION_KEY);
      return raw ? JSON.parse(raw) : defaultVerification;
    } catch {
      return defaultVerification;
    }
  })();

  const [form, setForm] = useState({
    ...defaultVerification,
    legalName: savedVerification.legalName || user?.name || "",
    phone: savedVerification.phone || "",
    idNumber: savedVerification.idNumber || "",
    ownershipProof: savedVerification.ownershipProof || "",
    address: savedVerification.address || "",
    photoUploaded: savedVerification.photoUploaded || false,
    agreed: savedVerification.agreed || false,
  });

  const updateField = (key) => (event) => {
    const value = key === "photoUploaded" || key === "agreed"
      ? event.target.checked
      : event.target.value;

    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const requiredFields = [
      form.legalName,
      form.phone,
      form.idNumber,
      form.ownershipProof,
      form.address,
    ];

    if (requiredFields.some((value) => !String(value).trim())) {
      showToast("Please complete all host verification fields before continuing.", "error");
      return;
    }

    if (!form.photoUploaded) {
      showToast("Please confirm that you have uploaded at least 3 property photos.", "error");
      return;
    }

    if (!form.agreed) {
      showToast("Please accept the verification and listing agreement.", "error");
      return;
    }

    localStorage.setItem(HOST_VERIFICATION_KEY, JSON.stringify(form));
    showToast("Host verification saved. You can now list your property.", "success");
  };

  const completedFields = [
    form.legalName,
    form.phone,
    form.idNumber,
    form.ownershipProof,
    form.address,
    form.photoUploaded,
    form.agreed,
  ].filter(Boolean).length;

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
            Complete your host verification before publishing any property on Qrib. This helps protect students and keeps fake listings off the platform.
          </p>

          <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            Verification progress: {completedFields}/7 required checks complete.
          </div>

          <div className="mt-6 flex gap-3">
            <Link
              to="/host/dashboard"
              className="inline-block bg-brand text-white px-6 py-3 rounded-lg font-bold"
            >
              Go to host dashboard
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-12 grid md:grid-cols-2 gap-6 border border-line rounded-2xl p-6 md:p-8">
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">Legal full name</label>
            <input
              value={form.legalName}
              onChange={updateField("legalName")}
              className="w-full border border-slate-200 rounded-lg p-3.5"
              placeholder="Full name as on ID"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-2">Phone number</label>
            <input
              value={form.phone}
              onChange={updateField("phone")}
              className="w-full border border-slate-200 rounded-lg p-3.5"
              placeholder="0712345678"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-2">National ID / Passport number</label>
            <input
              value={form.idNumber}
              onChange={updateField("idNumber")}
              className="w-full border border-slate-200 rounded-lg p-3.5"
              placeholder="ID or passport number"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-2">Property ownership / authority proof</label>
            <input
              value={form.ownershipProof}
              onChange={updateField("ownershipProof")}
              className="w-full border border-slate-200 rounded-lg p-3.5"
              placeholder="Title deed, lease, or management letter"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-ink mb-2">Property address / location</label>
            <input
              value={form.address}
              onChange={updateField("address")}
              className="w-full border border-slate-200 rounded-lg p-3.5"
              placeholder="Physical address or exact property location"
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-3 text-sm font-semibold text-ink">
              <input
                type="checkbox"
                checked={form.photoUploaded}
                onChange={updateField("photoUploaded")}
                className="h-4 w-4"
              />
              I have uploaded at least 3 clear property photos.
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-3 text-sm font-semibold text-ink">
              <input
                type="checkbox"
                checked={form.agreed}
                onChange={updateField("agreed")}
                className="h-4 w-4"
              />
              I confirm the information is true and I understand that fraudulent or unverified listings will be rejected.
            </label>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="bg-brand text-white px-6 py-3 rounded-lg font-bold"
            >
              Save host verification
            </button>
          </div>
        </form>

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
