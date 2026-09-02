import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/useAuth";

const STORAGE_KEY = "qrib_student_messages";

function seedMessages() {
  return [
    {
      id: "conv-1",
      hostName: "Mary Wanjiku",
      propertyTitle: "Kilimani Studio Apartment",
      status: "active",
      messages: [
        { id: "m1", sender: "host", text: "Hi, the room is still available for the next semester.", time: "9:15 AM" },
        { id: "m2", sender: "student", text: "Perfect. Can I view it this weekend?", time: "9:17 AM" },
        { id: "m3", sender: "host", text: "Yes, I can send you the viewing details after 2 PM.", time: "9:20 AM" },
      ],
    },
    {
      id: "conv-2",
      hostName: "Joseph Kibet",
      propertyTitle: "Kasarani Bedsitter",
      status: "pending",
      messages: [
        { id: "m4", sender: "host", text: "The payment plan is flexible if you need it.", time: "Yesterday" },
      ],
    },
  ];
}

function loadMessages() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return seedMessages();
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) && parsed.length ? parsed : seedMessages();
  } catch {
    return seedMessages();
  }
}

export default function StudentMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState(loadMessages);
  const [activeId, setActiveId] = useState(() => loadMessages()[0]?.id || "");
  const [draft, setDraft] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    if (!activeId && conversations[0]) {
      setActiveId(conversations[0].id);
    }
  }, [activeId, conversations]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId) || conversations[0],
    [activeId, conversations]
  );

  function sendReply() {
    if (!draft.trim() || !activeConversation) return;

    const nextMessage = {
      id: `msg-${Date.now()}`,
      sender: "student",
      text: draft.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === activeConversation.id
          ? { ...conversation, messages: [...conversation.messages, nextMessage] }
          : conversation
      )
    );

    setDraft("");
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        <Link to="/student/dashboard" className="text-sm font-semibold text-blue-600 hover:underline">
          ← Back to dashboard
        </Link>

        <div className="mt-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Messages</h1>
            <p className="mt-2 text-slate-500">Stay in touch with hosts about viewing and bookings.</p>
          </div>

          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-600">
            {conversations.length} conversations
          </span>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Hosts</h2>

            <div className="space-y-3">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => setActiveId(conversation.id)}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    activeConversation?.id === conversation.id
                      ? "border-blue-200 bg-blue-50"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-slate-800">{conversation.hostName}</p>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                      conversation.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {conversation.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{conversation.propertyTitle}</p>
                </button>
              ))}
            </div>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            {activeConversation ? (
              <>
                <div className="border-b border-slate-200 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black text-slate-900">{activeConversation.hostName}</h2>
                      <p className="text-sm text-slate-500">{activeConversation.propertyTitle}</p>
                    </div>

                    <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                      {user?.name || "Student"}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  {activeConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "student" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                          message.sender === "student"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        <p>{message.text}</p>
                        <p className={`mt-2 text-[10px] ${message.sender === "student" ? "text-blue-100" : "text-slate-400"}`}>
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 p-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") sendReply();
                      }}
                      placeholder="Type your message..."
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300"
                    />

                    <button
                      type="button"
                      onClick={sendReply}
                      className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full min-h-[400px] items-center justify-center p-10 text-center text-slate-500">
                Select a conversation to start chatting.
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
