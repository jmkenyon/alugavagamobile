import React, { useState } from "react";
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
import { useEffect } from "react";
import * as AuthSession from "expo-auth-session";
import { useAuth } from "@/hooks/useAuth"; // wherever your AuthProvider/useAuth is

WebBrowser.maybeCompleteAuthSession();
// 1️⃣ Define your param list
export type RootStackParamList = {
  Auth: undefined;
  index: undefined; // main app tab
  Profile: { userId: string }; // example
};

const redirectUri = AuthSession.makeRedirectUri({
  scheme: "com.alugavaga",
  useProxy: true,
  // For usage in bare and standalone
} as any);
console.log(redirectUri);

type AuthScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Auth"
>;

const AuthScreen = () => {
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth(); // get setUser from context
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId:
      "159606730618-h1fqt1fkbjiqgpio3qmlsmk5k5evdhtb.apps.googleusercontent.com",
    iosClientId:
      "159606730618-6c9377daolfmls0rv7p3stff6fc0ne4c.apps.googleusercontent.com",
    redirectUri: redirectUri,
    scopes: ["openid", "https://www.googleapis.com/auth/userinfo.email"],
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
  
      (async () => {
        try {
          const res = await fetch(`${API_URL}/api/mobile-login-google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token: authentication?.accessToken }),
          });
  
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error || "Erro ao logar com Google");
  
          // 1. Save JWT in SecureStore
          await SecureStore.setItemAsync("token", data.token);
  
          // 2. Set user in context
          setUser(data.user);
  
          // 3. Navigate back or to main app
          navigation.goBack();
        } catch (err: any) {
          console.error("❌ Google login error:", err);
          Alert.alert("Erro", err.message || "Não foi possível logar");
        }
      })();
    }
  }, [response]);

  async function handleAuth() {
    if (!email || !password || (isSignup && !name)) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);



    try {
      if (isSignup) {
        // 1️⃣ Register user
        console.log("Sending signup request...", { name, email, password });
        const registerRes = await fetch(`${API_URL}/api/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        console.log(" Signup response status:", registerRes.status);

        const registerData = await registerRes.json().catch(() => {
          throw new Error(
            "Não foi possível ler a resposta do backend (signup)"
          );
        });

        console.log(" Signup response JSON:", registerData);

        if (!registerRes.ok) {
          throw new Error(registerData?.message || "Erro ao registrar usuário");
        }
      }

      

      // 2️⃣ Login
      const loginRes = await fetch(`${API_URL}/api/mobile-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok || loginData?.error) {
        throw new Error(loginData?.error || "Erro ao fazer login");
      }

      // Save JWT in secure storage
      await SecureStore.setItemAsync("token", loginData.token);
      console.log("💾 Token length:", loginData.token?.length);

      const userRes = await fetch(`${API_URL}/api/mobile-current-user`, {
        headers: { Authorization: `Bearer ${loginData.token}` },
      });
      
      if (!userRes.ok) throw new Error("Erro ao buscar usuário");
      
      const currentUser = await userRes.json();
      setUser(currentUser); // <-- Update context immediately

      //  Store token securely
      console.log("💾 Storing token in SecureStore:", loginData?.token);
      await SecureStore.setItemAsync("token", loginData?.token ?? "");


      // 4️⃣ Navigate and reset stack
      navigation.goBack();


    } catch (err: any) {
      console.error("❌ Auth error:", err);
      Alert.alert("❌ Erro", err.message || "Algo deu errado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {isSignup && (
        <TextInput
          placeholder="Nome"
          style={[defaultStyles.inputField, { marginBottom: 15 }]}
          value={name}
          onChangeText={setName}
        />
      )}
      <TextInput
        autoCapitalize="none"
        placeholder="Email"
        style={[defaultStyles.inputField, { marginBottom: 15 }]}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        autoCapitalize="none"
        placeholder="Senha"
        secureTextEntry
        style={[defaultStyles.inputField, { marginBottom: 30 }]}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={defaultStyles.btn}
        onPress={handleAuth}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={defaultStyles.btnText}>
            {isSignup ? "Cadastrar" : "Entrar"}
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.seperatorView}>
        <View style={styles.line} />
        <Text style={styles.seperator}>ou</Text>
        <View style={styles.line} />
      </View>

      <View style={{ gap: 20 }}>
        <TouchableOpacity
          style={styles.btnOutline}
          onPress={() => promptAsync()} // 👈 triggers Google OAuth flow
        >
          <Ionicons
            name="logo-google"
            style={defaultStyles.btnIcon}
            size={24}
          />
          <Text style={styles.btnOutlineText}>Continuar com Google</Text>
        </TouchableOpacity>
      </View>

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
