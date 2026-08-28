import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get("mode") === "signup" ? "signup" : "login");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const { login, signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const result =
      mode === "login" ? login(form) : signup({ ...form, role });

    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }
    showToast(mode === "login" ? "Welcome back! Logged in successfully." : "Account created — welcome to Qrib!", "success");
    navigate(role === "host" && mode === "signup" ? "/host" : "/");
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-20 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80"
          alt="Student apartment"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-brand/65" />
        <Link to="/" className="relative flex items-center gap-2 z-10">
          <div className="w-9 h-9 rounded-[10px] bg-brand flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-extrabold text-xl text-slate-200">Qrib</span>
        </Link>
        <div className="relative z-10 flex flex-col gap-6">
          <h1 className="font-extrabold text-5xl leading-tight text-white">
            Karibu — your home near campus starts here
          </h1>
          <p className="text-lg text-slate-200 leading-relaxed">
            Connect with verified hosts, find apartments close to your Kenyan university, and book safely with student discounts.
          </p>
        </div>
        <p className="relative z-10 text-sm text-slate-400">© 2026 Qrib Kenya</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center p-8 sm:p-20">
        <div className="w-full max-w-[440px] flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h2 className="font-extrabold text-3xl text-ink">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-muted">
              {mode === "login"
                ? "Find safe and affordable housing near your university"
                : "Join Qrib to browse or list student accommodation in Kenya"}
            </p>
          </div>

          <div className="bg-panel p-1 rounded-xl flex w-full">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition ${
                mode === "login" ? "bg-white text-ink shadow-sm" : "text-muted"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                mode === "signup" ? "bg-white text-ink shadow-sm" : "text-muted"
              }`}
            >
              Sign Up
            </button>
          </div>

          <button
            type="button"
            onClick={() => showToast("Google sign-in isn't wired to a real backend in this demo.", "info")}
            className="border border-line flex items-center justify-center gap-3 p-3.5 rounded-lg font-semibold text-ink hover:bg-panel transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 w-full">
            <div className="flex-1 h-px bg-line" />
            <span className="text-sm text-muted">or with email</span>
            <div className="flex-1 h-px bg-line" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {mode === "signup" && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-ink">Full Name</label>
                <input
                  required
                  value={form.name}
                  onChange={update("name")}
                  type="text"
                  placeholder="Wanjiku Kamau"
                  className="border border-line rounded-lg p-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-ink">Email Address</label>
              <input
                required
                value={form.email}
                onChange={update("email")}
                type="email"
                placeholder="you@university.ac.ke"
                className="border border-line rounded-lg p-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm font-semibold">
                <label className="text-ink">Password</label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => showToast("Password reset link sent if the account exists.", "info")}
                    className="text-brand"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="border border-line rounded-lg p-3.5 flex items-center justify-between focus-within:ring-2 focus-within:ring-brand/40 focus-within:border-brand">
                <input
                  required
                  minLength={mode === "signup" ? 6 : undefined}
                  value={form.password}
                  onChange={update("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  className="flex-1 outline-none text-[15px]"
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="text-muted">
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-ink">I am signing up as</label>
                <div className="grid grid-cols-2 gap-3">
                  {["student", "host"].map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setRole(r)}
                      className={`p-3 rounded-lg border text-sm font-bold capitalize transition ${
                        role === r ? "border-brand bg-brand/10 text-brand" : "border-line text-muted"
                      }`}
                    >
                      {r === "student" ? "🎓 Student" : "🏠 Host / Landlord"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="bg-brand hover:bg-brand-dark transition p-4 rounded-lg font-bold text-white w-full"
            >
              {mode === "login" ? "Log In" : "Create Account"}
            </button>
          </form>

          {mode === "login" && (
            <p className="text-xs text-faint">
              Demo accounts — student@university.ac.ke / host@qrib.co.ke, password: password123
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
