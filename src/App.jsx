import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import SearchResults from "./pages/SearchResults";
import AccommodationDetails from "./pages/AccommodationDetails";
import BookingConfirmation from "./pages/BookingConfirmation";
import Help from "./pages/Help";
import HostInfo from "./pages/HostInfo";
import HostDashboard from "./pages/HostDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/search" element={<SearchResults />} />
            <Route
              path="/property/:id"
              element={<AccommodationDetails />}
            />
            <Route
              path="/booking/:id"
              element={<BookingConfirmation />}
            />
            <Route path="/help" element={<Help />} />
            <Route path="/host" element={<HostInfo />} />
            <Route
              path="/host/dashboard"
              element={
                <ProtectedRoute role="host">
                  <HostDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
