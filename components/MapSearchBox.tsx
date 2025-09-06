import React, { useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type MapSearchBoxProps = {
  onSelect: (place: any) => void;
  mapboxToken: string;
  value?: string;
};

const MapSearchBox: React.FC<MapSearchBoxProps> = ({
  onSelect,
  mapboxToken,
  value,
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  React.useEffect(() => {
    if (value !== undefined) setQuery(value);
  }, [value]);

  const fetchSuggestions = async (text: string) => {
    setQuery(text);
    if (!text) return setSuggestions([]);
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          text
        )}.json?access_token=${mapboxToken}&autocomplete=true&limit=5&country=BR&types=address,place`
      );
      const data = await res.json();
      setSuggestions(data.features || []);
    } catch (error) {
      console.warn("Mapbox autocomplete error:", error);
    }
  };

  const handleSelect = (item: any) => {
    setQuery(item.place_name);
    setSuggestions([]);
    onSelect(item);
  };

  return (
    <View style={styles.container}>
      {/* Input with icon */}
      <View style={styles.inputWrapper}>
        <Ionicons name="search" size={20} color="#888" style={styles.icon} />
        <TextInput
          value={query}
          onChangeText={fetchSuggestions}
          placeholder="Pesquisar local"
          style={styles.input}
        />
      </View>

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelect(item)}
              style={styles.suggestion}
            >
              <Text>{item.place_name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default MapSearchBox;

const styles = StyleSheet.create({
  container: { width: "100%", zIndex: 10 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    height: 50,
  },
  icon: { marginRight: 8 },
  input: { flex: 1, height: "100%" },
  suggestion: {
    padding: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});
