import { createContext, useContext, useState, useEffect } from "react";
import { adminLogin } from "../api/auth";

const AdminAuthContext = createContext(null);
export const useAdminAuth = () => useContext(AdminAuthContext);

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("admin_token"));
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("admin_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  async function login(email, password) {
    const res = await adminLogin(email, password);
    localStorage.setItem("admin_token", res.token);
    localStorage.setItem("admin_user", JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
    return res;
  }

  function logout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setToken(null);
    setUser(null);
  }

  return (
    <AdminAuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

