import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContextValue";


const API_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = "qrib_access_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // =========================================================
  // RESTORE EXISTING LOGIN SESSION
  // =========================================================
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      setReady(true);
      return;
    }

    fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              data.message ||
              data.msg ||
              "Session expired"
          );
        }

        setUser(data.user);
      })
      .catch((error) => {
        console.error("Session restore error:", error);

        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      })
      .finally(() => {
        setReady(true);
      });
  }, []);

  // =========================================================
  // LOGIN
  // =========================================================
  const login = async ({ email, password }) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          ok: false,
          message:
            data.error ||
            data.message ||
            data.msg ||
            "Login failed.",
        };
      }

      if (!data.access_token) {
        return {
          ok: false,
          message:
            "Login succeeded but the server did not return an access token.",
        };
      }

      // Save JWT
      localStorage.setItem(TOKEN_KEY, data.access_token);

      // Save user
      setUser(data.user);

      return {
        ok: true,
        user: data.user,
      };
    } catch (error) {
      console.error("Login error:", error);

      return {
        ok: false,
        message:
          "Unable to connect to Qrib server. Make sure the backend is running.",
      };
    }
  };

  // =========================================================
  // GOOGLE LOGIN
  // =========================================================
  const googleLogin = async ({
    name,
    email,
    googleId,
    credential,
    role = "student",
  }) => {
    try {
      const response = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          googleId,
          credential,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          ok: false,
          message:
            data.error ||
            data.message ||
            data.msg ||
            "Google sign-in failed.",
        };
      }

      if (!data.access_token) {
        return {
          ok: false,
          message:
            "Google authentication succeeded but the server did not return a token.",
        };
      }

      localStorage.setItem(TOKEN_KEY, data.access_token);
      setUser(data.user);

      return {
        ok: true,
        user: data.user,
      };
    } catch (error) {
      console.error("Google login error:", error);

      return {
        ok: false,
        message:
          "Unable to connect to the Google sign-in API.",
      };
    }
  };

  // =========================================================
  // SIGNUP
  // =========================================================
  const signup = async ({
    name,
    email,
    password,
    role,
  }) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role: role || "student",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          ok: false,
          message:
            data.error ||
            data.message ||
            data.msg ||
            "Registration failed.",
        };
      }

      // Your backend already returns a JWT after registration.
      if (!data.access_token) {
        return {
          ok: false,
          message:
            "Account was created but the server did not return an access token.",
        };
      }

      // Save JWT
      localStorage.setItem(
        TOKEN_KEY,
        data.access_token
      );

      // Save authenticated user
      setUser(data.user);

      return {
        ok: true,
        user: data.user,
      };
    } catch (error) {
      console.error("Registration error:", error);

      return {
        ok: false,
        message:
          "Unable to connect to Qrib server. Make sure the backend is running.",
      };
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  // =========================================================
  // CONTEXT
  // =========================================================
  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        login,
        signup,
        googleLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// =========================================================