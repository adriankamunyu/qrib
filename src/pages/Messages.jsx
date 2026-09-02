import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { Send, Search, Search2, ArrowLeft } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function StudentMessages() {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (token) {
      fetchConversations();
      // Polling for new messages every 5 seconds (for demo - would use WebSocket in production)
      const interval = setInterval(() => {
        if (selectedConversation) {
          fetchMessages(selectedConversation);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [token, selectedConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data.data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (partnerId) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/messages/user/${partnerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data.data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim()) {
      showToast("Message cannot be empty", "error");
      return;
    }

    try {
      setSending(true);
      const response = await fetch(`${BACKEND_URL}/api/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiver_id: selectedConversation,
          message: messageText,
        }),
      });

      if (response.ok) {
        setMessageText("");
        await fetchMessages(selectedConversation);
      } else {
        showToast("Failed to send message", "error");
      }
    } catch (error) {
      showToast("Error sending message", "error");
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.partner_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 mx-auto w-full max-w-6xl px-6 py-8">
        <div className="flex gap-6 h-[600px]">
          {/* Conversations List */}
          <div className="w-full max-w-xs rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-black text-slate-900">Messages</h2>
              <div className="mt-4 relative">
                <Search2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-slate-600">
                  {conversations.length === 0
                    ? "No conversations yet"
                    : "No matching conversations"}
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.partner_id}
                    onClick={() => {
                      setSelectedConversation(conv.partner_id);
                      fetchMessages(conv.partner_id);
                    }}
                    className={`w-full border-b border-slate-200 p-4 text-left hover:bg-slate-50 transition ${
                      selectedConversation === conv.partner_id ? "bg-blue-50" : ""
                    }`}
                  >
                    <p className="font-semibold text-slate-900">
                      {conv.partner_name}
                    </p>
                    <p className="mt-1 text-sm text-slate-600 truncate">
                      {conv.sender === "you" ? "You: " : ""}{conv.last_message}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(conv.last_message_at).toLocaleString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          {selectedConversation ? (
            <div className="flex-1 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-slate-200 p-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {conversations.find((c) => c.partner_id === selectedConversation)
                      ?.partner_name || "Chat"}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setSelectedConversation(null);
                    setMessages([]);
                  }}
                  className="text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-slate-600">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.is_own_message ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs rounded-lg px-4 py-3 ${
                          msg.is_own_message
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-900"
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p
                          className={`mt-1 text-xs ${
                            msg.is_own_message
                              ? "text-blue-100"
                              : "text-slate-500"
                          }`}
                        >
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <form
                onSubmit={handleSendMessage}
                className="border-t border-slate-200 p-6"
              >
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    disabled={sending}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={sending}
                    className="rounded-lg bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {sending ? "..." : "Send"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex-1 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center justify-center">
              <div className="text-center">
                <div className="text-slate-400 mb-4">Select a conversation to start messaging</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
