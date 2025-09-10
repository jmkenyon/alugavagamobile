import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Button,
  Image,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { Link, router } from "expo-router";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { defaultStyles } from "@/constants/Styles";
import { useUser } from "@/hooks/useUser";
import {
  GestureHandlerRootView,
  TextInput,
} from "react-native-gesture-handler";
import { API_URL } from "../config";
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from "@/hooks/useAuth";


const Profile = () => {
  const { user, setUser, loading, error } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user ? user.email : "");
  const [createdAt, setCreatedAt] = useState(user ? user.createdAt : "");
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    if (!user) return;

    setName(user?.name || "");
    setEmail(user ? user.email : "");
  }, [user]);

  const onSaveUser = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        console.error("❌ No token found, user not logged in");
        return;
      }
  
      const res = await fetch(`${API_URL}/api/update-user`, {
        method: "PUT", // or PATCH, depending on your backend
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
  
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to update user");
      }
  
      const updatedUser = await res.json();
      console.log("✅ User updated:", updatedUser);
  
      // optionally update local state
      setName(updatedUser.name);
      setEdit(false);
    } catch (err) {
      console.error("❌ Error updating user:", err);
    }
  };

  const signedIn = !!user;

  if (loading) return <Text>Loading...</Text>;

  // Sign out function

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync("token");
      setUser(null); // <-- clear user from context
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const uploadToCloudinary = async (fileUri: string) => {
    console.log("📂 Preparing to upload:", fileUri);
  
    const formData = new FormData();
    formData.append("file", {
      uri: fileUri,
      type: "image/jpeg",
      name: fileUri.split("/").pop(),
    } as any);
  
    // Your Cloudinary unsigned upload preset
    formData.append("upload_preset", "alugavaga_upload_preset");
  
    try {
      console.log("🚀 Sending FormData to Cloudinary...");
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dk8ti7qwf/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );
  
      const data = await res.json();
      console.log("✅ Cloudinary response:", data);
  
      return data.secure_url; // The URL of the uploaded image
    } catch (err) {
      console.error("❌ Cloudinary upload failed:", err);
      throw err;
    }
  };

  const onCaptureImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      // @ts-ignore
      mediaTypes: ImagePicker.MediaType,
      allowsEditing: true,
      quality: 0.75,
    });
  
    if (!result.canceled && result.assets) {
      const localUri = result.assets[0].uri;
  
      // 1️⃣ Upload to Cloudinary
      const cloudUrl = await uploadToCloudinary(localUri);
      if (!cloudUrl) return;
  
      // 2️⃣ Update user profile with token auth
      const token = await SecureStore.getItemAsync("token");
      if (!token) return;
  
      try {
        const res = await fetch(`${API_URL}/api/update-user`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ image: cloudUrl }),
        });
  
        const updatedUser = await res.json();
        console.log("✅ User updated:", updatedUser);
  
        // 3️⃣ **Update local state so UI refreshes immediately**
        setUser(updatedUser); // <-- This triggers the profile image to refresh
      } catch (err) {
        console.error("❌ Error updating user:", err);
      }
    }
  };
  
  return (
    <SafeAreaView style={defaultStyles.container}>
      <View style={{ flex: 1 }}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Perfil</Text>
          {/* <Ionicons name="notifications-outline" size={26} color="black" /> */}
        </View>

        {user && (
          <GestureHandlerRootView>
            <View style={styles.card}>
              <TouchableOpacity onPress={onCaptureImage}>
                <Image source={{ uri: user?.image }} style={styles.avatar} />
              </TouchableOpacity>
              <View style={{ flexDirection: "row", gap: 6 }}>
                {edit ? (
                  <View style={styles.editRow}>
                    <TextInput
                      placeholder="Nome"
                      value={name || ""}
                      onChangeText={setName}
                      style={[defaultStyles.inputField, { width: 100 }]}
                    />
                    <TouchableOpacity onPress={onSaveUser}>
                      <Ionicons
                        name="checkmark-outline"
                        size={24}
                        color={Colors.subtext}
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.editRow}>
                    <Text style={{ fontFamily: "inter-b", fontSize: 22 }}>
                      {name}
                    </Text>
                    <TouchableOpacity onPress={() => setEdit(true)}>
                      <Ionicons
                        name="create-outline"
                        size={24}
                        color={Colors.subtext}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <Text>{email}</Text>
            </View>
          </GestureHandlerRootView>
        )}

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
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.subtext,
  },
  editRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
