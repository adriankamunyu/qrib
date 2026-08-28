import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useEffect, useRef } from "react";

// Wrap a page to require login, and optionally a specific role (e.g. "host").
export default function ProtectedRoute({ children, role }) {
  const { user, ready } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const warned = useRef(false);

  useEffect(() => {
    if (!ready) return;
    if (!user && !warned.current) {
      warned.current = true;
      showToast("Please sign in to continue.", "error");
    } else if (user && role && user.role !== role && !warned.current) {
      warned.current = true;
      showToast("This page is only available to host accounts.", "error");
    }
  }, [ready, user]);

  if (!ready) return null;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}
