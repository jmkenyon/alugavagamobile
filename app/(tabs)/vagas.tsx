import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/useAuth";
import { Link, router } from "expo-router";
import Colors from "@/constants/Colors";
import axios from "axios";
import { API_URL } from "../config";
import * as SecureStore from "expo-secure-store";
import { formatLocation } from "../utils/formatLocation";

const vagas = () => {
  const { user } = useAuth();
  const [vagas, SetVagas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(
    null
  );

  const fetchListings = async () => {
    try {
      setLoading(true); // start loading
      const token = await SecureStore.getItemAsync("token");

      if (!token) {
        Alert.alert("Erro", "Usuário não logado.");
        return;
      }

      const response = await axios.get(`${API_URL}/api/myListings`, {
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token
        },
      });

      SetVagas(response.data); // set listings
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Erro ao carregar suas vagas.");
    } finally {
      setLoading(false); // stop loading
    }
  };

  useEffect(() => {
    if (user) fetchListings();
  }, [user]);

  const openDeleteModal = (id: string) => {
    setSelectedListingId(id);
    setIsModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedListingId) return;

    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) return;

      await axios.delete(`${API_URL}/api/listings/${selectedListingId}`, {
        headers: {   "x-access-token": token},
      });

      // Refresh or remove locally
      SetVagas(vagas.filter((v) => v.id !== selectedListingId));
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Não foi possível excluir a vaga");
    } finally {
      setIsModalVisible(false);
      setSelectedListingId(null);
    }
  };

  const cancelDelete = () => {
    setIsModalVisible(false);
    setSelectedListingId(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
      {!user ? (
        <View style={styles.noUserContainer}>
          <Text style={styles.noUserText}>
            Por favor, faça login para ver suas vagas
          </Text>
          <Link href="/(modals)/login" asChild>
            <TouchableOpacity style={styles.anunciarBtn}>
              <Text style={styles.btnText}>Entrar</Text>
            </TouchableOpacity>
          </Link>
        </View>
      ) : vagas.length ===0 ? (
        <View style={styles.noUserContainer}>
        <Text style={styles.noUserText}>
            Você ainda não possui nenhuma vaga cadastrada.
        </Text>
        <Link href="/(tabs)/host" asChild>
          <TouchableOpacity style={styles.anunciarBtn}>
            <Text style={styles.btnText}>Anunciar</Text>
          </TouchableOpacity>
        </Link>
      </View>
      ) : (
        <FlatList
          data={vagas}
          keyExtractor={(item) => item.id}
          refreshing={loading}           // show loading indicator
          onRefresh={fetchListings}
          contentContainerStyle={{ padding: 16 }}
          ListHeaderComponent={
            <View style={styles.headerContainer}>
              <Text style={styles.info}>
                Você tem {vagas.length} {vagas.length === 1 ? "vaga" : "vagas"}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <>
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/anuncio/${item.id}`)}
              >
                <Image source={{ uri: item.imageSrc }} style={styles.image} />

                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.location}>
                  {formatLocation(item.locationValue)}
                </Text>
                <Text style={styles.price}>
                  <Text style={{ color: "black", fontFamily: "inter-sb" }}>
                    R${item.price}
                  </Text>
                  <Text style={{ color: "#666", fontFamily: "inter" }}>
                    {" "}
                    por mês
                  </Text>
                </Text>
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() => openDeleteModal(item.id)}
                >
                  <Text style={styles.btnText}>Excluir vaga</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </>
          )}
        />
      )}
      {isModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Tem certeza?</Text>
            <Text style={styles.modalText}>
              Deseja realmente excluir esta vaga?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={cancelDelete}
              >
                <Text style={{color: "#000", fontFamily: "inter-sb"}}>Não</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnConfirm}
                onPress={confirmDelete}
              >
                <Text style={{color: "#fff", fontFamily: "inter-sb"}}>Sim</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default vagas;

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20,
    marginTop: -15,
  },
  info: { textAlign: "center", fontFamily: "inter-sb", fontSize: 16 },
  image: { width: "100%", height: 200 },
  title: { fontFamily: "inter-sb", fontSize: 16, margin: 8 },
  location: {
    fontFamily: "inter",
    fontSize: 14,
    margin: 8,
    color: Colors.subtext,
  },
  price: {
    fontFamily: "inter",
    fontSize: 14,
    marginHorizontal: 8,
    marginBottom: 12,
    color: Colors.subtext,
  },
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
  heartIcon: { position: "absolute", top: 10, right: 10 },
  anunciarBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 26,
    borderRadius: 8,
    flexWrap: 'nowrap',
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "inter-b",
    textAlign: "center",
  },
  noUserContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  noUserText: {
    textAlign: "center",
    fontFamily: "inter-b",
    fontSize: 18,
    margin: 20,
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
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },

  // Modal container (centered box)
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
  },

  // Title text
  modalTitle: {
    fontSize: 18,

    fontFamily: "inter-b",
    marginBottom: 8,
    textAlign: "center",
  },

  // Description text
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
    fontFamily: "inter"
  },

  // Button container (row layout)
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10, // add spacing between buttons
  },

  // Cancel button style
  modalBtnCancel: {
    flex: 1,
    backgroundColor: "#e0e0e0",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  // Confirm button style
  modalBtnConfirm: {
    flex: 1,
    backgroundColor: "#076951",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});
