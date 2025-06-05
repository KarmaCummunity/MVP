import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import HeaderComp from "../components/HeaderComp";
import { charityNames } from "../globals/Constant";

// Reusable Dropdown component (keep as is)
interface DropdownProps {
  label: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  options: string[];
}

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

export default function MoneyScreen({
  navigation,
}: {
  navigation: NavigationProp<ParamListBase>;
}) {
  const [selectedRecipient, setSelectedRecipient] = useState<string>("");
  const [selectedAmount, setSelectedAmount] = useState<string>("");
  const [mode, setMode] = useState<"מחפש" | "מציע">("מחפש");

  const amountOptions = ["₪10", "₪50", "₪100", "₪500", "₪1000", "₪2000"];

  const handleSelectMenuItem = (option: string) => {
    Alert.alert(`Selected: ${option}`);
  };

  const handleDonate = () => {
    if (!selectedRecipient || !selectedAmount) {
      Alert.alert("שגיאה", "אנא בחר נמען וסכום לפני התרומה.");
    } else {
      Alert.alert(
        "תרומה בוצעה",
        `תודה על תרומתך ${selectedAmount} ל-${selectedRecipient}!`
      );
    }
  };

  const toggleMode = (): void => {
    setMode((prev) => (prev === "מחפש" ? "מציע" : "מחפש"));
  };

  return (
    <SafeAreaView style={localStyles.safeArea}>
      {/* Wrapper View */}
      <View style={localStyles.wrapper}>
        {/* Header Component - This stays outside the ScrollView */}
        <HeaderComp
          mode={mode}
          onToggleMode={toggleMode}
          onSelectMenuItem={handleSelectMenuItem}
        />

        {/* Scrollable Content */}
        <ScrollView
          contentContainerStyle={localStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          // The container style for the ScrollView itself, if needed
          style={localStyles.scrollViewBase}
        >
          {/* Dropdowns */}
          <View style={localStyles.dropdownContainer}>
            <Dropdown
              label="למי ?"
              selectedValue={selectedRecipient}
              onValueChange={(val) => setSelectedRecipient(val)}
              options={charityNames}
            />
            <Dropdown
              label="כמה ?"
              selectedValue={selectedAmount}
              onValueChange={(val) => setSelectedAmount(val)}
              options={amountOptions}
            />
          </View>

          {/* Donate Button */}
          <TouchableOpacity
            style={localStyles.donateButton}
            onPress={handleDonate}
          >
            <Text style={localStyles.donateButtonText}>תרום</Text>
          </TouchableOpacity>

          {/* Filter Buttons */}
          <View style={localStyles.filterButtonsContainer}>
            {["הטבות", "אמצעי תשלום", "ילד1ים", "קרוב אליי"].map((label) => (
              <TouchableOpacity key={label} style={localStyles.filterButton}>
                <Text style={localStyles.filterButtonText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recommended Section */}
          <View style={localStyles.section}>
            <Text style={localStyles.sectionTitle}>מומלצים:</Text>
            {[1, 2].map((_, i) => (
              <View style={localStyles.card} key={`rec-${i}`}>
                <Image
                  source={{ uri: "https://via.placeholder.com/50" }}
                  style={localStyles.cardImage}
                />
                <View style={localStyles.cardContent}>
                  <Text style={localStyles.cardTitle}>JGive</Text>
                  <Text style={localStyles.cardDescription}>
                    אצלנו התרומה שלך שווה יותר
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* All Section */}
          <View style={localStyles.section}>
            <Text style={localStyles.sectionTitle}>הכל:</Text>
            {["האגודה למלחמה בסרטן", "לתת", "לתת"].map((title, idx) => (
              <View style={localStyles.card} key={`all-${idx}`}>
                <Image
                  source={{ uri: "https://via.placeholder.com/50" }}
                  style={localStyles.cardImage}
                />
                <View style={localStyles.cardContent}>
                  <Text style={localStyles.cardTitle}>{title}</Text>
                  <Text style={localStyles.cardDescription}>
                    סיוע הומניטרי ישראלי
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFEDD5",
  },
  wrapper: {
    flex: 1,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    // Remove paddingTop here, as HeaderComp handles its own padding.
  },
  // Add a base style for the ScrollView itself if needed, for example, to define its padding.
  scrollViewBase: {
    flex: 1, // Allow ScrollView to take remaining height
    paddingHorizontal: 16, // Apply horizontal padding to the scrollable area
    paddingTop: 12, // Add some padding below the header
  },
  scrollContent: {
    paddingBottom: 24,
    // paddingTop: 12, // This padding will now be relative to the scrollViewBase paddingTop
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
  donateButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 10,
    alignSelf: "center",
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
    gap: 10,
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
    flexDirection: "row",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 12,
    alignItems: "center",
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
  trumpCard: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 12,
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