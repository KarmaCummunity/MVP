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

// IMPORTANT: Replace "AIzaSyAgkx8Jp2AfhhYL0wwgcOqONpaJ0-Mkcf8" with your actual Google Places API Key.
// If you are developing for a specific platform (e.g., Android, iOS), ensure your API key
// is restricted correctly for that platform to prevent unauthorized use.
const GOOGLE_API_KEY = "AIzaSyAgkx8Jp2AfhhYL0wwgcOqONpaJ0-Mkcf8";

/**
 * Interface for Google Place Autocomplete Prediction objects.
 */
interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

/**
 * Props for the LocationSearchComp component.
 * @param onLocationSelected - Callback function fired when a location is selected or typed.
 */
interface LocationSearchCompProps {
  onLocationSelected: (location: string) => void;
}

/**
 * LocationSearchComp is a React Native component that provides a search input
 * with Google Places Autocomplete functionality for searching locations in Israel.
 * It debounces user input to limit API calls and provides selected location back
 * to the parent component via `onLocationSelected` prop.
 */
const LocationSearchComp: React.FC<LocationSearchCompProps> = ({ onLocationSelected }) => {
  // State to hold the current input query for location search
  const [query, setQuery] = useState<string>("");
  // State to hold the autocomplete results from Google Places API
  const [results, setResults] = useState<PlacePrediction[]>([]);
  // State to manage the debounce timer for API calls
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  /**
   * Fetches place predictions from Google Places Autocomplete API based on the input text.
   * This function is skipped on web platform due to common CORS issues in development.
   * @param inputText The text entered by the user for location search.
   */
  const searchGooglePlaces = async (inputText: string) => {
    // Google Places Autocomplete typically has CORS issues when running on web in development.
    // This warning helps developers identify the limitation.
    if (Platform.OS === "web") {
      console.warn("Google Places Autocomplete is disabled on Web due to CORS. Please test on a mobile emulator/device.");
      return;
    }

    // Construct the URL for the Google Places Autocomplete API.
    // It includes the input text, API key, language (Hebrew), and country components (Israel).
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      inputText
    )}&key=${GOOGLE_API_KEY}&language=he&components=country:il`;

    try {
      const response = await fetch(url);
      const json = await response.json();

      // Check the status of the API response.
      if (json.status !== "OK") {
        console.warn("Google Places returned:", json.status, json.error_message);
        setResults([]); // Clear results if there's an error
        return;
      }

      // Update the results state with the predictions received from the API.
      setResults(json.predictions as PlacePrediction[]);
    } catch (error) {
      console.error("Autocomplete error:", error);
      // It's good practice to clear results on network errors as well.
      setResults([]);
    }
  };

  /**
   * Handles changes in the text input. It updates the query state,
   * calls `onLocationSelected` immediately with the current text,
   * and sets up a debounce timer to call `searchGooglePlaces`.
   * @param text The current text from the input field.
   */
  const handleChangeText = (text: string) => {
    setQuery(text); // Update the query state immediately
    onLocationSelected(text); // Inform the parent component about the current text

    // Clear any existing debounce timer to reset the delay
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set a new debounce timer. The search will only be performed if the user
    // stops typing for 300 milliseconds.
    const timer = setTimeout(() => {
      if (text.length > 1) { // Only search if the input has more than 1 character
        searchGooglePlaces(text);
      } else {
        setResults([]); // Clear results if the input is too short
      }
    }, 300); // 300ms debounce time
    setDebounceTimer(timer); // Store the timer ID to clear it later if needed
  };

  /**
   * Handles the selection of an item from the autocomplete results list.
   * It updates the query with the selected description, clears results,
   * and notifies the parent component.
   * @param item The selected PlacePrediction object.
   */
  const handleSelect = (item: PlacePrediction) => {
    // console.log("Selected:", item.description);
    setQuery(item.description); // Set the input text to the selected location
    setResults([]); // Clear the autocomplete results list
    onLocationSelected(item.description); // Notify the parent component of the final selection
  };

  // Cleanup effect for the debounce timer when the component unmounts
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]); // Rerun effect if debounceTimer changes

  return (
    <View style={local_styles.container}>
      <TextInput
        value={query} // Bind input value to the query state
        onChangeText={handleChangeText} // Call handler on text change
        placeholder="חפש מיקום בישראל..." // Placeholder text
        style={local_styles.input} // Apply custom styles
        // `keyboardShouldPersistTaps="handled"` is useful for FlatList to ensure
        // touches on items are registered and don't dismiss the keyboard
        // before the touch is handled.
        // keyboardShouldPersistTaps="handled"
      />

      {/* Display autocomplete results in a FlatList */}
      {results.length > 0 && ( // Only render FlatList if there are results
        <View style={local_styles.resultsContainer}> {/* New wrapper for results */}
          <FlatList
            data={results}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={local_styles.item}
                onPress={() => handleSelect(item)}
              >
                <Text style={local_styles.itemText}>{item.description}</Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
            // Important: This is key to fix the nesting issue
            // We ensure it can scroll independently within its max height if needed
            // But we don't set scrollEnabled=false unless it truly doesn't need its own scroll
            // You could also add `style={{ flexGrow: 0 }}` if the list itself shouldn't grow.
          />
        </View>
      )}
    </View>
  );
};

// StyleSheet for the LocationSearchComp component
const local_styles = StyleSheet.create({
  container: {
    flex: 1,
    // marginTop: 10,
    paddingHorizontal: 15, // Padding on the left for better alignment
    marginBottom: 15, // Margin at the bottom for spacing
    // Removed flex: 1 as it can interfere with parent layouts in some contexts.
    // The component will now take the space it needs within its parent.
  },
  resultsContainer: {
    maxHeight: 200, 
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginTop: 5,
    backgroundColor: 'white',
    overflow: 'hidden', // Ensures content doesn't overflow rounded corners
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    textAlign: "right", // Right-align text for RTL languages like Hebrew
  },
  item: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  itemText: {
    textAlign: "right", // Right-align text for RTL languages
    fontSize: 16,
    color: "#333",
  },
});

export default LocationSearchComp;
