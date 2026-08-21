import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-semibold text-muted">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
