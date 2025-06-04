import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  LayoutRectangle,
  findNodeHandle,
  UIManager,
  Modal,
  FlatList, // Import FlatList
  Alert, // Import Alert for the donate button action
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import styles from "../globals/styles";
import SearchBar from "../components/SearchBar";
import MenuComp from "../components/MenuComp";
import { charityNames } from "../globals/constant"; // Assuming charityNames is a long list

export default function MoneyScreen({
  navigation,
}: {
  navigation: NavigationProp<ParamListBase>;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isRecipientDropdownOpen, setRecipientDropdownOpen] = useState<boolean>(false);
  const [isAmountDropdownOpen, setAmountDropdownOpen] = useState<boolean>(false);
  const [selectedRecipient, setSelectedRecipient] = useState<string>("בחר נמען");
  const [selectedAmount, setSelectedAmount] = useState<string>("בחר סכום");

  // Dropdown options for amount (recipient options come from charityNames)
  const amountOptions = ["₪10", "₪50", "₪100", "₪500", "₪1000", "₪2000"]; // Added more for scroll demo

  // Refs and layout for the menu icon position
  const menuIconRef = useRef<View>(null);

  const [menuIconPosition, setMenuIconPosition] = useState<LayoutRectangle>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const openMenu = () => {
    const handle = findNodeHandle(menuIconRef.current);
    if (handle) {
      UIManager.measure(
        handle,
        (x, y, width, height, pageX, pageY) => {
          setMenuIconPosition({ x: pageX, y: pageY, width, height });
          setIsMenuOpen(true);
        }
      );
    }
  };

  const closeMenu = () => setIsMenuOpen(false);

  const handleSelectMenuItem = (option: string) => {
    Alert.alert(`Selected: ${option}`);
    closeMenu();
  };

  const handleDonate = () => {
    if (selectedRecipient === "בחר נמען" || selectedAmount === "בחר סכום") {
      Alert.alert("שגיאה", "אנא בחר נמען וסכום לפני התרומה.");
    } else {
      Alert.alert(
        "תרומה בוצעה",
        `תודה על תרומתך ${selectedAmount} ל-${selectedRecipient}!`
      );
      // Here you would typically integrate with a payment gateway
    }
  };

  const renderDropdownItem = ({ item, onPress }: { item: string; onPress: (item: string) => void }) => (
    <TouchableOpacity
      style={localStyles.dropdownOption}
      onPress={() => onPress(item)}
    >
      <Text style={localStyles.dropdownOptionText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={localStyles.mainContentContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header: Menu icon + Search bar */}
          <View style={localStyles.headerSection}>
            <TouchableOpacity
              onPress={openMenu}
              style={localStyles.menuIconPlacement}
              ref={menuIconRef}
            >
              <Ionicons name="menu" size={24} color="black" />
            </TouchableOpacity>
            <SearchBar />
          </View>

          {/* Filter Buttons */}
          <View style={styles.filterButtonsContainer}>
            {["הטבות", "אמצעי תשלום", "ילדים", "קרוב אליי"].map((label) => (
              <TouchableOpacity key={label} style={styles.filterButton}>
                <Text style={styles.filterButtonText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Input Fields with Dropdowns */}
          <View style={styles.inputSection}>
            {/* Recipient Dropdown */}
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>למי ?</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setRecipientDropdownOpen(!isRecipientDropdownOpen)}
              >
                <Text style={styles.dropdown}>{selectedRecipient}</Text>
                <Ionicons name="chevron-down" size={20} color="black" />
              </TouchableOpacity>
            </View>

            {/* Amount Dropdown */}
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>כמה ?</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setAmountDropdownOpen(!isAmountDropdownOpen)}
              >
                <Text style={styles.dropdown}>{selectedAmount}</Text>
                <Ionicons name="chevron-down" size={20} color="black" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Dropdown Modals */}
          <Modal visible={isRecipientDropdownOpen} transparent animationType="fade">
            <TouchableOpacity style={localStyles.modalOverlay} onPress={() => setRecipientDropdownOpen(false)}>
              <View style={localStyles.dropdownModal}>
                <FlatList
                  data={charityNames}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) =>
                    renderDropdownItem({
                      item,
                      onPress: (option) => {
                        setSelectedRecipient(option);
                        setRecipientDropdownOpen(false);
                      },
                    })
                  }
                  // Optional: to limit height and ensure scrollability
                  style={{ maxHeight: 200 }}
                />
              </View>
            </TouchableOpacity>
          </Modal>

          <Modal visible={isAmountDropdownOpen} transparent animationType="fade">
            <TouchableOpacity style={localStyles.modalOverlay} onPress={() => setAmountDropdownOpen(false)}>
              <View style={localStyles.dropdownModal}>
                <FlatList
                  data={amountOptions}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) =>
                    renderDropdownItem({
                      item,
                      onPress: (option) => {
                        setSelectedAmount(option);
                        setAmountDropdownOpen(false);
                      },
                    })
                  }
                  // Optional: to limit height and ensure scrollability
                  style={{ maxHeight: 200 }}
                />
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Donate Button */}
          <TouchableOpacity style={localStyles.donateButton} onPress={handleDonate}>
            <Text style={localStyles.donateButtonText}>תרום</Text>
          </TouchableOpacity>

          {/* Recommended Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>מומלצים:</Text>
            {[1, 2].map((_, i) => (
              <View style={styles.card} key={`rec-${i}`}>
                <Image source={{ uri: "https://via.placeholder.com/50" }} style={styles.cardImage} />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>JGive</Text>
                  <Text style={styles.cardDescription}>אצלנו התרומה שלך שווה יותר</Text>
                </View>
              </View>
            ))}
          </View>

          {/* All Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>הכל:</Text>
            {["האגודה למלחמה בסרטן", "לתת", "לתת"].map((title, idx) => (
              <View style={styles.card} key={`all-${idx}`}>
                <Image source={{ uri: "https://via.placeholder.com/50" }} style={styles.cardImage} />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{title}</Text>
                  <Text style={styles.cardDescription}>סיוע הומניטרי ישראלי</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Popup Menu Component */}
        <MenuComp
          isVisible={isMenuOpen}
          onClose={closeMenu}
          options={[
            "הוראות קבע",
            "היסטוריה",
            "הטבות",
            "הגשת בקשה",
            "אפשרות 5",
            "אפשרות 6",
            "אפשרות 7",
            "אפשרות 8",
            "אפשרות 9",
            "אפשרות 10",
            "אפשרות 11",
            "אפשרות 12",
          ]}
          onSelectOption={handleSelectMenuItem}
          anchorPosition={menuIconPosition}
        />
      </View>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  mainContentContainer: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: 15,
    paddingTop: 10,
    alignItems: "flex-end",
  },
  menuIconPlacement: {
    padding: 10,
    marginBottom: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownModal: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    width: "80%",
    // maxHeight added to limit height and ensure scrollability for FlatList
    maxHeight: 250, // You can adjust this value
  },
  dropdownOption: {
    paddingVertical: 10,
    // borderBottomWidth: 1, // Only if you want dividers between items
    // borderColor: "#ddd",
  },
  dropdownOptionText: {
    fontSize: 16,
  },
  donateButton: {
    backgroundColor: "#007BFF", // Example blue color
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
});