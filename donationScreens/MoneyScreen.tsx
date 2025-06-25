import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList, // Changed from ScrollView to FlatList
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  ScrollView,
} from "react-native";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
// Picker is no longer used
import HeaderComp from "../components/HeaderComp";
import { charityNames } from "../globals/constants"; // Adjusted import path
import colors from "../globals/colors";
import AutocompleteDropdownComp from "../components/AutocompleteDropdownComp"; // Corrected component import

const options = [
  "הוראות קבע",
  "היסטוריה",
  "הטבות",
  "הגשת בקשה",
  "אשראי",
  "אפשרות 6",
  "אפשרות 7",
  "אפשרות 8",
  "אפשרות 9",
  "אפשרות 10",
  "אפשרות 11",
  "אפשרות 12",
];

export default function MoneyScreen({
  navigation,
}: {
  navigation: NavigationProp<ParamListBase>;
}) {
  const [selectedRecipient, setSelectedRecipient] = useState<string>("");
  const [selectedAmount, setSelectedAmount] = useState<string>("");
  const [mode, setMode] = useState<"מחפש" | "מציע">("מחפש");

  const amountOptions = ["₪111", "₪50", "₪100", "₪500", "₪1000", "₪2000"];

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
    setMode((prev) => (prev === "מחפש" ? "מציע" : "מציע")); // Changed default to 'מציע' as you had it previously
  };

  // Content that will always appear at the top of the scrollable area
  //  const ListHeader = () => (
  //  );

  // Data for the FlatList's main content (can be simplified if only one section remains)
  const mainContentData = [
    {
      id: "all_section",
      title: "הכל:",
      items: [
        "האגודה למלחמה בסרטן",
        "לתת",
        "לתת",
        "יד שרה",
        "מגן דוד אדום",
        "קרן לבריאות הילד",
        "המרכז לזקן",
      ],
    },
  ];

  return (
    <SafeAreaView style={localStyles.safeArea}>
      <View style={localStyles.wrapper}>
        <HeaderComp
          mode={mode}
          menuOptions={options}
          onToggleMode={toggleMode}
          onSelectMenuItem={handleSelectMenuItem}
        />

        {/* Changed to FlatList for the main scrollable content */}
        <FlatList
          nestedScrollEnabled={true}
          data={mainContentData} // Data for the main FlatList (the "All" section)
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={localStyles.section}>
              <View>
                {/* Dropdowns */}
                <View style={localStyles.dropdownContainer1}>
                  <AutocompleteDropdownComp
                    label="למי ?"
                    selectedValue={selectedRecipient}
                    onValueChange={(val) => setSelectedRecipient(val)}
                    options={charityNames}
                  />
                </View>
                <View style={localStyles.dropdownContainer2}>
                  <AutocompleteDropdownComp
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

                {/* Recommended Section */}
                <View style={localStyles.section}>
                  <Text style={localStyles.sectionTitle}>מומלצים:</Text>
                  {/* Horizontal ScrollView for Recommended Cards */}
                  <ScrollView
                    horizontal={true}
                    style={localStyles.cardListScrollView}
                    showsHorizontalScrollIndicator={false}
                  >
                    {[1, 2, 3, 4, 5].map((_, i) => (
                      <View style={localStyles.card} key={`rec-${i}`}>
                        <Image
                          source={{ uri: "https://via.placeholder.com/50" }}
                          style={localStyles.cardImage}
                        />
                        <View style={localStyles.cardContent}>
                          <Text style={localStyles.cardTitle}>
                            JGive {i + 1}
                          </Text>
                          <Text style={localStyles.cardDescription}>
                            אצלנו התרומה שלך שווה יותר
                          </Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>

                {/* Separator if needed before "All" section */}
                {/* <View style={{ height: 20 }} /> */}
              </View>

              <Text style={localStyles.sectionTitle}>{item.title}</Text>
              {/* Horizontal ScrollView for All Cards */}
              <ScrollView
                horizontal={true}
                style={localStyles.cardListScrollView}
                showsHorizontalScrollIndicator={false}
              >
                {item.items.map((title, idx) => (
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
              </ScrollView>
            </View>
          )}
          // ListHeaderComponent={ListHeader} // All content above "All" section
          // You can also add ListFooterComponent if you have content below the main list
          showsVerticalScrollIndicator={false} // Hide main scrollbar
          contentContainerStyle={localStyles.flatListContentContainer} // Apply padding here
          keyboardShouldPersistTaps="always" // Still useful for nested TextInput interactions
        />
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
  },
  // Removed scrollViewBase as FlatList replaces it
  flatListContentContainer: {
    paddingHorizontal: 16, // Apply horizontal padding here
    paddingTop: 12, // Add some padding below the header
    paddingBottom: 24, // Add padding at the bottom
  },
  donateButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
    alignSelf: "center",
  },
  donateButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  filterButtonsContainer: {
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 10,
    paddingHorizontal: 5, // Padding inside the horizontal scroll
  },
  filterButton: {
    backgroundColor: colors.mediumOrange,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    flexShrink: 0,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.darkGray,
  },
  section: {
    marginTop: 20,
    // flex: 1, // Remove flex:1 if it was causing issues with FlatList item sizing
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
  },
  filterScrollView: {
    maxHeight: Platform.select({
      ios: 80,
      android: 100,
      web: 80,
      default: 80,
    }),
    paddingVertical: 10,
    marginBottom: 20,
  },
  cardListScrollView: {
    height: 200,
    maxHeight: 200,
    paddingVertical: 10,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 30,
    marginHorizontal: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 12,
    alignItems: "center",
    width: 280,
    flexShrink: 0,
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
  dropdownContainer1: {
    marginBottom: 12,
    zIndex: 12, // Needs to be higher than other elements that might overlap
  },
  dropdownContainer2: {
    marginBottom: 24,
    zIndex: 11, // Needs to be higher than other elements that might overlap, but lower than dropdown1
  },
});
