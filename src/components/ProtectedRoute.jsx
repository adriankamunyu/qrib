import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function ProtectedRoute({ children, role }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  // Wait until authentication has been restored.
  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />

          <p className="text-sm font-semibold text-slate-500">
            Loading Qrib...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated.
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  // Authenticated but wrong role.
  if (role && user.role !== role) {
    if (user.role === "student") {
      return (
        <Navigate
          to="/student/dashboard"
          replace
        />
      );
    }

    if (user.role === "host") {
      return (
        <Navigate
          to="/host/dashboard"
          replace
        />
      );
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}