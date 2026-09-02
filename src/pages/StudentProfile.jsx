import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";

const PROFILE_KEY = "qrib_student_profile";

const UNIVERSITIES = [
  "University of Nairobi",
  "Kenyatta University",
  "Strathmore University",
  "USIU Africa",
  "KCA University",
  "JKUAT",
  "Moi University",
  "Egerton University",
  "Maseno University",
  "Dedan Kimathi University",
];

const COURSES = [
  "Computer Science",
  "Information Technology",
  "Business Administration",
  "Engineering",
  "Medicine",
  "Law",
  "Education",
  "Economics",
  "Architecture",
  "Nursing",
  "Other",
];

function loadProfile() {
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export default function StudentProfile() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const saved = loadProfile();

  const [form, setForm] = useState({
    phone: saved.phone || "",
    university: saved.university || "",
    course: saved.course || "",
    yearOfStudy: saved.yearOfStudy || "1",
    studentId: saved.studentId || "",
    bio: saved.bio || "",
  });

  const [saving, setSaving] = useState(false);

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const completionFields = [
    form.phone,
    form.university,
    form.course,
    form.yearOfStudy,
    form.studentId,
    form.bio,
  ];
  const filled = completionFields.filter(Boolean).length;
  const completion = Math.round((filled / completionFields.length) * 100);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.university) {
      showToast("Please select your university.", "error");
      return;
    }
    if (!form.course) {
      showToast("Please select your course.", "error");
      return;
    }
    if (form.phone && !/^0\d{9}$/.test(form.phone)) {
      showToast("Enter a valid phone number, e.g. 0712345678.", "error");
      return;
    }

    setSaving(true);

    setTimeout(() => {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(form));
      setSaving(false);
      showToast("Profile saved successfully!", "success");
      navigate("/student/dashboard");
    }, 800);
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "S";

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <Navbar />

      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <button
          type="button"
          onClick={() => navigate("/student/dashboard")}
          className="text-sm font-semibold text-blue-600 hover:underline"
        >
          ← Back to dashboard
        </button>

        <div className="mt-6">
          <h1 className="text-3xl font-black text-slate-900">
            Your profile
          </h1>
          <p className="mt-2 text-slate-500">
            Complete your profile so hosts know more about you.
          </p>
        </div>

        {/* Profile card */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-xl font-black text-white">
              {initials}
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900">
                {user?.name || "Student"}
              </h2>
              <p className="text-sm text-slate-500">{user?.email || ""}</p>
            </div>
          </div>

          {/* Completion bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                Profile completion
              </span>
              <span className="text-xs font-black text-blue-600">
                {completion}%
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 space-y-8"
        >
          {/* Academic info */}
          <section>
            <h2 className="text-xl font-bold text-slate-900">
              Academic information
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  University / College
                </label>
                <select
                  value={form.university}
                  onChange={update("university")}
                  className="w-full rounded-lg border border-slate-200 bg-white p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="">Select your university</option>
                  {UNIVERSITIES.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Course / Programme
                </label>
                <select
                  value={form.course}
                  onChange={update("course")}
                  className="w-full rounded-lg border border-slate-200 bg-white p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="">Select your course</option>
                  {COURSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Year of study
                </label>
                <select
                  value={form.yearOfStudy}
                  onChange={update("yearOfStudy")}
                  className="w-full rounded-lg border border-slate-200 bg-white p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                  <option value="5">Year 5+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Student ID number
                </label>
                <input
                  value={form.studentId}
                  onChange={update("studentId")}
                  placeholder="e.g. UON-849372"
                  className="w-full rounded-lg border border-slate-200 p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Phone number
                </label>
                <input
                  value={form.phone}
                  onChange={update("phone")}
                  placeholder="0712 345 678"
                  className="w-full rounded-lg border border-slate-200 p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>
          </section>

          {/* Bio */}
          <section>
            <h2 className="text-xl font-bold text-slate-900">About you</h2>
            <p className="mt-1 text-sm text-slate-500">
              Tell hosts a little about yourself.
            </p>

            <textarea
              rows={4}
              value={form.bio}
              onChange={update("bio")}
              placeholder="e.g. I'm a 2nd year CS student at UoN, looking for a quiet place close to campus..."
              className="mt-4 w-full rounded-lg border border-slate-200 p-3.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </section>

          {/* Actions */}
          <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/student/dashboard")}
              className="rounded-lg border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-7 py-3 text-sm font-extrabold text-white hover:bg-blue-700 transition disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save profile"}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
