import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { Alert } from "react-native";
import { API_URL } from "../config";

export const handleToggleFavorite = async (
  listingId: string,
  isFavorited: boolean,
  refreshFavorites: () => void
) => {
  console.log("handleToggleFavorite called", { listingId, isFavorited });

  try {
    const token = await SecureStore.getItemAsync("token");
    console.log("Token fetched from SecureStore:", token);

    if (!token) {
      console.warn("No token found - user not logged in");
      Alert.alert("Erro", "Você precisa estar logado para favoritar");
      return;
    }

    if (isFavorited) {
      console.log("Removing favorite for listing:", listingId);
      await axios.delete(`${API_URL}/api/favorites/${listingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Favorite removed successfully");
    } else {
      console.log("Adding favorite for listing:", listingId);
      await axios.post(
        `${API_URL}/api/favorites/${listingId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Favorite added successfully");
    }

    console.log("Refreshing favorites list...");
    refreshFavorites();
  } catch (err) {
    console.error("Erro ao atualizar favoritos:", err);
    Alert.alert("Erro", "Não foi possível atualizar favoritos");
  }
};