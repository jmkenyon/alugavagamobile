import { View, Text, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import ExploreHeader from "@/components/ExploreHeader";
import Listings from "@/components/Listings";
import { fetchListings } from "@/lib/api/fetchListings";
import Colors from "@/constants/Colors";
import ListingsMap from "@/components/ListingsMap";
import ListingsBottomSheet from "@/components/ListingsBottomSheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Page = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchListings()
      .then(setListings)
      .catch((err) => {
        console.error("Error fetching listings:", err);
        setError("Erro ao carregar as vagas");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <GestureHandlerRootView>
      <View style={{ flex: 1, marginTop: 75 }}>
        <Stack.Screen options={{ header: () => <ExploreHeader /> }} />

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : error ? (
          <Text style={{ color: "red", textAlign: "center", marginTop: 20 }}>
            {error}
          </Text>
        ) : (
          <View style={{ flex: 1 }}>
            <ListingsMap listings={listings} />
            <ListingsBottomSheet listings={listings} />
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
};

export default Page;
