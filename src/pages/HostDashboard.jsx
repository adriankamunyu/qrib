import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { universities } from "../data/universities";
import { listings as allListings } from "../data/listings";

export default function HostDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ title: "", universityId: universities[0].id, price: "", type: "Private Room" });
  const myListings = allListings.slice(0, 2); // demo: show a couple as "your listings"

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.price) {
      showToast("Please fill in the property title and price.", "error");
      return;
    }
    showToast(`"${form.title}" was submitted for review. It'll appear once approved.`, "success");
    setForm({ title: "", universityId: universities[0].id, price: "", type: "Private Room" });
  };

  return (
    <div className="w-full">
      <Navbar />
      <div className="max-w-[1440px] mx-auto px-20 py-16">
        <div className="mb-10">
          <span className="text-xs uppercase font-bold text-brand bg-brand/10 px-3 py-1 rounded-full">Host Dashboard</span>
          <h1 className="font-extrabold text-3xl text-ink mt-3">Welcome, {user.name}</h1>
          <p className="text-muted">Manage your listings and add new student accommodation.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10">
          <div>
            <h2 className="font-bold text-xl text-ink mb-5">Your listings</h2>
            <div className="flex flex-col gap-4">
              {myListings.map((l) => (
                <div key={l.id} className="flex gap-4 border border-line rounded-xl p-4">
                  <img src={l.image} className="w-24 h-24 object-cover rounded-lg" alt={l.title} />
                  <div className="flex-1">
                    <p className="font-bold text-ink">{l.title}</p>
                    <p className="text-sm text-muted">{l.area}</p>
                    <p className="font-semibold text-ink mt-1">KSh {l.pricePerMonth.toLocaleString()} / month</p>
                  </div>
                  <span className="h-fit text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">Active</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-line rounded-xl p-8 h-fit">
            <h2 className="font-bold text-xl text-ink mb-5">List a new property</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-ink">Property Title</label>
                <input value={form.title} onChange={update("title")} className="border border-line rounded-lg p-3" placeholder="e.g. Cozy Bedsitter near KU" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-ink">Nearest University</label>
                <select value={form.universityId} onChange={update("universityId")} className="border border-line rounded-lg p-3">
                  {universities.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-ink">Property Type</label>
                <select value={form.type} onChange={update("type")} className="border border-line rounded-lg p-3">
                  <option>Private Room</option>
                  <option>Entire Studio</option>
                  <option>Shared Flat</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-ink">Price (KSh / month)</label>
                <input value={form.price} onChange={update("price")} type="number" className="border border-line rounded-lg p-3" placeholder="12000" />
              </div>
              <button type="submit" className="bg-brand hover:bg-brand-dark transition text-white font-bold py-3 rounded-lg mt-2">
                Submit Listing
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
