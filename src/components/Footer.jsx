import { Link } from "react-router-dom";
import { universities } from "../data/universities";

export default function Footer() {
  const cities = [...new Set(universities.map((u) => u.city))].slice(0, 4);

  return (
    <footer className="w-full border-t border-line bg-white">
      <div className="max-w-[1440px] mx-auto px-20 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-[10px] bg-brand flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="font-extrabold text-lg text-ink">Qrib</span>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Verified student housing near Kenyan universities.
            </p>
          </div>
          <div>
            <p className="font-bold text-ink mb-4">Explore</p>
            <ul className="space-y-3 text-sm text-muted">
              {cities.map((c) => (
                <li key={c}>
                  <Link to={`/search?city=${encodeURIComponent(c)}`} className="hover:text-brand transition">
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-bold text-ink mb-4">For Hosts</p>
            <ul className="space-y-3 text-sm text-muted">
              <li><Link to="/host-info" className="hover:text-brand transition">List your property</Link></li>
              <li><Link to="/help#hosts" className="hover:text-brand transition">Host community</Link></li>
              <li><Link to="/help#safety" className="hover:text-brand transition">Insurance & safety</Link></li>
              <li><Link to="/help" className="hover:text-brand transition">Resources</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-ink mb-4">Support</p>
            <ul className="space-y-3 text-sm text-muted">
              <li><Link to="/help" className="hover:text-brand transition">Help Center</Link></li>
              <li><Link to="/help#cancellation" className="hover:text-brand transition">Cancellation options</Link></li>
              <li><Link to="/help#trust" className="hover:text-brand transition">Trust & Safety</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-line mt-16 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted">© 2026 Qrib Kenya. All rights reserved.</p>
          <div className="flex items-center gap-4 text-muted">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:text-brand transition">FB</a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" className="hover:text-brand transition">X</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-brand transition">IG</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
