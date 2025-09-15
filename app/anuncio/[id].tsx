import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Share,
  Dimensions,
  Linking,
} from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { API_URL } from "../config";
import Animated, {
  interpolate,
  SlideInDown,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from "react-native-reanimated";
import Colors from "@/constants/Colors";
import { defaultStyles } from "@/constants/Styles";
import { Ionicons } from "@expo/vector-icons";
import { handleToggleFavorite } from "../utils/handleToggleFavorite";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const IMG_HEIGHT = 300;
const { width } = Dimensions.get("window");

interface Listing {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  price: number;
  locationValue: string;
  category: string;
  user: {
    id: string;
    name: string;
    image: string;
  };
}

function formatLocation(locationValue: string) {
  if (!locationValue) return "";

  const parts = locationValue.split(",").map((p) => p.trim());
  const cityStateIndex = parts.findIndex((p) => p.includes(" - "));
  if (cityStateIndex === -1) return locationValue;

  const street = parts[0]?.replace(/\d+/g, "").trim();
  let neighbourhood = "";
  if (cityStateIndex > 1) {
    neighbourhood = parts.slice(1, cityStateIndex).join(", ").trim();
  }

  let cityState = parts[cityStateIndex];
  const normalize = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  if (cityState.includes(" - ")) {
    const [left, right] = cityState.split(" - ").map((p) => p.trim());
    if (normalize(left) === normalize(right)) cityState = left;
  }

  const cepMatch = locationValue.match(/\b\d{5}-\d{3}\b/);
  const postcode = cepMatch ? cepMatch[0] : "";

  return [street, neighbourhood, cityState, postcode].filter(Boolean).join(", ");
}

const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { user } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localFavorites, setLocalFavorites] = useState<string[]>(user?.favoriteIds || []);

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef.current ? scrollRef : null);

  // Fetch single listing
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    fetch(`${API_URL}/api/listings?listingId=${id}`)
      .then((res) => res.json())
      .then((data) => setListing(data))
      .catch((err) => {
        console.error("Error fetching listing:", err);
        setError("Erro ao carregar a vaga");
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch favorites from API
  const fetchFavorites = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) return;

      const response = await axios.get(`${API_URL}/api/favorites`, {
        headers: {  "x-access-token": token },
      });
      setLocalFavorites(response.data.map((fav: any) => fav.id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) fetchFavorites();
  }, [user]);

  const toggleFavorite = async (listingId: string) => {
    const isFavorited = localFavorites.includes(listingId);
    setLocalFavorites((prev) =>
      isFavorited ? prev.filter((id) => id !== listingId) : [...prev, listingId]
    );
    await handleToggleFavorite(listingId, isFavorited, fetchFavorites);
  };

  const shareListing = async () => {
    if (!listing) return;
    try {
      await Share.share({
        title: listing.title,
        url: `https://alugavaga.com.br/anuncio/${listing.id}`,
        message: `Confira esta vaga: ${listing.title} - https://alugavaga.com.br/anuncio/${listing.id}`,
      });
    } catch (err) {
      console.log("Error sharing", err);
    }
  };

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollOffset.value,
          [-IMG_HEIGHT, 0, IMG_HEIGHT],
          [-IMG_HEIGHT / 2, 0, IMG_HEIGHT * 0.75]
        ),
      },
      {
        scale: interpolate(scrollOffset.value, [-IMG_HEIGHT, 0, IMG_HEIGHT], [2, 1, 1]),
      },
    ],
  }));

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollOffset.value, [0, IMG_HEIGHT / 2], [0, 1]),
  }));

    const openWhatsApp = () => {
      const url = "https://wa.me/5511934076875";
      Linking.openURL(url).catch(() =>
        console.warn("Cannot open WhatsApp")
      );
    };

  // Header configuration
  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackground: () => <Animated.View style={[styles.header, headerAnimatedStyle]} />,
      headerRight: () =>
        listing ? (
          <View style={styles.bar}>
            <TouchableOpacity style={styles.roundButton} onPress={shareListing}>
              <Ionicons name="share-outline" size={22} color={"#000"} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.roundButton} onPress={() => toggleFavorite(listing.id)}>
              <Ionicons
                name={localFavorites.includes(listing.id) ? "heart" : "heart-outline"}
                size={24}
                color={localFavorites.includes(listing.id) ? "#F43F5E" : "#000"}
              />
            </TouchableOpacity>
          </View>
        ) : null,
      headerLeft: () => (
        <TouchableOpacity style={styles.roundButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={"#000"} />
        </TouchableOpacity>
      ),
    });
  }, [listing, localFavorites]);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );

  if (error || !listing)
    return (
      <View style={styles.center}>
        <Text>{error ?? "Listing não encontrado"}</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <Animated.ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: 100 }} scrollEventThrottle={16}>
        <Animated.Image source={{ uri: listing.imageSrc }} style={[styles.image, imageAnimatedStyle]} />

        <View style={styles.infoContainer}>
          <Text style={styles.title}>{listing.title}</Text>
          <Text style={styles.location}>{formatLocation(listing.locationValue)}</Text>

          <View style={styles.divider} />
          <View style={styles.hostView}>
            <Text style={{ fontWeight: "500", fontSize: 16 }}>
              Hospedado por {listing.user?.name ?? "Desconhecido"}
            </Text>
          </View>

          <View style={styles.divider} />
          <Text style={styles.description}>{listing.description}</Text>
        </View>
      </Animated.ScrollView>

      <Animated.View style={defaultStyles.footer} entering={SlideInDown.delay(200)}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <TouchableOpacity style={styles.footerText}>
            <Text style={styles.footerPrice}>R${listing.price}</Text>
            <Text>mês</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[defaultStyles.btn, { paddingHorizontal: 20 }]}
          onPress={openWhatsApp}
          >
            <Text style={defaultStyles.btnText}>Chat</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  image: { width, height: IMG_HEIGHT },
  infoContainer: { padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "bold", fontFamily: "inter-sb" },
  location: { fontSize: 18, color: Colors.subtext, marginTop: 10, fontFamily: "inter" },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.subtext, marginVertical: 16 },
  hostView: { flexDirection: "row", alignItems: "center", gap: 12 },
  description: { fontSize: 16, marginTop: 10, fontFamily: "inter" },
  footerText: { height: "100%", justifyContent: "center", flexDirection: "row", alignItems: "center", gap: 4 },
  footerPrice: { fontSize: 18, fontFamily: "inter-sb" },
  bar: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  roundButton: {
    width: 40,
    height: 40,
    borderRadius: 50,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.subtext,
  },
  header: { backgroundColor: "#fff", height: 100, borderBottomColor: Colors.subtext, borderBottomWidth: StyleSheet.hairlineWidth },
});

export default Page;