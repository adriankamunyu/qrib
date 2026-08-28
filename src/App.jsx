import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import SearchResults from "./pages/SearchResults";
import AccommodationDetails from "./pages/AccommodationDetails";
import BookingConfirmation from "./pages/BookingConfirmation";
import HostDashboard from "./pages/HostDashboard";
import HostInfo from "./pages/HostInfo";
import Help from "./pages/Help";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/property/:id" element={<AccommodationDetails />} />
            <Route
              path="/booking/:id"
              element={
                <ProtectedRoute>
                  <BookingConfirmation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/host"
              element={
                <ProtectedRoute role="host">
                  <HostDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/host-info" element={<HostInfo />} />
            <Route path="/help" element={<Help />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
