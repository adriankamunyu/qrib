import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const questions = [
  {
    q: "How do I find accommodation?",
    a: "Use the search page to browse properties by city or university.",
  },
  {
    q: "How do I book a property?",
    a: "Open a property and select Book this accommodation.",
  },
  {
    q: "Can I become a host?",
    a: "Yes. Visit the host section to learn how to list your accommodation.",
  },
  {
    q: "Is Qrib only for students?",
    a: "Qrib is designed primarily to connect students with suitable accommodation near their universities.",
  },
];

export default function Help() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-extrabold text-ink">
          How can we help?
        </h1>

        <p className="text-muted mt-3 mb-10">
          Find answers to common Qrib questions.
        </p>

        <div className="space-y-4">
          {questions.map((item) => (
            <div
              key={item.q}
              className="border border-line rounded-xl p-6"
            >
              <h2 className="font-bold text-lg text-ink">{item.q}</h2>
              <p className="text-muted mt-2">{item.a}</p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
