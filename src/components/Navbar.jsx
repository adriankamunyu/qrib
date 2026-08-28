import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="w-full border-b border-line bg-white sticky top-0 z-40">
      <div className="max-w-[1440px] mx-auto h-20 px-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-[10px] bg-brand flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-extrabold text-lg text-ink">Qrib</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted">
          <Link to="/search" className="hover:text-brand transition">Explore</Link>
          <a href="#how-it-works" className="hover:text-brand transition">How it works</a>
          <Link
            to={user?.role === "host" ? "/host" : "/host-info"}
            className="hover:text-brand transition"
          >
            List a property
          </Link>
          <Link to="/help" className="hover:text-brand transition">Help</Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="hidden sm:inline text-sm font-semibold text-ink">
                Hi, {user.name.split(" ")[0]}
                <span className="ml-1 text-[10px] uppercase tracking-wide bg-brand/10 text-brand px-2 py-0.5 rounded-full align-middle">
                  {user.role}
                </span>
              </span>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="text-sm font-semibold text-muted hover:text-ink transition"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-ink hover:text-brand transition">
                Sign In
              </Link>
              <Link
                to="/login?mode=signup"
                className="bg-brand hover:bg-brand-dark transition text-white text-sm font-bold px-5 py-2.5 rounded-lg"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
