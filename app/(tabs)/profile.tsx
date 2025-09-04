import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Button } from "react-native";
import * as SecureStore from "expo-secure-store";
import { Link, router } from "expo-router";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { defaultStyles } from "@/constants/Styles";
import { useUser } from "@/hooks/useUser";

const Profile = () => {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const check = async () => {
      const token = await SecureStore.getItemAsync("token");

      if (token) {
        console.log("🔑 Token (may look cut in logs):", token);
        console.log("📏 Token length:", token.length);

        const parts = token.split(".");
        console.log("🧩 Token parts:", parts.length); // should be 3
      } else {
        console.log("❌ No token found in SecureStore");
      }

      setSignedIn(!!token);
    };

    check();
  }, []);

  const { user, loading, error } = useUser();

  if (loading) return <Text>Loading...</Text>;

  // Sign out function
  const signOut = async () => {
    try {
      // Delete the stored token
      await SecureStore.deleteItemAsync("token");

      // Redirect to login modal
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return (
    <SafeAreaView style={defaultStyles.container}>
      <View style={{ flex: 1 }}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Perfil</Text>
          <Ionicons name="notifications-outline" size={26} color="black" />
        </View>

        {user && <View style={styles.card}>
          <TouchableOpacity onPress={onCaptureImage}>

          </TouchableOpacity>
          </View>}

        <View style={{ flex: 1, alignItems: "center" }}>
          {signedIn && (
            <TouchableOpacity style={styles.btn} onPress={signOut}>
              <Text style={styles.btnText}>Sair</Text>
            </TouchableOpacity>
          )}

          {!signedIn && (
            <Link href="/(modals)/login" asChild>
              <TouchableOpacity style={styles.btn}>
                <Text style={styles.btnText}>Entrar</Text>
              </TouchableOpacity>
            </Link>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    padding: 24,
    justifyContent: "space-between",
  },
  container: {
    flex: 1,
    alignItems: "center",
    padding: 50,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    fontFamily: "inter-b",
  },
  btn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: 100,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "inter-b",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    marginHorizontal: 24,
    marginTop: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
  },
});
