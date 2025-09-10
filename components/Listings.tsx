import {
  FlatList,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Colors from "@/constants/Colors";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router, useRouter } from "expo-router";
import {
  BottomSheetFlatList,
  BottomSheetFlatListMethods,
} from "@gorhom/bottom-sheet";
import { useAuth } from "@/hooks/useAuth";
import { handleToggleFavorite } from "@/app/utils/handleToggleFavorite";
import { API_URL } from "@/app/config";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

interface Listing {
  id: string;
  title: string;
  imageSrc: string;
  price: number;
  locationValue: string;
}

interface ListingsProps {
  listings: Listing[];
  refresh: number;
}

function formatLocation(locationValue: string) {
  if (!locationValue) return "";

  const parts = locationValue.split(",").map((p) => p.trim());
  const cityStateIndex = parts.findIndex((p) => p.includes(" - "));
  if (cityStateIndex === -1) return locationValue; // fallback

  let before = parts[cityStateIndex - 1] || "";
  let cityState = parts[cityStateIndex];

  before = before.replace(/\d+/g, "").trim();

  // Normalize helper to compare without accents/case
  const normalize = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  // Example: "Rio de Janeiro - Rio de Janeiro" → "Rio de Janeiro"
  if (cityState.includes(" - ")) {
    const [left, right] = cityState.split(" - ").map((p) => p.trim());
    if (normalize(left) === normalize(right)) {
      cityState = left;
    }
  }

  return [before, cityState].filter(Boolean).join(", ");
}

export default function Listings({ listings, refresh }: ListingsProps) {
  const listRef = React.useRef<BottomSheetFlatListMethods>(null);
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [localFavorites, setLocalFavorites] = useState<string[]>(
    user?.favoriteIds || []
  );

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        alert("Usuário não logado.");
        return;
      }

      const response = await axios.get(`${API_URL}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFavorites(response.data);
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar favoritos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchFavorites();
  }, [user]);

  useEffect(() => {
    if (refresh) {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  }, [refresh]);

  if (listings.length === 0) {
    return (
      <View style={styles.empty}>
        <Text>Nenhuma vaga encontrada</Text>
      </View>
    );
  }

  const toggleFavorite = async (listingId: string) => {
    const isFavorited = localFavorites.includes(listingId);

    // Optimistic UI update
    setLocalFavorites((prev) =>
      isFavorited ? prev.filter((id) => id !== listingId) : [...prev, listingId]
    );

    await handleToggleFavorite(listingId, isFavorited, fetchFavorites);
  };

  return (
    <BottomSheetFlatList
      data={listings}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      ListHeaderComponent={
        <View style={styles.headerContainer}>
          <Text style={styles.info}>{listings.length} vagas</Text>
        </View>
      }
      renderItem={({ item }) => {
        const isFavorited = localFavorites.includes(item.id); // <-- use localFavorites here
        return (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/anuncio/${item.id}`)}
          >
            <Image source={{ uri: item.imageSrc }} style={styles.image} />
            <TouchableOpacity
              style={styles.heartIcon}
              onPress={() => toggleFavorite(item.id)}
            >
              <Ionicons
                name={isFavorited ? "heart" : "heart-outline"}
                size={24}
                color={isFavorited ? "#F43F5E" : "#fff"}
              />
            </TouchableOpacity>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.location}>
              {formatLocation(item.locationValue)}
            </Text>
            <Text style={styles.price}>
              <Text style={{ color: "black", fontFamily: "inter-sb" }}>
                R${item.price}
              </Text>
              <Text style={{ color: "#666", fontFamily: "inter" }}>
                {" "}
                por mês
              </Text>
            </Text>
          </TouchableOpacity>
        );
      }}
      nestedScrollEnabled
    />
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  image: { width: "100%", height: 200 },
  title: {
    fontFamily: "inter-sb",
    fontSize: 16,
    marginLeft: 8,
    marginRight: 8,
    marginTop: 8,
  },
  location: {
    fontFamily: "inter",
    fontSize: 14,
    margin: 8,
    color: Colors.subtext,
  },
  price: {
    fontFamily: "inter",
    fontSize: 14,
    marginHorizontal: 8,
    marginBottom: 12,
    color: Colors.subtext,
  },
  info: {
    textAlign: "center",
    fontFamily: "inter-sb",
    fontSize: 16,
  },
  headerContainer: {
    alignItems: "center", // horizontal center
    justifyContent: "center", // vertical center of the header container
    paddingBottom: 20, // spacing above and below
    marginTop: -15,
  },
  heartIcon: { position: "absolute", top: 10, right: 10 },
});
