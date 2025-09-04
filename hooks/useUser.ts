import { useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "@/app/config";

export function useUser() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const token = await SecureStore.getItemAsync("token");
        console.log("Retrieved token from SecureStore:", token); // ✅ Add this line

        if (!token) {
          setError("Usuário não logado");
          setUser(null);
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };
        console.log("➡️ Sending headers:", headers);

        const res = await fetch(`${API_URL}/api/mobile-current-user`, {
          headers,
        });

        if (!res.ok) {
          setError("Falha ao buscar usuário");
          setUser(null);
          return;
        }

        const data = await res.json();
        setUser(data);
      } catch (err: any) {
        console.error(err);
        setError("Erro ao carregar usuário");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return { user, loading, error };
}
