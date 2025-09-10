import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import Colors from "@/constants/Colors";
import axios from "axios";
import { API_URL } from "../config";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from "@expo/vector-icons";
import { formatLocation } from "../utils/formatLocation";
import { handleToggleFavorite } from "../utils/handleToggleFavorite";

const Favoritos = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [localFavorites, setLocalFavorites] = useState<string[]>(
    user?.favoriteIds || []
  );

  // Fetch favorites from API
  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        Alert.alert("Erro", "Usuário não logado.");
        return;
      }

      const response = await axios.get(`${API_URL}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFavorites(response.data);
      // Update localFavorites so hearts reflect correct state
      setLocalFavorites(user?.favoriteIds || []);
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Erro ao carregar favoritos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchFavorites();
  }, [user]);

  const toggleFavorite = async (listingId: string) => {
    const isFavorited = localFavorites.includes(listingId);

    // Optimistic UI update
    setLocalFavorites((prev) =>
      isFavorited ? prev.filter((id) => id !== listingId) : [...prev, listingId]
    );

    await handleToggleFavorite(listingId, isFavorited, fetchFavorites);
  };

  const renderItem = ({ item }: { item: any }) => {
    const isFavorited = localFavorites.includes(item.id);

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
        <Text style={styles.location}>{formatLocation(item.locationValue)}</Text>
        <Text style={styles.price}>
          <Text style={{ color: "black", fontFamily: "inter-sb" }}>
            R${item.price}
          </Text>
          <Text style={{ color: "#666", fontFamily: "inter" }}> por mês</Text>
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
      {user ? (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListHeaderComponent={
            <View style={styles.headerContainer}>
              <Text style={styles.info}>
                {favorites.length}{" "}
                {favorites.length === 1 ? "favorito" : "favoritos"}
              </Text>
            </View>
          }
          renderItem={renderItem}
        />
      ) : (
        <View style={styles.noUserContainer}>
          <Text style={styles.noUserText}>
            Por favor, faça login para ver seus favoritos
          </Text>
          <Link href="/(modals)/login" asChild>
            <TouchableOpacity style={styles.loginBtn}>
              <Text style={styles.btnText}>Entrar</Text>
            </TouchableOpacity>
          </Link>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Favoritos;

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20,
    marginTop: -15,
  },
  info: { textAlign: "center", fontFamily: "inter-sb", fontSize: 16 },
  image: { width: "100%", height: 200 },
  title: { fontFamily: "inter-sb", fontSize: 16, margin: 8 },
  location: { fontFamily: "inter", fontSize: 14, margin: 8, color: Colors.subtext },
  price: { fontFamily: "inter", fontSize: 14, marginHorizontal: 8, marginBottom: 12, color: Colors.subtext },
  card: { marginBottom: 16, borderRadius: 12, overflow: "hidden", backgroundColor: "#fff", elevation: 2, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  heartIcon: { position: "absolute", top: 10, right: 10 },
  loginBtn: { backgroundColor: Colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, width: 100 },
  btnText: { color: "#fff", fontSize: 16, fontFamily: "inter-b", textAlign: "center" },
  noUserContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 20 },
  noUserText: { textAlign: "center", fontFamily: "inter-b", fontSize: 18, margin: 20 },
});