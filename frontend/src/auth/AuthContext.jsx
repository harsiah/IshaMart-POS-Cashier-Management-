import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

function getStoredSession() {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return { isLoggedIn: false, user: null };
  }

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );

    if (!payload.exp || payload.exp * 1000 <= Date.now()) {
      localStorage.removeItem("access_token");
      return { isLoggedIn: false, user: null };
    }

    return {
      isLoggedIn: true,
      user: {
        username: payload.username,
        role: payload.role,
      },
    };
  } catch {
    localStorage.removeItem("access_token");
    return { isLoggedIn: false, user: null };
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getStoredSession);
  const { isLoggedIn, user } = session;

  const login = (loginData) => {
    localStorage.setItem("access_token", loginData.access_token);
    setSession({
      isLoggedIn: true,
      user: {
        username: loginData.username,
        role: loginData.role,
      },
    });
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setSession({ isLoggedIn: false, user: null });
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
