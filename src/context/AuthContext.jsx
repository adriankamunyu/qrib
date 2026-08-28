import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
const USERS_KEY = "qrib_users";
const SESSION_KEY = "qrib_session";

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Seed one demo student + one demo host so login can be tested immediately.
function ensureSeedUsers() {
  const users = loadUsers();
  if (users.length === 0) {
    const seeded = [
      { name: "Demo Student", email: "student@university.ac.ke", password: "password123", role: "student" },
      { name: "Demo Host", email: "host@qrib.co.ke", password: "password123", role: "host" },
    ];
    saveUsers(seeded);
    return seeded;
  }
  return users;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureSeedUsers();
    try {
      const session = JSON.parse(localStorage.getItem(SESSION_KEY));
      if (session) setUser(session);
    } catch {
      /* ignore corrupted session */
    }
    setReady(true);
  }, []);

  const login = ({ email, password }) => {
    const users = loadUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (!found) {
      return { ok: false, message: "No account found with that email address." };
    }
    if (found.password !== password) {
      return { ok: false, message: "Incorrect password. Please try again." };
    }
    const session = { name: found.name, email: found.email, role: found.role };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return { ok: true };
  };

  const signup = ({ name, email, password, role }) => {
    if (!name.trim()) return { ok: false, message: "Please enter your full name." };
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return { ok: false, message: "Please enter a valid email address." };
    }
    if (password.length < 6) {
      return { ok: false, message: "Password must be at least 6 characters." };
    }
    const users = loadUsers();
    if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      return { ok: false, message: "An account with this email already exists." };
    }
    const newUser = { name, email, password, role: role || "student" };
    saveUsers([...users, newUser]);
    const session = { name: newUser.name, email: newUser.email, role: newUser.role };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return { ok: true };
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
