import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

export default function HostInfo() {
  const { user } = useAuth();

  return (
    <div className="w-full">
      <Navbar />
      <div className="max-w-[900px] mx-auto px-6 py-24 text-center flex flex-col items-center gap-6">
        <span className="text-xs uppercase font-bold text-brand bg-brand/10 px-3 py-1 rounded-full">For Hosts</span>
        <h1 className="font-extrabold text-4xl text-ink">List your property on Qrib</h1>
        <p className="text-muted text-lg">
          Reach thousands of verified Kenyan students searching for housing near UoN, KU, JKUAT, Strathmore, USIU, Moi and more.
        </p>
        {user?.role === "host" ? (
          <Link to="/host" className="bg-brand hover:bg-brand-dark transition text-white font-bold px-8 py-4 rounded-lg">
            Go to your Host Dashboard
          </Link>
        ) : (
          <Link to="/login?mode=signup" className="bg-brand hover:bg-brand-dark transition text-white font-bold px-8 py-4 rounded-lg">
            Sign up as a Host
          </Link>
        )}
        <p className="text-sm text-faint">
          Already have a host account? <Link to="/login" className="text-brand font-semibold">Sign in</Link>
        </p>
      </div>
      <Footer />
    </div>
  );
}
