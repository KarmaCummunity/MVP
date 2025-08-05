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
import { FontSizes } from "../globals/constants";
import { texts } from "../globals/texts";
import logger from '../utils/logger';

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
    const startTime = Date.now();
    const url =
      Platform.OS === "web"
        ? `http://localhost:3001/autocomplete?input=${encodeURIComponent(
            inputText
          )}`
        : `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            inputText
          )}&key=${GOOGLE_API_KEY}&language=he&components=country:il`;

    try {
      logger.info('Google Places API call started', {
        screen: 'LocationSearch',
        action: 'search_places',
        input: inputText,
        platform: Platform.OS
      });

      const response = await fetch(url);
      const json = await response.json();
      const duration = Date.now() - startTime;

      logger.info('Google Places API call completed', {
        screen: 'LocationSearch',
        action: 'search_places_complete',
        status: response.status,
        duration,
        resultsCount: Platform.OS === "web" ? json.length : json.predictions?.length || 0
      });

      if (Platform.OS !== "web" && json.status !== "OK") {
        logger.warn('Google Places API error', {
          screen: 'LocationSearch',
          action: 'search_places_error',
          status: json.status,
          errorMessage: json.error_message
        });
        console.warn("Google Places returned:", json.status, json.error_message);
        setResults([]);
        return;
      }

      // On web, we already get predictions directly from the backend
      setResults(Platform.OS === "web" ? json : json.predictions);
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Google Places API call failed', {
        screen: 'LocationSearch',
        action: 'search_places_failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      });
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
        logger.info('Location search triggered', {
          screen: 'LocationSearch',
          action: 'search_triggered',
          queryLength: text.length
        });
        searchGooglePlaces(text);
      } else {
        setResults([]);
      }
    }, 300);
    setDebounceTimer(timer);
  };

  const handleSelect = (item: PlacePrediction) => {
    logger.info('Location selected', {
      screen: 'LocationSearch',
      action: 'location_selected',
      selectedLocation: item.description
    });
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
        placeholder={placeholder || texts.locationPlaceholder}
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
    borderColor: colors.border,
    borderRadius: 8,
    marginTop: 5,
    backgroundColor: colors.white,
    overflow: "hidden",
    elevation: 3,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    borderRadius: 8,
    fontSize: FontSizes.body,
    backgroundColor: colors.backgroundSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    minHeight: 25,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  itemText: {
    textAlign: "right",
    fontSize: FontSizes.body,
    color: colors.textPrimary,
  },
});

export default LocationSearchComp;
