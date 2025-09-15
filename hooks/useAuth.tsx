import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "@/app/config";

type AuthContextType = {
  user: any | null;
  setUser: (u: any | null) => void;
  loading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        setUser(null);
        setError("Usuário não logado");
        return;
      }

      const res = await fetch(`${API_URL}/api/mobile-current-user`, {
        headers: { 
          "x-access-token": token
         },
      });

      if (!res.ok) {
        setUser(null);
        setError("Falha ao buscar usuário");
        return;
      }

      const data = await res.json();
      setUser(data);
    } catch (err: any) {
      console.error(err);
      setUser(null);
      setError("Erro ao carregar usuário");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};