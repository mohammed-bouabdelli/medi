import { createContext, useContext, useState, useEffect } from "react";
import { apiFetch, setAuthToken as storeToken, getAuthToken } from "@/lib/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Auth state from local backend
  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await apiFetch("/auth/user");
        setUser(data.user);
      } catch (error) {
        console.error("Auth init error:", error);
        storeToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    storeToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (userData) => {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    storeToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    } finally {
      storeToken(null);
      setUser(null);
    }
  };

  const checkAuth = async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const data = await apiFetch("/auth/user");
      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error("checkAuth error:", error);
      storeToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
