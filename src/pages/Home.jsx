import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PropertyCard from "../components/PropertyCard";
import { listings } from "../data/listings";
import { universities } from "../data/universities";

const destinations = [
  { city: "Nairobi", blurb: "Home to UoN, KU, Strathmore, USIU & more", img: "https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=700&q=80" },
  { city: "Kiambu", blurb: "JKUAT & surrounding student towns", img: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=700&q=80" },
  { city: "Eldoret", blurb: "Moi University neighbourhood", img: "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=700&q=80" },
  { city: "Njoro", blurb: "Egerton University area", img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=700&q=80" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const featured = listings.slice(0, 4);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="w-full">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[560px] flex items-center justify-center text-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1600&q=80"
          alt="Kenyan university campus housing"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/60" />
        <div className="relative z-10 max-w-3xl px-6 flex flex-col items-center gap-6">
          <h1 className="text-white font-extrabold text-4xl sm:text-5xl leading-tight">
            Find safe, affordable housing near your Kenyan university
          </h1>
          <p className="text-slate-200 text-lg">
            Verified apartments and hostels around UoN, KU, JKUAT, Strathmore, USIU, Moi & more.
          </p>
          <form onSubmit={handleSearch} className="bg-white rounded-xl p-2 flex items-center gap-2 w-full max-w-xl shadow-lg">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by university, e.g. Kenyatta University"
              className="flex-1 px-4 py-3 outline-none text-ink text-sm"
            />
            <button type="submit" className="bg-brand hover:bg-brand-dark transition text-white font-bold px-6 py-3 rounded-lg text-sm">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Trust signals */}
      <section id="how-it-works" className="max-w-[1440px] mx-auto px-20 py-9 grid grid-cols-1 sm:grid-cols-3 gap-10">
        {[
          { icon: "🛡️", title: "Verified Hosts", desc: "All listings checked for safety" },
          { icon: "🔒", title: "Secure Booking", desc: "Encrypted payments & hold deposits" },
          { icon: "🎟️", title: "Student Discounts", desc: "Save on average 15% with student ID" },
        ].map((s) => (
          <div key={s.title} className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-2xl shrink-0">
              {s.icon}
            </div>
            <div>
              <p className="font-bold text-ink">{s.title}</p>
              <p className="text-sm text-muted">{s.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Featured listings */}
      <section className="max-w-[1440px] mx-auto px-20 py-20">
        <div className="flex items-end justify-between mb-11 flex-wrap gap-4">
          <div>
            <h2 className="font-extrabold text-3xl text-ink mb-2">Featured student properties</h2>
            <p className="text-muted">Highly rated accommodation near major Kenyan campuses</p>
          </div>
          <Link to="/search" className="text-brand font-semibold hover:underline">
            View All Properties →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((l) => (
            <PropertyCard key={l.id} listing={l} />
          ))}
        </div>
      </section>

      {/* Destinations */}
      <section className="max-w-[1440px] mx-auto px-20 py-12">
        <h2 className="font-extrabold text-3xl text-ink mb-8">Popular destinations for Kenyan students</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((d) => (
            <button
              key={d.city}
              onClick={() => navigate(`/search?city=${encodeURIComponent(d.city)}`)}
              className="relative h-[320px] rounded-xl overflow-hidden text-left group"
            >
              <img src={d.img} alt={d.city} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
              <div className="absolute bottom-5 left-5 text-white">
                <p className="font-extrabold text-xl">{d.city}</p>
                <p className="text-sm text-slate-200">{d.blurb}</p>
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-faint mt-6">
          Covering {universities.length} major institutions across Kenya, including{" "}
          {universities.slice(0, 3).map((u) => u.name).join(", ")} and more.
        </p>
      </section>

      <Footer />
    </div>
  );
}
