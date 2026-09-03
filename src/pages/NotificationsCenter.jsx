import { useEffect, useState } from "react";
import { Bell, Trash2, CheckCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
const TOKEN_KEY = "qrib_access_token";

export default function NotificationsCenter() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
  }, [page]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, [page]);

  async function fetchNotifications() {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return;

      const response = await fetch(
        `${API_URL}/notifications?page=${page}&limit=20`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to load notifications");

      const data = await response.json();
      setNotifications(data.notifications || []);
      setTotalPages(data.pages || 1);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      showToast("Failed to load notifications", "error");
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(notificationId) {
    try {
      const token = localStorage.getItem(TOKEN_KEY);

      const response = await fetch(
        `${API_URL}/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to mark as read");

      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      showToast("Marked as read", "success");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      showToast("Failed to mark as read", "error");
    }
  }

  async function deleteNotification(notificationId) {
    try {
      const token = localStorage.getItem(TOKEN_KEY);

      const response = await fetch(
        `${API_URL}/notifications/${notificationId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to delete notification");

      setNotifications(
        notifications.filter((n) => n.id !== notificationId)
      );
      showToast("Notification deleted", "success");
    } catch (error) {
      console.error("Error deleting notification:", error);
      showToast("Failed to delete notification", "error");
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 lg:px-10 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell size={28} className="text-brand" />
            <h1 className="text-3xl font-extrabold text-slate-900">
              Notifications
            </h1>
          </div>
          <p className="text-slate-600">
            You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-brand animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && notifications.length === 0 && (
          <div className="text-center py-12">
            <Bell size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No notifications yet</p>
          </div>
        )}

        {/* Notifications List */}
        {!loading && notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`border rounded-xl p-4 transition ${
                  notification.is_read
                    ? "border-slate-200 bg-white"
                    : "border-blue-200 bg-blue-50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900">
                        {notification.title}
                      </h3>
                      {!notification.is_read && (
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      {notification.body}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition"
                        title="Mark as read"
                      >
                        <CheckCircle size={18} className="text-blue-600" />
                      </button>
                    )}

                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition"
                      title="Delete notification"
                    >
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-slate-200 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-slate-200 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
