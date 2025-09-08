import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { defaultStyles } from "@/constants/Styles";
import { categories } from "../constants/categories";
import axios from "axios";
import MapSearchBox from "@/components/MapSearchBox";
import { API_URL } from "../config";
import ImageUpload from "@/inputs/ImageUpload";
import { useAuth } from "@/hooks/useAuth";
import * as SecureStore from "expo-secure-store";
import { Link } from "expo-router";

enum STEPS {
  CATEGORY = 0,
  LOCATION = 1,
  INFO = 2,
  IMAGES = 3,
  DESCRIPTION = 4,
  PRICE = 5,
}

const HostListing = () => {
  const [step, setStep] = useState(STEPS.CATEGORY);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [searchLat, setSearchLat] = useState<number | null>(null);
  const [searchLng, setSearchLng] = useState<number | null>(null);
  const [whatsapp, setWhatsapp] = useState("");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const { user } = useAuth();

  const handleNext = () => {
    if (step === STEPS.PRICE) {
      handleSubmit();
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > STEPS.CATEGORY) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!selectedCategory || !selectedAddress || !imageSrc) {
      alert("Preencha pelo menos a categoria, o endereço e uma imagem.");
      return;
    }

    const payload = {
      category: selectedCategory,
      location: {
        latlng: [searchLat, searchLng],
        value: selectedAddress,
      },
      whatsapp,
      imageSrc,
      title,
      description,
      price,
    };

    try {
      // get token from secure storage
      const token = await SecureStore.getItemAsync("token");
      console.log(token);
      if (!token) {
        alert("Usuário não logado.");
        return;
      }

      const response = await axios.post(`${API_URL}/api/listings`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // <--- important!
        },
      });

      console.log("Raw response:", response);
      console.log("Response data:", response.data);
      console.log(user);
      alert("Vaga criada com sucesso!");
      // Reset form
      setStep(STEPS.CATEGORY);
      setSelectedCategory(null);
      setSelectedAddress("");
      setSearchLat(null);
      setSearchLng(null);
      setWhatsapp("");
      setImageSrc(null);
      setTitle("");
      setDescription("");
      setPrice("");
    } catch (err) {
      console.error(err);
      alert("Erro ao criar vaga.");
    }
  };

  // --- Step Content ---
  let stepContent;

  switch (step) {
    case STEPS.CATEGORY:
      stepContent = (
        <View>
          <Text style={styles.title}>
            Qual dessas opções melhor descreve a sua vaga?
          </Text>
          <Text style={styles.subTitle}>Escolha uma categoria</Text>
          <View style={styles.categories}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.label}
                style={[
                  styles.categoryContainer,
                  selectedCategory === category.label &&
                    styles.selectedCategory,
                ]}
                onPress={() => setSelectedCategory(category.label)}
              >
                <MaterialCommunityIcons
                  name={category.icon as any}
                  size={28}
                  color="#000"
                />
                <Text style={{ fontFamily: "inter" }}>{category.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
      break;

    case STEPS.LOCATION:
      stepContent = (
        <View>
          <Text style={styles.title}>Onde fica a sua vaga?</Text>
          <Text style={styles.subTitle}>
            Ajude os motoristas a encontrarem sua vaga facilmente
          </Text>
          <View style={{ marginVertical: 15 }}>
            <MapSearchBox
              mapboxToken="pk.eyJ1IjoiYWx1Z2F2YWdhIiwiYSI6ImNtZTAyZXo2eTAwZzYyanNhbDhzeWFhcHUifQ.rgYUg_mpl5nvP5AboikC6Q"
              value={selectedAddress}
              onSelect={(place) => {
                setSelectedAddress(place.place_name);
                setSearchLat(place.center[1]);
                setSearchLng(place.center[0]);
              }}
            />
          </View>
        </View>
      );
      break;

    case STEPS.INFO:
      stepContent = (
        <View>
          <Text style={styles.title}>Qual é o seu WhatsApp?</Text>
          <Text style={styles.subTitle}>
            Ajude os motoristas a entrarem em contato com você facilmente.
          </Text>
          <TextInput
            value={whatsapp}
            onChangeText={setWhatsapp}
            placeholder="Digite seu WhatsApp"
            style={[defaultStyles.inputField, { marginVertical: 10 }]}
            keyboardType="phone-pad"
          />
        </View>
      );
      break;

    case STEPS.IMAGES:
      stepContent = (
        <View>
          <Text style={styles.title}>Adicione uma foto da vaga</Text>
          <ImageUpload value={imageSrc} onChange={setImageSrc} />
        </View>
      );
      break;

    case STEPS.DESCRIPTION:
      stepContent = (
        <View>
          <Text style={styles.title}>Como você descreveria a vaga?</Text>
          <View style={{ gap: 20 }}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Título"
              style={defaultStyles.inputField}
            />
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Descrição"
              style={[defaultStyles.inputField, { height: 100 }]}
              multiline
            />
          </View>
        </View>
      );
      break;

    case STEPS.PRICE:
      stepContent = (
        <View>
          <Text style={styles.title}>Defina o preço</Text>
          <Text style={styles.subTitle}>Quanto você cobra por mês?</Text>
          <TextInput
            value={price}
            onChangeText={setPrice}
            placeholder="Preço (R$)"
            style={defaultStyles.inputField}
            keyboardType="numeric"
          />
        </View>
      );
      break;
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
      {user ? (
        <>
          <Text
            style={{
              textAlign: "center",
              fontFamily: "inter-b",
              fontSize: 18,
              margin: 20,
            }}
          >
            Anuncie sua vaga
          </Text>
          <View style={styles.container}>
            <Text
              style={{
                fontFamily: "inter",
                fontSize: 14,
                color: Colors.subtext,
                marginTop: 0,
                marginBottom: 10,
              }}
            >
              Passo {step + 1} de 6
            </Text>
            {stepContent}

            <View style={styles.buttons}>
              {step > STEPS.CATEGORY && (
                <TouchableOpacity style={styles.btn} onPress={handleBack}>
                  <Text style={defaultStyles.btnText}>Voltar</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.btn} onPress={handleNext}>
                <Text style={defaultStyles.btnText}>
                  {step === STEPS.PRICE ? "Criar" : "Próximo"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      ) : (
        <View style={{flex: 1, alignItems:"center", justifyContent: "center", gap: 20}}>
          <Text
            style={{
              textAlign: "center",
              fontFamily: "inter-b",
              fontSize: 18,
              margin: 20,
            }}
          >
            Por favor, faça login para anunciar sua vaga
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

export default HostListing;

const styles = StyleSheet.create({
  categories: {
    flexDirection: "row",
    gap: 20,
    flexWrap: "wrap",
    marginBottom: 20,
  },
  container: {
    gap: 10,
    borderColor: "#c2c2c2",
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingBottom: 30,
    borderRadius: 30,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 1, height: 1 },
    marginTop: 20,
    paddingTop: 20,
  },
  categoryContainer: {
    flex: 1,
    minWidth: 100,
    height: 100,
    borderWidth: 1,
    borderColor: Colors.subtext,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  selectedCategory: {
    borderColor: Colors.primary,
    borderWidth: 3,
  },
  title: {
    fontFamily: "inter-sb",
    fontSize: 22,
    marginBottom: 20,
  },
  subTitle: {
    fontFamily: "inter",
    color: Colors.subtext,
    marginBottom: 15,
  },
  buttons: {
    flexDirection: "row",
    marginTop: 15,
  },
  btn: {
    backgroundColor: Colors.primary,
    flex: 1,
    marginHorizontal: 5,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  loginBtn: {
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
});
