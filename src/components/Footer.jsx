import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-slate-50">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-20 py-12">
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <Link to="/" className="text-2xl font-extrabold text-brand">
              Qrib
            </Link>
            <p className="text-sm text-muted mt-3 max-w-sm">
              Helping Kenyan students find safe, affordable accommodation
              close to campus.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-ink mb-4">Explore</h3>
            <div className="flex flex-col gap-3 text-sm text-muted">
              <Link to="/search" className="hover:text-brand">
                Find accommodation
              </Link>
              <Link to="/host" className="hover:text-brand">
                Become a host
              </Link>
              <Link to="/help" className="hover:text-brand">
                Help centre
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-ink mb-4">Qrib</h3>
            <p className="text-sm text-muted">
              Student accommodation made easier.
            </p>
          </div>
        </div>

        <div className="border-t border-line mt-10 pt-6 text-xs text-faint">
          © {new Date().getFullYear()} Qrib. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
