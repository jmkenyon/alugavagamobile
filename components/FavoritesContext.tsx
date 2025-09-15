import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "@/app/config";
import { handleToggleFavorite } from "@/app/utils/handleToggleFavorite";
import { useAuth } from "@/hooks/useAuth";

interface FavoritesContextProps {
  favorites: string[];
  loading: boolean;
  refreshFavorites: () => Promise<void>;
  toggleFavorite: (listingId: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextProps | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshFavorites = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("token");
      if (!token) return;
      const response = await axios.get(`${API_URL}/api/favorites`, {
        headers: { "x-access-token": token },
      });
      setFavorites(response.data.map((f: any) => f.id));
    } catch (err) {
      console.error("Failed to fetch favorites", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (listingId: string) => {
    const isFavorited = favorites.includes(listingId);
    // Optimistic update
    setFavorites((prev) =>
      isFavorited ? prev.filter((id) => id !== listingId) : [...prev, listingId]
    );
    await handleToggleFavorite(listingId, isFavorited, refreshFavorites);
  };

  useEffect(() => {
    refreshFavorites();
  }, [user]);

  return (
    <FavoritesContext.Provider value={{ favorites, loading, refreshFavorites, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
};