import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";
import { getCurrentUser } from "../api/authApi";
import type { User } from "../types";

type AuthContextType = {
  user: Omit<User, "password"> | null;
  loading: boolean;
  setUser: (user: Omit<User, "password"> | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Omit<User, "password"> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        localStorage.setItem("user", JSON.stringify(currentUser));
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    }

    checkUser();
  }, []);

  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
