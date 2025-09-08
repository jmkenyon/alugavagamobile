import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

interface ImageUploadProps {
  onChange: (value: string) => void;
  value?: string | null;
}

const CLOUDINARY_UPLOAD_PRESET = "alugavaga_upload_preset"; // same as your Next.js
const CLOUDINARY_CLOUD_NAME = "dk8ti7qwf"; // from Cloudinary dashboard

const ImageUpload: React.FC<ImageUploadProps> = ({ onChange, value }) => {
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    // Ask for permission
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Precisamos de permissão para acessar suas fotos.");
      return;
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
        //@ts-ignore
      mediaTypes: ImagePicker.MediaType,
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      uploadImage(asset.uri);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setLoading(true);

      // Convert to FormData
      const formData = new FormData();
      formData.append("file", {
        uri,
        type: "image/jpeg",
        name: "upload.jpg",
      } as any);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      // Send to Cloudinary
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const url = res.data.secure_url;
      onChange(url);
    } catch (err) {
      console.error("Erro no upload:", err);
      alert("Erro ao enviar imagem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={pickImage}>
      {loading ? (
        <ActivityIndicator size="large" color="#666" />
      ) : value ? (
        <Image source={{ uri: value }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="camera" size={40} color="#666" />
          <Text style={styles.text}>Clique para enviar</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default ImageUpload;

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#ccc",
    height: 200,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});