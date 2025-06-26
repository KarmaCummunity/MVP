import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";

const GOOGLE_API_KEY = "AIzaSyAgkx8Jp2AfhhYL0wwgcOqONpaJ0-Mkcf8"; // 🔁 Replace with your real key

interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

export default function LocationSearchComp() {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<PlacePrediction[]>([]);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  const searchGooglePlaces = async (inputText: string) => {
    if (Platform.OS === "web") {
      console.warn("Google Places Autocomplete is disabled on Web due to CORS.");
      return;
    }

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      inputText
    )}&key=${GOOGLE_API_KEY}&language=he&components=country:il`;

    try {
      const response = await fetch(url);
      const json = await response.json();

      if (json.status !== "OK") {
        console.warn("Google Places returned:", json.status, json.error_message);
        setResults([]);
        return;
      }

      setResults(json.predictions as PlacePrediction[]);
    } catch (error) {
      console.error("Autocomplete error:", error);
    }
  };

  const handleChangeText = (text: string) => {
    setQuery(text);

    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => {
      if (text.length > 1) {
        searchGooglePlaces(text);
      } else {
        setResults([]);
      }
    }, 300);
    setDebounceTimer(timer);
  };

  const handleSelect = (item: PlacePrediction) => {
    console.log("Selected:", item.description);
    setQuery(item.description);
    setResults([]);
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={query}
        onChangeText={handleChangeText}
        placeholder="חפש מיקום בישראל..."
        style={styles.input}
      />

      <FlatList
        data={results}
        keyExtractor={(item) => item.place_id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => handleSelect(item)}
          >
            <Text style={styles.itemText}>{item.description}</Text>
          </TouchableOpacity>
        )}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // paddingTop: 60,
    // paddingHorizontal: 16,
    marginBottom: 15,
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    textAlign: "right",
  },
  item: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  itemText: {
    textAlign: "right",
    fontSize: 16,
    color: "#333",
  },
});