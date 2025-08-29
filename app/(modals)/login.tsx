import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { defaultStyles } from "@/constants/Styles";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { API_URL } from "../config";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

// 1️⃣ Define your param list
export type RootStackParamList = {
  Auth: undefined;
  index: undefined; // main app tab
  Profile: { userId: string };
};

type AuthScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Auth"
>;

// 2️⃣ Native redirect URI (for iOS dev build)
const redirectUri = AuthSession.makeRedirectUri({
  scheme: "alugavagamobile",
});

const AuthScreen = () => {
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 3️⃣ Use the correct iOS client ID (from Google Cloud)
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId:
      "159606730618-6c9377daolfmls0rv7p3stff6fc0ne4c.apps.googleusercontent.com",
    redirectUri,
    scopes: ["profile", "email"],
  });

  console.log("🔑 Redirect URI (iOS dev build):", redirectUri);

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      console.log("✅ Got Google token:", authentication?.accessToken);

      fetch(`${API_URL}/api/mobile-login-google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: authentication?.accessToken }),
      })
        .then((res) => res.json())
        .then(async (data) => {
          console.log("📥 Backend response:", data);

          if (data?.token) {
            await SecureStore.setItemAsync("token", data.token);
            navigation.reset({ index: 0, routes: [{ name: "index" }] });
          } else {
            Alert.alert("Erro", "Falha no login com Google");
          }
        })
        .catch((err) => console.error("❌ Google login error:", err));
    }
  }, [response]);

  // your existing handleAuth() here, unchanged...

  return (
    <View style={styles.container}>
      {/* Inputs + signup/login flow... */}

      <View style={styles.seperatorView}>
        <View style={styles.line} />
        <Text style={styles.seperator}>ou</Text>
        <View style={styles.line} />
      </View>

      <View style={{ gap: 20 }}>
        <TouchableOpacity
          style={styles.btnOutline}
          onPress={() => promptAsync()} // 👈 Launch Google flow
          disabled={!request}
        >
          <Ionicons name="logo-google" style={defaultStyles.btnIcon} size={24} />
          <Text style={styles.btnOutlineText}>Continuar com Google</Text>
        </TouchableOpacity>
      </View>

      {/* Toggle signup/login */}
      <TouchableOpacity
        style={{ marginTop: 20 }}
        onPress={() => setIsSignup(!isSignup)}
      >
        <Text style={{ color: "#666", textAlign: "center" }}>
          {isSignup ? "Já tem conta? Faça login" : "Não tem conta? Cadastre-se"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 26,
  },
  seperatorView: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginVertical: 30,
  },
  seperator: {
    fontFamily: "inter-sb",
    color: Colors.subtext,
  },
  line: {
    flex: 1,
    borderBottomColor: "#000",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  btnOutline: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Colors.subtext,
    height: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  btnOutlineText: {
    color: "#000",
    fontSize: 16,
    fontFamily: "inter-sb",
  },
});

export default AuthScreen;