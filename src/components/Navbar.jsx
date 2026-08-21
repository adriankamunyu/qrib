import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <nav className="max-w-[1440px] mx-auto px-6 lg:px-20 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          className="text-2xl font-extrabold text-brand"
        >
          Qrib
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-7">
          <Link
            to="/search"
            className="text-sm font-semibold text-slate-800 hover:text-brand transition"
          >
            Find accommodation
          </Link>

          <Link
            to="/help"
            className="text-sm font-semibold text-slate-800 hover:text-brand transition"
          >
            Help
          </Link>

          {user?.role === "host" && (
            <Link
              to="/host/dashboard"
              className="text-sm font-semibold text-slate-800 hover:text-brand transition"
            >
              Host dashboard
            </Link>
          )}

          {!user ? (
            <Link
              to="/login"
              className="inline-flex items-center justify-center bg-brand text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 transition shadow-sm"
            >
              Log in
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-slate-800">
                Hi, {user.name.split(" ")[0]}
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-bold text-red-600 hover:text-red-700 transition"
              >
                Log out
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 text-slate-800 hover:bg-slate-50"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <span className="text-2xl leading-none">×</span>
          ) : (
            <span className="text-2xl leading-none">☰</span>
          )}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white shadow-lg">
          <div className="px-6 py-5 flex flex-col gap-4">
            <Link
              to="/search"
              onClick={closeMenu}
              className="text-sm font-semibold text-slate-800 hover:text-brand"
            >
              Find accommodation
            </Link>

            <Link
              to="/help"
              onClick={closeMenu}
              className="text-sm font-semibold text-slate-800 hover:text-brand"
            >
              Help
            </Link>

            {user?.role === "host" && (
              <Link
                to="/host/dashboard"
                onClick={closeMenu}
                className="text-sm font-semibold text-slate-800 hover:text-brand"
              >
                Host dashboard
              </Link>
            )}

            {!user ? (
              <Link
                to="/login"
                onClick={closeMenu}
                className="w-full text-center bg-brand text-white px-5 py-3 rounded-lg text-sm font-bold hover:opacity-90 transition"
              >
                Log in
              </Link>
            ) : (
              <div className="flex flex-col gap-3 pt-2 border-t border-slate-100">
                <span className="text-sm font-semibold text-slate-800">
                  Hi, {user.name.split(" ")[0]}
                </span>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-left text-sm font-bold text-red-600 hover:text-red-700"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}