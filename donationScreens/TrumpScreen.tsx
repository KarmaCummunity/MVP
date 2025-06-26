import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform, // Import Platform
} from "react-native";
import { Picker } from "@react-native-picker/picker";
// import SearchBar from "../components/SearchBar"; // Not used in provided snippet
// import MenuComp from "../components/MenuComp"; // Not used in provided snippet
// import ModeToggleButton from "../components/ModeToggleButton"; // Not used in provided snippet
import HeaderComp from "../components/HeaderComp";
import { filter_for_trumps } from "../globals/constants";

const dropdownOptions = {
  to: ["תל אביב", "ירושלים", "חיפה"],
  from: ["באר שבע", "אשדוד", "חולון"],
  when: ["היום", "מחר", "שבוע הבא"],
};

interface Filters {
  to: string;
  from: string;
  when: string;
}

interface DropdownProps {
  label: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  options: string[];
}

// Reusable Dropdown component (keep as is)
const Dropdown: React.FC<DropdownProps> = ({
  label,
  selectedValue,
  onValueChange,
  options,
}) => {
  return (
    <View style={localStyles.dropdownBox}>
      <Picker
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        mode="dropdown"
      >
        <Picker.Item label={label} value="" />
        {options.map((opt, idx) => (
          <Picker.Item key={idx} label={opt} value={opt} />
        ))}
      </Picker>
    </View>
  );
};

export default function TrumpScreen() {
  const [filters, setFilters] = useState<Filters>({
    to: "",
    from: "",
    when: "",
  });
  const [mode, setMode] = useState<"מחפש" | "מציע">("מחפש");

  const handleSelectMenuItem = (option: string) => {
    alert(`Selected: ${option}`);
  };

  const handleDropdownChange = (field: keyof Filters, value: string): void => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const toggleMode = (): void => {
    console.log("Toggling mode" + mode);
    setMode((prev) => (prev === "מחפש" ? "מציע" : "מחפש"));
  };

  return (
    <SafeAreaView style={localStyles.safeArea}>
      {/* New Wrapper View */}
      <View style={localStyles.wrapper}>
        {/* <View st yle={localStyles.container}> */}
          {/* Replaced with HeaderSection component */}
          <HeaderComp
            mode={mode}
            menuOptions={filter_for_trumps}
            onToggleMode={toggleMode}
            onSelectMenuItem={handleSelectMenuItem}
          />
          {/* Scrollable Content */}
          <ScrollView
            contentContainerStyle={localStyles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Dropdowns */}
            <View style={localStyles.dropdownContainer}>
              <Dropdown
                label="? לאיפה"
                selectedValue={filters.to}
                onValueChange={(val) => handleDropdownChange("to", val)}
                options={dropdownOptions.to}
              />
              <Dropdown
                label="? מאיפה"
                selectedValue={filters.from}
                onValueChange={(val) => handleDropdownChange("from", val)}
                options={dropdownOptions.from}
              />
              <Dropdown
                label="? מתי"
                selectedValue={filters.when}
                onValueChange={(val) => handleDropdownChange("when", val)}
                options={dropdownOptions.when}
              />
            </View>

            {/* Results */}
            <Text style={localStyles.sectionTitle}>טרמפים :</Text>
            <View style={localStyles.trumpCard}>
              {/* Using trumpCard style */}
              <Text style={localStyles.trumpCardTitle}>נועם סרוסי</Text>
              <Text>מ: יאשיהו ל׳ הרכבת</Text>
              <Text>ב: 02/01/2023 - 15:30</Text>
            </View>
            <View style={localStyles.trumpCard}>
              {/* Using trumpCard style */}
              <Text style={localStyles.trumpCardTitle}>נועם סרוסי</Text>
              <Text>מ: שטרן 29, הרכבת לתל אביב</Text>
              <Text>ב: היום - 15:30</Text>
            </View>

            {/* Groups */}
            <Text style={localStyles.sectionTitle}>קבוצות:</Text>
            {[...Array(5)].map((_, idx) => (
              <View key={idx} style={localStyles.trumpCard}>
                {/* Using trumpCard style */}
                <Text style={localStyles.trumpCardSubtitle}>
                  קבוצת טרמפים לדוגמה #{idx + 1}
                </Text>
                <Text style={localStyles.trumpCardText}>
                  הודעה לדוגמה מתוך הקבוצה
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      {/* </View> */}
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({

safeArea: {
    flex: 1,
    backgroundColor: "#FFEDD5",
  },
  // This new wrapper will handle centering and max width for web
  wrapper: {
    flex: 1,
    width: "100%", // Take full width of parent (safeArea)
    maxWidth: 600, // Max width for web (adjust as needed)
    alignSelf: "center", // Center horizontally within SafeAreaView
    // paddingTop: Platform.OS === 'android' ? 20 : 0, // Optional: Android specific top padding
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  scrollContent: {
    paddingBottom: 24,
    paddingTop: 12,
  },
  dropdownContainer: {
    gap: 12,
    marginBottom: 24,
  },
  dropdownBox: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
  },
  // MoneyScreen specific styles
  donateButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 10,
    alignSelf: "center", // Center the button horizontally
  },
  donateButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  filterButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
    gap: 10, // Adds space between buttons
  },
  filterButton: {
    backgroundColor: "#E0E0E0",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  filterButtonText: {
    fontSize: 14,
    color: "#333",
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
  },
  card: {
    flexDirection: "row", // For MoneyScreen cards
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 12,
    alignItems: "center", // For MoneyScreen cards
  },
  cardImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  cardDescription: {
    fontSize: 13,
    color: "#6B7280",
  },
  // TrumpScreen specific card styles (overrides if needed)
  trumpCard: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 12,
    // Removed flexDirection and alignItems to make it vertical by default
  },
  trumpCardTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  trumpCardSubtitle: {
    fontWeight: "600",
    fontSize: 15,
  },
  trumpCardText: {
    fontSize: 13,
    color: "#6B7280",
  },
});