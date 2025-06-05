import React, { useState } from "react";
import {
  View,
  Text,
  TextInput, // Import TextInput
  StyleSheet,
  TouchableOpacity,
  FlatList, // Import FlatList for efficient list rendering
} from "react-native";

interface AutocompleteDropdownProps {
  label: string;
  selectedValue: string; // This will now represent the current input value
  onValueChange: (value: string) => void;
  options: string[]; // The list of all possible suggestions
}

const AutocompleteDropdownComp: React.FC<AutocompleteDropdownProps> = ({
  label,
  selectedValue,
  onValueChange,
  options,
}) => {
  const [inputValue, setInputValue] = useState(selectedValue);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Effect to update internal input value when selectedValue prop changes
  // This is useful if the parent component sets the value programmatically
  React.useEffect(() => {
    setInputValue(selectedValue);
  }, [selectedValue]);

  const handleInputChange = (text: string) => {
    setInputValue(text);
    onValueChange(text); // Immediately update parent with current input

    if (text.length > 0) {
      const filtered = options.filter((option) =>
        option.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredOptions(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredOptions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectOption = (option: string) => {
    setInputValue(option);
    onValueChange(option); // Update parent with selected option
    setShowSuggestions(false); // Hide suggestions after selection
    setFilteredOptions([]); // Clear filtered options
  };

  const handleInputFocus = () => {
    // Show suggestions on focus if there's existing input or if you want to show all options initially
    if (inputValue.length > 0) {
        handleInputChange(inputValue); // Re-filter based on current value
    } else {
        setFilteredOptions(options); // Show all options if input is empty
    }
    setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    // A small delay helps if you have TouchableOpacity inside FlatList that needs to register the press
    setTimeout(() => {
      setShowSuggestions(false);
      // Optional: If input doesn't match an option, you might want to clear it or leave it as free text
      // For now, we leave it as free text if no exact match was selected.
    }, 100);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={`הכנס ${label.replace('?', '')}...`}
          placeholderTextColor="#999"
        />
        {showSuggestions && filteredOptions.length > 0 && (
          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSelectOption(item)}
              >
                <Text style={styles.suggestionText}>{item}</Text>
              </TouchableOpacity>
            )}
            style={styles.suggestionsList}
            // You might want to limit the height of the suggestions list
            // to prevent it from taking up too much screen space.
            // maxHeight: 150, // Example max height
            // You can also use `keyboardShouldPersistTaps='always'` on the main ScrollView
            // or here if the keyboard interferes with suggestion selection.
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    zIndex: 10, 
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
    textAlign: 'right', // For RTL
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "white",
    zIndex: 1, // Ensure suggestions appear above other content
  },
  input: {
    height: 40,
    paddingHorizontal: 10,
    fontSize: 16,
    textAlign: 'right', // For RTL
    writingDirection: 'rtl', // Explicit RTL text direction
  },
  suggestionsList: {
    maxHeight: 150, // Limit height of suggestions list
    borderColor: "#D1D5DB",
    borderTopWidth: 1,
    backgroundColor: "white",
    borderRadius: 8,
    position: 'absolute', // Position suggestions over other content
    width: '100%',
    top: 40, // Position right below the input
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 100, // Make this very high to guarantee it's on top
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  suggestionText: {
    fontSize: 16,
    textAlign: 'right', // For RTL
    writingDirection: 'rtl', // Explicit RTL text direction
  },
});

export default AutocompleteDropdownComp;