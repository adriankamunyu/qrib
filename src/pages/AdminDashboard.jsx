import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { ChevronDown, Search, X, CheckCircle, AlertCircle, Trash2, Check } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch dashboard stats
  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchStats();
    }
  }, [activeTab, token]);

  // Fetch users based on filters
  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab, searchQuery, userRoleFilter, currentPage, token]);

  // Fetch properties
  useEffect(() => {
    if (activeTab === "properties") {
      fetchProperties();
    }
  }, [activeTab, currentPage, token]);

  // Fetch verifications
  useEffect(() => {
    if (activeTab === "verifications") {
      fetchVerifications();
    }
  }, [activeTab, currentPage, token]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        showToast("Failed to load statistics", "error");
      }
    } catch (error) {
      showToast("Error loading statistics", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(userRoleFilter !== "all" && { role: userRoleFilter }),
        ...(searchQuery && { search: searchQuery }),
      });
      
      const response = await fetch(`${BACKEND_URL}/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data);
      }
    } catch (error) {
      showToast("Error loading users", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/admin/properties/moderation?page=${currentPage}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProperties(data.data);
      }
    } catch (error) {
      showToast("Error loading properties", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/admin/verifications/pending?page=${currentPage}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setVerifications(data.data);
      }
    } catch (error) {
      showToast("Error loading verifications", "error");
    } finally {
      setLoading(false);
    }
  };

  const approveProperty = async (propertyId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/properties/${propertyId}/verify`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ approved: true }),
      });
      if (response.ok) {
        showToast("Property approved successfully", "success");
        fetchProperties();
      }
    } catch (error) {
      showToast("Error approving property", "error");
    }
  };

  const approveVerification = async (verificationId, notes = "") => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/verifications/${verificationId}/approve`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      });
      if (response.ok) {
        showToast("Verification approved", "success");
        fetchVerifications();
      }
    } catch (error) {
      showToast("Error approving verification", "error");
    }
  };

  const rejectVerification = async (verificationId, notes) => {
    if (!notes) {
      showToast("Please provide a rejection reason", "error");
      return;
    }
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/verifications/${verificationId}/reject`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      });
      if (response.ok) {
        showToast("Verification rejected", "success");
        fetchVerifications();
      }
    } catch (error) {
      showToast("Error rejecting verification", "error");
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure? This action cannot be undone.")) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        showToast("User deleted successfully", "success");
        fetchUsers();
      }
    } catch (error) {
      showToast("Error deleting user", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
              Qrib admin portal
            </p>
            <h1 className="mt-1 text-2xl font-black text-slate-900">
              Welcome back, {user?.name || "Admin"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/search"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
            >
              Browse listings
            </Link>
            <button
              onClick={() => navigate("/login")}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
            >
              Exit admin
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl gap-0 px-6">
          {[
            { id: "dashboard", label: "Dashboard" },
            { id: "users", label: "Users" },
            { id: "properties", label: "Properties" },
            { id: "verifications", label: "Verifications" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-4 py-4 text-sm font-bold ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-10">
            {/* Stats Grid */}
            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {stats ? (
                <>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-slate-500">Total Users</p>
                    <p className="mt-3 text-3xl font-black text-slate-900">{stats.users.total}</p>
                    <p className="mt-2 text-sm text-slate-600">
                      {stats.users.students} students, {stats.users.hosts} hosts
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-slate-500">Properties</p>
                    <p className="mt-3 text-3xl font-black text-slate-900">{stats.properties.total}</p>
                    <p className="mt-2 text-sm text-slate-600">
                      {stats.properties.verified} verified
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-slate-500">Bookings</p>
                    <p className="mt-3 text-3xl font-black text-slate-900">{stats.bookings.total}</p>
                    <p className="mt-2 text-sm text-slate-600">
                      {stats.bookings.completed} completed
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-slate-500">Pending Reviews</p>
                    <p className="mt-3 text-3xl font-black text-slate-900">{stats.pending_verifications}</p>
                    <p className="mt-2 text-sm text-amber-600">Action required</p>
                  </div>
                </>
              ) : (
                <div className="col-span-4 text-center text-slate-500">Loading stats...</div>
              )}
            </section>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or username..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <select
                value={userRoleFilter}
                onChange={(e) => {
                  setUserRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="host">Hosts</option>
              </select>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-500">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-500">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-500">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-500">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-semibold text-slate-800">{u.name}</td>
                      <td className="px-6 py-4 text-slate-600">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 capitalize">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="text-red-600 hover:text-red-800 font-semibold text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === "properties" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Properties Awaiting Verification</h2>
            <div className="space-y-4">
              {properties.map((prop) => (
                <div key={prop.id} className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="flex gap-4">
                    {prop.image && (
                      <img
                        src={prop.image}
                        alt={prop.title}
                        className="h-32 w-32 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900">{prop.title}</h3>
                      <p className="text-sm text-slate-600">
                        {prop.area}, {prop.city}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-800">
                        Ksh {parseFloat(prop.price_per_month).toLocaleString()}/month
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Host: {prop.host_name}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveProperty(prop.id)}
                        className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this property?")) {
                            deleteProperty(prop.id);
                          }
                        }}
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verifications Tab */}
        {activeTab === "verifications" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Pending Host Verifications</h2>
            <div className="space-y-4">
              {verifications.map((v) => (
                <div key={v.id} className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{v.host_name}</h3>
                      <p className="text-sm text-slate-600">{v.host_email}</p>
                      <p className="mt-2 text-sm">
                        <span className="font-semibold">ID Number:</span> {v.id_number}
                      </p>
                      <p className="text-xs text-slate-500">
                        Submitted: {new Date(v.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveVerification(v.id)}
                        className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700"
                      >
                        <Check className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt("Rejection reason:");
                          if (reason) rejectVerification(v.id, reason);
                        }}
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Helper function
async function deleteProperty(propertyId) {
  const token = localStorage.getItem("token");
  try {
    await fetch(`${BACKEND_URL}/api/admin/properties/${propertyId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Error deleting property", error);
  }
}

