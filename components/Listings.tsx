
import { FlatList, View, Text, Image, StyleSheet } from "react-native";
import Colors from "@/constants/Colors";
import React from "react";

interface Listing {
  id: string;
  title: string;
  imageSrc: string;
  price: number;
}

interface ListingsProps {
  listings: Listing[];
}

export default function Listings({ listings }: ListingsProps) {
  if (listings.length === 0) {
    return (
      <View style={styles.empty}>
        <Text>Nenhuma vaga encontrada</Text>
      </View>
    );
  }



  return (
    <FlatList
      data={listings}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Image source={{ uri: item.imageSrc }} style={styles.image} />
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.price}>R${item.price} por mês</Text>
        </View>
      )}
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
  title: { fontFamily: "inter-sb", fontSize: 16, margin: 8 },
  price: {
    fontFamily: "inter",
    fontSize: 14,
    marginHorizontal: 8,
    marginBottom: 8,
    color: Colors.subtext,
  },
});