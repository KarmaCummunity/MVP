import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  Linking,
  Alert,
  Image,
  ImageSourcePropType,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import HeaderComp from "../components/HeaderComp";
import {
  filter_for_trumps,
  menu_for_trumps,
  sentences,
  WHATSAPP_GROUP_DETAILS,
} from "../globals/constants";
import AutocompleteDropdownComp from "../components/AutocompleteDropdownComp"; // Corrected component import
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import LocationSearchComp from "../components/LocationSearchComp";
import TimeInput from "../components/TimeInput";
import styles from "../globals/styles";
// Define your WhatsApp group links WITH their names
// IMPORTANT: Replace "Name of Group 1", "Name of Group 2", etc., with the actual names you want to display.

const searchResults = [];
interface WhatsAppGroup {
  name: string;
  link: string;
  image: ImageSourcePropType;
}
interface Filters {
  to: string;
  from: string;
  when: string;
}

export default function TrumpScreen({
  navigation,
}: {
  navigation: NavigationProp<ParamListBase>;
}) {
  const [filters, setFilters] = useState<Filters>({
    to: "",
    from: "",
    when: "",
  });
  const [mode, setMode] = useState<boolean>(false); // false for "מחפש", true for "מציע"
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());

  const handleSelectMenuItem = (option: string) => {
    alert(`Selected: ${option}`);
  };

  const handleDropdownChange = (field: keyof Filters, value: string): void => {
    // console.log(`Dropdown changed: ${field} = ${value}`);
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const toggleMode = (): void => {
    // console.log("Toggling mode" + mode);
    setMode((prev) => (prev ? false : true));
  };

  // Function to open WhatsApp group link
  const handleOpenWhatsAppGroup = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          "שגיאה",
          `לא ניתן לפתוח את הקישור: ${url}. אנא וודא שאפליקציית ווטסאפ מותקנת.`
        );
      }
    } catch (error) {
      console.error("Failed to open WhatsApp URL:", error);
      Alert.alert("שגיאה", "אירעה שגיאה בעת ניסיון לפתוח את הקישור.");
    }
  };

  return (
    <SafeAreaView style={localStyles.safeArea}>
      <View style={localStyles.wrapper}>
        <HeaderComp
          mode={mode}
          menuOptions={menu_for_trumps}
          onToggleMode={toggleMode}
          onSelectMenuItem={handleSelectMenuItem}
        />
        <ScrollView
          contentContainerStyle={localStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={localStyles.rowContainer}>
            <Text style={localStyles.search_Text}>מאיפה?</Text>
            <LocationSearchComp
              onLocationSelected={(location) =>
                handleDropdownChange("from", location)
              }
            />
          </View>

          <View style={localStyles.rowContainer}>
            <Text style={localStyles.search_Text}>לאיפה?</Text>
            <LocationSearchComp
              onLocationSelected={(location) =>
                handleDropdownChange("to", location)
              }
            />
          </View>
          <View style={localStyles.rowContainerTime}>
            <Text style={localStyles.search_Text}>מתי?</Text>

            <TimeInput
              value={selectedTime}
              onChange={(date) => {
                // console.log("Selected time:", date);
                setSelectedTime(date);
              }}
            />
          </View>

          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "Searching",
                `יציאה מ: ${
                  filters.from || "לא צוין"
                } \nבשעה:  ${selectedTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })} \nליעד: ${filters.to || "לא צוין"}`
              )
            }
            style={styles.button}
          >
            <Text style={localStyles.donateButtonText}>
              {mode ? "פרסם" : "חפש"}
            </Text>
          </TouchableOpacity>

          {/* Results */}
          {searchResults.length > 0 && (
            <View>
              <Text style={localStyles.sectionTitle}>טרמפים :</Text>
              <View style={localStyles.trumpCard}>
                <Text style={localStyles.trumpCardTitle}>נועם סרוסי</Text>
                <Text>מ: יאשיהו ל׳ הרכבת</Text>
                <Text>ב: 02/01/2023 - 15:30</Text>
              </View>
              <View style={localStyles.trumpCard}>
                <Text style={localStyles.trumpCardTitle}>נועם סרוסי</Text>
                <Text>מ: שטרן 29, הרכבת לתל אביב</Text>
                <Text>ב: היום - 15:30</Text>
              </View>
            </View>
          )}

          {/* Groups */}
          {!mode && (
            <View>
              <Text style={localStyles.sectionTitle}>קבוצות:</Text>
              {/* Loop through your WhatsApp group details */}
              {WHATSAPP_GROUP_DETAILS.map(
                (
                  group,
                  idx // Changed to 'group' object
                ) => (
                  <TouchableOpacity
                    key={idx}
                    style={localStyles.trumpCard}
                    onPress={() => handleOpenWhatsAppGroup(group.link)} // Use group.link
                  >
                    <View style={localStyles.groupCardContentWrapper}>
                      <Image
                        source={group.image} // Use the image source from the group details
                        style={localStyles.groupCardImage}
                      />
                      <View style={localStyles.groupCardTextContent}>
                        {/* Wrapper for text content */}
                        <Text style={localStyles.trumpCardSubtitle}>
                          {group.name} {/* Use group.name for the title */}
                        </Text>
                        <Text style={localStyles.trumpCardText}>
                          תיאור הקבוצה
                        </Text>
                        {/* <Text style={localStyles.trumpCardLinkText}>
                      {group.link.substring(0, 40)}...
                    </Text> */}
                      </View>
                    </View>
                  </TouchableOpacity>
                )
              )}
            </View>
          )}
          {mode && (
            <View>
              <Text style={localStyles.sentences}>אנו מודים לך על תרומתך</Text>
              <Text style={localStyles.sentences}> ויותר מזה על השתתפותך בקהילה!</Text>
            </View>
          )}
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
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  rowContainer: {
    flexDirection: "row-reverse", // Use 'row-reverse' for RTL layout
    alignItems: "flex-start", // Aligns items vertically in the center of the row
    justifyContent: "space-between", // Aligns items to the right (since Hebrew is RTL)
    // marginBottom: 10, // Add some spacing below the row if needed
    // You might need to adjust width or padding depending on surrounding elements
  },
  rowContainerTime: {
    marginLeft: "40%", // Add some spacing to the left for better alignment
    flexDirection: "row-reverse", // Use 'row-reverse' for RTL layout
    alignItems: "flex-start", // Aligns items vertically in the center of the row
    justifyContent: "space-between", // Aligns items to the right (since Hebrew is RTL)
    marginBottom: 10, // Add some spacing below the row if needed
    // You might need to adjust width or padding depending on surrounding elements
  },
  scrollContent: {
    paddingBottom: 24,
    paddingTop: 12,
    paddingHorizontal: 16,
    // alignItems: "center",
    justifyContent: "center",
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
  search_Text: {
    fontWeight: "bold",
    fontSize: 18,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginVertical: 10,
    alignSelf: "flex-end",
  },
  sentences: {

    fontWeight: "bold",
    fontSize: 20,
    marginTop: 20,
    alignSelf: "center",
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
    alignItems: "flex-end",
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
    textAlign: "right", // Align text to the right
  },
  trumpCardSubtitle: {
    fontWeight: "600",
    fontSize: 15,
    textAlign: "right", // Align text to the right
  },
  trumpCardText: {
    textAlign: "right", // Align text to the right
    fontSize: 13,
    color: "#6B7280",
  },
  trumpCardLinkText: {
    fontSize: 11,
    color: "#007BFF",
    marginTop: 4,
  },
  groupCardContentWrapper: {
    flex: 1,
    // gap: 100,
    justifyContent: "space-between",
    flexDirection: "row", // Arrange image and text horizontally
    alignItems: "stretch", // Vertically align items in the center
    // padding: 12, // Apply padding here for inner content spacing
  },
  groupCardImage: {
    width: 48, // Adjust size as needed
    height: 48, // Adjust size as needed
    borderRadius: 24, // Half of width/height to make it circular
    marginRight: 12, // Space between image and text
    backgroundColor: "#eee", // Placeholder background
  },
  groupCardTextContent: {
    textAlign: "right", // Align text to the right
    justifyContent: "space-between",
    flex: 1, // Allow text content to take remaining horizontal space
  },
});
