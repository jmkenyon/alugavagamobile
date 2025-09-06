import ModalHeaderText from "@/components/ModalHeaderText";
import FloatingWhatsApp from "@/components/WhatsApp";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { TouchableOpacity } from "react-native";
import "react-native-reanimated";
import React from "react";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    inter: require("../assets/fonts/Inter_Regular.ttf"),
    "inter-sb": require("../assets/fonts/Inter_SemiBold.ttf"),
    "inter-b": require("../assets/fonts/Inter_Bold.ttf"),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const router = useRouter();

  useEffect(() => {});

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(modals)/login"
          options={{
            title: "Entrar ou Cadastrar",
            headerTitleStyle: {
              fontFamily: "inter-sb",
            },
            presentation: "modal",
            headerRight: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="close-outline" size={24} />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="anuncio/[id]"
          options={{ headerTitle: "", headerTransparent: true }}
        />
        <Stack.Screen
          name="(modals)/booking"
          options={{
            presentation: "transparentModal",
            animation: "fade",
            headerTransparent: true,
            headerTitle: () => <ModalHeaderText />,
            headerRight: () => (
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  marginRight: 10,
                  backgroundColor: "white",
                  borderRadius: 20,
                  padding: 4,
                  borderColor: Colors.subtext,
                  borderWidth: 1,
                }}
              >
                <Ionicons name="close-outline" size={22} />
              </TouchableOpacity>
            ),
          }}
        />
      </Stack>
      <FloatingWhatsApp phoneNumber="5511934076875" />
    </>
  );
}
