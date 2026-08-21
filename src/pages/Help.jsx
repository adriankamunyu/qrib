import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const sections = [
  { id: "hosts", title: "Host Community", body: "Connect with other verified hosts across Kenya, share tips on tenant screening, and access host-only resources." },
  { id: "safety", title: "Insurance & Safety", body: "All Qrib listings undergo a safety check before going live, and hosts are encouraged to carry basic liability cover." },
  { id: "cancellation", title: "Cancellation Options", body: "Students can cancel free of charge up to 48 hours after booking. After that, cancellation follows the host's stated policy." },
  { id: "trust", title: "Trust & Safety", body: "Report a listing or host at any time — our team reviews all reports within 24 hours." },
];

export default function Help() {
  return (
    <div className="w-full">
      <Navbar />
      <div className="max-w-[900px] mx-auto px-6 py-20">
        <h1 className="font-extrabold text-4xl text-ink mb-10">Help Center</h1>
        <div className="flex flex-col gap-10">
          {sections.map((s) => (
            <div id={s.id} key={s.id} className="border-b border-line pb-8 scroll-mt-24">
              <h2 className="font-bold text-2xl text-ink mb-2">{s.title}</h2>
              <p className="text-muted leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}