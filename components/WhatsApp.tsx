import React from "react";
import { View, TouchableOpacity, Linking, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const FloatingWhatsApp = ({ phoneNumber }: { phoneNumber: string }) => {
  const openWhatsApp = () => {
    const url = `https://wa.me/${phoneNumber}`;
    Linking.openURL(url).catch(() =>
      console.warn("Cannot open WhatsApp")
    );
  };

  return (
    <TouchableOpacity style={styles.floatingButton} onPress={openWhatsApp}>
      <Ionicons name="logo-whatsapp" size={32} color="#fff" />
    </TouchableOpacity>
  );
};

export default FloatingWhatsApp;

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    bottom: 110,
    right: 20,
    backgroundColor: "#25D366", // WhatsApp green
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
});