import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const statCards = [
  { label: "Total students", value: "1,240", detail: "+12% this month" },
  { label: "Active hosts", value: "84", detail: "6 pending review" },
  { label: "Properties live", value: "206", detail: "18 new listings" },
  { label: "Occupancy rate", value: "91%", detail: "Strong demand" },
];

const recentUsers = [
  { name: "Aisha Njeri", email: "aisha@students.uonbi.ac.ke", role: "Student" },
  { name: "Brian Ochieng", email: "brian@host.co.ke", role: "Host" },
  { name: "Mercy Wambui", email: "mercy@googlemail.com", role: "Student" },
];

const feedItems = [
  "New host approval request from Kileleshwa listings.",
  "Campus demand spike detected in Nairobi West.",
  "Two new property reports were resolved this week.",
  "Monthly rent review published for host partners.",
];

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
              Qrib admin portal
            </p>
            <h1 className="mt-1 text-2xl font-black text-slate-900">
              Welcome back, {user?.name || "Admin"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/search"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
            >
              Browse listings
            </Link>
            <Link
              to="/login"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
            >
              Exit admin
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">{card.label}</p>
              <p className="mt-3 text-3xl font-black text-slate-900">{card.value}</p>
              <p className="mt-2 text-sm text-emerald-600">{card.detail}</p>
            </div>
          ))}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Platform activity
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-900">Recent operations</h2>
              </div>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                Live
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {feedItems.map((item, index) => (
                <div key={item} className="flex items-start gap-4 rounded-xl bg-slate-50 p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <p className="text-sm text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Quick actions
            </p>

            <div className="mt-5 space-y-3">
              <button type="button" className="w-full rounded-xl bg-slate-900 px-4 py-3 text-left text-sm font-bold text-white hover:bg-slate-800">
                Review host applications
              </button>
              <button type="button" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-100">
                View all students
              </button>
              <button type="button" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-100">
                Published listings
              </button>
              <button type="button" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-100">
                Support tickets
              </button>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                User management
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-900">Recent users</h2>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Name</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Email</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {recentUsers.map((person) => (
                  <tr key={person.email}>
                    <td className="px-4 py-3 font-semibold text-slate-800">{person.name}</td>
                    <td className="px-4 py-3 text-slate-600">{person.email}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                        {person.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
