import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
import { ToastProvider } from "./context/ToastContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SearchResults from "./pages/SearchResults";
import AccommodationDetails from "./pages/AccommodationDetails";
import BookingConfirmation from "./pages/BookingConfirmation";
import Help from "./pages/Help";
import HostInfo from "./pages/HostInfo";
import HostDashboard from "./pages/HostDashboard";
import AddProperty from "./pages/AddProperty";
import StudentDashboard from "./pages/StudentDashboard";
import StudentProfile from "./pages/StudentProfile";
import SavedHomes from "./pages/SavedHomes";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function RoleHomeRedirect() {
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-white/20 border-t-blue-500 animate-spin" />

          <p className="text-sm font-semibold text-white">
            Loading Qrib...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Home />;
  }

  if (user.role === "student") {
    return <Navigate to="/student/dashboard" replace />;
  }

  if (user.role === "host") {
    return <Navigate to="/host/dashboard" replace />;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>

            {/* =================================================
                ROOT
            ================================================== */}

            <Route
              path="/"
              element={<RoleHomeRedirect />}
            />

            {/* =================================================
                AUTH
            ================================================== */}

            <Route
              path="/login"
              element={<Login />}
            />

            {/* =================================================
                PUBLIC ACCOMMODATION
            ================================================== */}

            <Route
              path="/search"
              element={<SearchResults />}
            />

            <Route
              path="/property/:id"
              element={<AccommodationDetails />}
            />

            <Route
              path="/booking/:id"
              element={<BookingConfirmation />}
            />

            <Route
              path="/help"
              element={<Help />}
            />

            {/* =================================================
                HOST INFORMATION
            ================================================== */}

            <Route
              path="/host"
              element={<HostInfo />}
            />

            {/* =================================================
                STUDENT
            ================================================== */}

            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute role="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/profile"
              element={
                <ProtectedRoute role="student">
                  <StudentProfile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/saved"
              element={
                <ProtectedRoute role="student">
                  <SavedHomes />
                </ProtectedRoute>
              }
            />

            {/* =================================================
                HOST DASHBOARD
            ================================================== */}

            <Route
              path="/host/dashboard"
              element={
                <ProtectedRoute role="host">
                  <HostDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* =================================================
                ADD PROPERTY
            ================================================== */}

            <Route
              path="/host/add-property"
              element={
                <ProtectedRoute role="host">
                  <AddProperty />
                </ProtectedRoute>
              }
            />

            {/* =================================================
                OLD ADD-PROPERTY URL
                Keep this redirect so existing links don't break.
            ================================================== */}

            <Route
              path="/add-property"
              element={
                <Navigate
                  to="/host/add-property"
                  replace
                />
              }
            />

            {/* =================================================
                UNKNOWN ROUTES
            ================================================== */}

            <Route
              path="*"
              element={<RoleHomeRedirect />}
            />

          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;