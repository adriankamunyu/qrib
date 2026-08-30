import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";

export default function Login() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const { login, signup, googleLogin } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState(
    params.get("mode") === "signup" ? "signup" : "login"
  );

  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  // ---------------------------------------------------------
  // UPDATE FORM
  // ---------------------------------------------------------

  const update = (key) => (e) => {
    setForm((current) => ({
      ...current,
      [key]: e.target.value,
    }));
  };

  // ---------------------------------------------------------
  // SWITCH LOGIN / SIGNUP
  // ---------------------------------------------------------

  const switchMode = (newMode) => {
    if (loading) return;

    setMode(newMode);

    setForm({
      name: "",
      email: "",
      password: "",
    });

    setRole("student");
    setShowPassword(false);
  };

  // ---------------------------------------------------------
  // SUBMIT
  // ---------------------------------------------------------

  const handleGoogleLogin = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const demoGoogleUser = {
        name: "Google Demo User",
        email: "demo.google@qrib.app",
        googleId: "google-demo-user-001",
        role: "student",
      };

      const result = await googleLogin(demoGoogleUser);

      if (!result || !result.ok) {
        showToast(
          result?.message || "Google sign-in failed.",
          "error"
        );
        return;
      }

      showToast("Google sign-in successful.", "success");

      if (result.user?.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      if (result.user?.role === "host") {
        navigate("/host/dashboard", { replace: true });
        return;
      }

      navigate("/student/dashboard", { replace: true });
    } catch (error) {
      console.error("Google login error:", error);
      showToast("Google sign-in is unavailable right now.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const email = form.email.trim();
    const password = form.password;

    // Basic validation
    if (!email) {
      showToast("Please enter your email address.", "error");
      return;
    }

    if (!password) {
      showToast("Please enter your password.", "error");
      return;
    }

    if (mode === "signup") {
      if (!form.name.trim()) {
        showToast("Please enter your full name.", "error");
        return;
      }

      if (password.length < 6) {
        showToast(
          "Password must contain at least 6 characters.",
          "error"
        );
        return;
      }
    }

    setLoading(true);

    try {
      let result;

      // -------------------------------------------------------
      // LOGIN
      // -------------------------------------------------------

      if (mode === "login") {
        result = await login({
          email,
          password,
        });
      }

      // -------------------------------------------------------
      // SIGNUP
      // -------------------------------------------------------

      else {
        result = await signup({
          name: form.name.trim(),
          email,
          password,
          role,
        });
      }

      // -------------------------------------------------------
      // AUTH FAILED
      // -------------------------------------------------------

      if (!result || !result.ok) {
        showToast(
          result?.message ||
            "Authentication failed. Please try again.",
          "error"
        );

        return;
      }

      // -------------------------------------------------------
      // AUTH SUCCESS
      // -------------------------------------------------------

      const loggedInUser = result.user;

      showToast(
        mode === "login"
          ? "Welcome back. You are now logged in."
          : "Account created successfully. Welcome to Qrib.",
        "success"
      );

      // -------------------------------------------------------
      // REDIRECT BASED ON BACKEND ROLE
      // -------------------------------------------------------

      if (loggedInUser?.role === "host") {
        navigate("/host/dashboard", {
          replace: true,
        });
      } else {
        navigate("/student/dashboard", {
          replace: true,
        });
      }
    } catch (error) {
      console.error("Authentication error:", error);

      showToast(
        "Something went wrong. Please check your connection and try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // COMPONENT
  // ---------------------------------------------------------

  return (
    <div className="min-h-screen w-full flex bg-white">

      {/* =====================================================
          LEFT BRAND PANEL
      ====================================================== */}

      <div className="hidden lg:flex relative w-1/2 min-h-screen overflow-hidden bg-slate-950">

        {/* Background */}
        <div className="absolute inset-0">

          <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-blue-600/30 blur-3xl" />

          <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-blue-400/20 blur-3xl" />

          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950" />

        </div>

        {/* Left content */}

        <div className="relative z-10 flex flex-col justify-between w-full p-14 xl:p-20">

          {/* LOGO */}

          <Link
            to="/"
            className="inline-flex items-center gap-3 w-fit"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">

              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path
                  d="M3 10.5 12 3l9 7.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <path
                  d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

            </div>

            <span className="font-extrabold text-2xl text-white tracking-tight">
              Qrib
            </span>
          </Link>

          {/* HERO */}

          <div className="max-w-xl">

            <div className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2">

              <span className="text-sm font-medium text-blue-200">
                Student housing, simplified
              </span>

            </div>

            <h1 className="font-extrabold text-5xl xl:text-6xl leading-[1.05] text-white tracking-tight">
              Your home near campus starts here.
            </h1>

            <p className="mt-6 text-lg xl:text-xl text-slate-300 leading-relaxed max-w-lg">
              Find safe, affordable accommodation close to
              your university. Connect with trusted hosts and
              manage your stay through Qrib.
            </p>

            {/* FEATURE CARDS */}

            <div className="mt-10 grid grid-cols-2 gap-4 max-w-lg">

              {/* FEATURE 1 */}

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">

                <div className="w-9 h-9 rounded-lg bg-blue-600/20 flex items-center justify-center mb-4">

                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="text-blue-300"
                    strokeWidth="2"
                  >
                    <path
                      d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <path
                      d="m9 12 2 2 4-4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                </div>

                <p className="text-sm font-semibold text-white">
                  Trusted housing
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Discover accommodation from hosts on Qrib.
                </p>

              </div>

              {/* FEATURE 2 */}

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">

                <div className="w-9 h-9 rounded-lg bg-blue-600/20 flex items-center justify-center mb-4">

                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="text-blue-300"
                    strokeWidth="2"
                  >
                    <path
                      d="M4 5h16v14H4z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M8 9h8M8 13h5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                </div>

                <p className="text-sm font-semibold text-white">
                  Easy booking
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Manage your accommodation in one place.
                </p>

              </div>

            </div>

          </div>

          {/* FOOTER */}

          <div className="flex items-center justify-between">

            <p className="text-sm text-slate-400">
              © 2026 Qrib Kenya
            </p>

            <p className="text-sm text-slate-500">
              Student accommodation platform
            </p>

          </div>

        </div>

      </div>

      {/* =====================================================
          RIGHT AUTH PANEL
      ====================================================== */}

      <div className="flex flex-1 min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:px-14 xl:px-20">

        <div className="w-full max-w-[460px]">

          {/* MOBILE LOGO */}

          <div className="lg:hidden mb-10">

            <Link
              to="/"
              className="inline-flex items-center gap-3"
            >

              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">

                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
                  <path
                    d="M3 10.5 12 3l9 7.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

              </div>

              <span className="font-extrabold text-xl text-slate-900">
                Qrib
              </span>

            </Link>

          </div>

          {/* HEADER */}

          <div className="mb-8">

            <h2 className="font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
              {mode === "login"
                ? "Welcome back"
                : "Create your account"}
            </h2>

            <p className="mt-3 text-slate-500 leading-relaxed">
              {mode === "login"
                ? "Sign in to continue finding your next home near campus."
                : "Create an account to find accommodation or list your property."}
            </p>

          </div>

          {/* LOGIN / SIGNUP SWITCH */}

          <div className="bg-slate-100 p-1 rounded-xl flex w-full mb-7">

            <button
              type="button"
              disabled={loading}
              onClick={() => switchMode("login")}
              className={`flex-1 py-3 rounded-lg text-sm font-bold transition ${
                mode === "login"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              } ${
                loading
                  ? "cursor-not-allowed opacity-60"
                  : ""
              }`}
            >
              Log In
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => switchMode("signup")}
              className={`flex-1 py-3 rounded-lg text-sm font-bold transition ${
                mode === "signup"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              } ${
                loading
                  ? "cursor-not-allowed opacity-60"
                  : ""
              }`}
            >
              Sign Up
            </button>

          </div>

          {/* GOOGLE */}

          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full border border-slate-200 bg-white flex items-center justify-center gap-3 p-3.5 rounded-xl font-semibold text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >

            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.065.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />

              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
              />

              <path
                fill="#FBBC05"
                d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93z"
              />

              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>

            Continue with Google

          </button>

          {/* DIVIDER */}

          <div className="flex items-center gap-4 my-7">

            <div className="flex-1 h-px bg-slate-200" />

            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              or continue with email
            </span>

            <div className="flex-1 h-px bg-slate-200" />

          </div>

          {/* =================================================
              FORM
          ================================================== */}

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >

            {/* NAME */}

            {mode === "signup" && (
              <div className="flex flex-col gap-2">

                <label
                  htmlFor="name"
                  className="text-sm font-semibold text-slate-900"
                >
                  Full Name
                </label>

                <input
                  id="name"
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={update("name")}
                  type="text"
                  placeholder="Wanjiku Kamau"
                  disabled={loading}
                  className="w-full border border-slate-200 rounded-xl p-3.5 text-[15px] text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition disabled:bg-slate-50 disabled:cursor-not-allowed"
                />

              </div>
            )}

            {/* EMAIL */}

            <div className="flex flex-col gap-2">

              <label
                htmlFor="email"
                className="text-sm font-semibold text-slate-900"
              >
                Email Address
              </label>

              <input
                id="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={update("email")}
                type="email"
                placeholder="you@university.ac.ke"
                disabled={loading}
                className="w-full border border-slate-200 rounded-xl p-3.5 text-[15px] text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition disabled:bg-slate-50 disabled:cursor-not-allowed"
              />

            </div>

            {/* PASSWORD */}

            <div className="flex flex-col gap-2">

              <div className="flex items-center justify-between">

                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-slate-900"
                >
                  Password
                </label>

                {mode === "login" && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      showToast(
                        "Password reset is not connected yet.",
                        "info"
                      )
                    }
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition disabled:opacity-50"
                  >
                    Forgot password?
                  </button>
                )}

              </div>

              <div className="border border-slate-200 rounded-xl p-3.5 flex items-center gap-3 bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition">

                <input
                  id="password"
                  required
                  minLength={
                    mode === "signup" ? 6 : undefined
                  }
                  autoComplete={
                    mode === "login"
                      ? "current-password"
                      : "new-password"
                  }
                  value={form.password}
                  onChange={update("password")}
                  type={
                    showPassword ? "text" : "password"
                  }
                  placeholder="Enter your password"
                  disabled={loading}
                  className="flex-1 min-w-0 outline-none text-[15px] text-slate-900 bg-transparent placeholder:text-slate-400 disabled:cursor-not-allowed"
                />

                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  className="flex-shrink-0 text-slate-400 hover:text-slate-700 transition disabled:opacity-50"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >

                  {showPassword ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        d="M3 3l18 18"
                        strokeLinecap="round"
                      />

                      <path
                        d="M10.6 10.6a2 2 0 0 0 2.8 2.8"
                        strokeLinecap="round"
                      />

                      <path
                        d="M9.9 4.2A10.7 10.7 0 0 1 12 4c5.2 0 9.2 4 10 8-.3 1.5-1.1 3-2.3 4.2M6.6 6.6C4.5 8 3.3 10 2 12c.8 4 4.8 8 10 8 1.6 0 3.1-.4 4.4-1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                      />
                    </svg>
                  )}

                </button>

              </div>

              {mode === "signup" && (
                <p className="text-xs text-slate-400">
                  Use at least 6 characters.
                </p>
              )}

            </div>

            {/* =================================================
                ROLE
            ================================================== */}

            {mode === "signup" && (
              <div className="flex flex-col gap-3">

                <label className="text-sm font-semibold text-slate-900">
                  Account Type
                </label>

                <div className="grid grid-cols-2 gap-3">

                  {/* STUDENT */}

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setRole("student")}
                    className={`text-left p-4 rounded-xl border transition ${
                      role === "student"
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    } ${
                      loading
                        ? "cursor-not-allowed opacity-60"
                        : ""
                    }`}
                  >

                    <div className="flex items-center justify-between">

                      <span
                        className={`font-bold text-sm ${
                          role === "student"
                            ? "text-blue-700"
                            : "text-slate-800"
                        }`}
                      >
                        Student
                      </span>

                      {role === "student" && (
                        <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">

                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                          >
                            <path
                              d="m5 12 4 4L19 6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>

                        </span>
                      )}

                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      Find accommodation
                    </p>

                  </button>

                  {/* HOST */}

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setRole("host")}
                    className={`text-left p-4 rounded-xl border transition ${
                      role === "host"
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    } ${
                      loading
                        ? "cursor-not-allowed opacity-60"
                        : ""
                    }`}
                  >

                    <div className="flex items-center justify-between">

                      <span
                        className={`font-bold text-sm ${
                          role === "host"
                            ? "text-blue-700"
                            : "text-slate-800"
                        }`}
                      >
                        Host
                      </span>

                      {role === "host" && (
                        <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">

                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                          >
                            <path
                              d="m5 12 4 4L19 6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>

                        </span>
                      )}

                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      List your property
                    </p>

                  </button>

                </div>

              </div>
            )}

            {/* =================================================
                SUBMIT BUTTON
            ================================================== */}

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 p-4 rounded-xl font-bold text-base text-white shadow-md transition ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
              }`}
            >

              {loading ? (
                <>
                  <svg
                    className="animate-spin"
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="3"
                      opacity="0.3"
                    />

                    <path
                      d="M21 12a9 9 0 0 0-9-9"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>

                  {mode === "login"
                    ? "Signing in..."
                    : "Creating account..."}
                </>
              ) : (
                <>
                  {mode === "login"
                    ? "Log In"
                    : "Create Account"}

                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d="M5 12h14"
                      strokeLinecap="round"
                    />

                    <path
                      d="m13 6 6 6-6 6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </>
              )}

            </button>

          </form>

          {/* FOOTER */}

          <p className="text-center text-xs text-slate-400 mt-8">
            By continuing, you agree to Qrib's terms and privacy
            policy.
          </p>

        </div>

      </div>

    </div>
  );
}