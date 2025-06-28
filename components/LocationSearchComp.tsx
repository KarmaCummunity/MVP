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
import colors from "../globals/colors";

interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

interface LocationSearchCompProps {
  onLocationSelected: (location: string) => void;
  placeholder?: string;
}

const GOOGLE_API_KEY = "AIzaSyAgkx8Jp2AfhhYL0wwgcOqONpaJ0-Mkcf8";

const LocationSearchComp: React.FC<LocationSearchCompProps> = ({
  onLocationSelected,
  placeholder,
}) => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<PlacePrediction[]>([]);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  const searchGooglePlaces = async (inputText: string) => {
    const url =
      Platform.OS === "web"
        ? `http://localhost:3001/autocomplete?input=${encodeURIComponent(
            inputText
          )}`
        : `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            inputText
          )}&key=${GOOGLE_API_KEY}&language=he&components=country:il`;

    try {
      const response = await fetch(url);
      const json = await response.json();

      if (Platform.OS !== "web" && json.status !== "OK") {
        console.warn("Google Places returned:", json.status, json.error_message);
        setResults([]);
        return;
      }

      // On web, we already get predictions directly from the backend
      setResults(Platform.OS === "web" ? json : json.predictions);
    } catch (error) {
      console.error("Autocomplete error:", error);
      setResults([]);
    }
  };

  const handleChangeText = (text: string) => {
    setQuery(text);
    onLocationSelected(text);

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

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
    setQuery(item.description);
    setResults([]);
    onLocationSelected(item.description);
  };

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return (
    <View style={local_styles.container}>
      <TextInput
        value={query}
        onChangeText={handleChangeText}
        placeholder={placeholder || "בחר מיקום"}
        placeholderTextColor={colors.black}
        style={local_styles.input}
      />

      {results.length > 0 && (
        <View style={local_styles.resultsContainer}>
          <FlatList
            data={results}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={local_styles.item}
                onPress={() => handleSelect(item)}
              >
                <Text style={local_styles.itemText}>
                  {item.description}
                </Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            scrollEnabled
          />
        </View>
      )}
    </View>
  );
};

const local_styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    marginBottom: 15,
    width: "100%",
  },
  resultsContainer: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    marginTop: 5,
    backgroundColor: "white",
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 12,
    borderRadius: 8,
    fontSize: 14,
    backgroundColor: "#f9f9f9",
    textAlign: "right",
    writingDirection: "rtl",
    minHeight: 25,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  itemText: {
    textAlign: "right",
    fontSize: 14,
    color: "#333",
  },
});

export default LocationSearchComp;
