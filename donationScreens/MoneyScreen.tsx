import React, { useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView, // Import ScrollView
  TouchableOpacity,
  Image,
  Modal,
  Animated,
} from "react-native";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import styles from "../navigations/styles";
import SearchBar from "./SearchBar";


export default function MoneyScreen({ navigation }: { navigation: NavigationProp<ParamListBase> }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuOptions = [
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
  ];

  const menuIconRef = useRef(null);
  const [menuIconPosition, setMenuIconPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const scaleAnim = useRef(new Animated.Value(0.01)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const openMenu = () => {
    menuIconRef.current.measure((fx, fy, width, height, px, py) => {
      setMenuIconPosition({ x: px, y: py, width: width, height: height });
      setIsMenuOpen(true);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.01,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsMenuOpen(false);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={localStyles.mainContentContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Top Section: Menu Icon at top-right, SearchBar below it */}
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
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterButtonText}>הטבות</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterButtonText}>אמצעי תשלום</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterButtonText}>ילדים</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterButtonText}>קרוב אליי</Text>
            </TouchableOpacity>
          </View>

          {/* Input Fields */}
          <View style={styles.inputSection}>
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>למי ?</Text>
              <View style={styles.dropdown}>
                <Ionicons name="chevron-down" size={20} color="black" />
              </View>
            </View>
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>כמה ?</Text>
              <View style={styles.dropdown}>
                <Ionicons name="chevron-down" size={20} color="black" />
              </View>
            </View>
          </View>

          {/* Recommended Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>מומלצים:</Text>
            <View style={styles.card}>
              <Image
                source={{ uri: "https://via.placeholder.com/50" }}
                style={styles.cardImage}
              />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>JGive</Text>
                <Text style={styles.cardDescription}>
                  אצלנו התרומה שלך שווה יותר
                </Text>
              </View>
            </View>
            <View style={styles.card}>
              <Image
                source={{ uri: "https://via.placeholder.com/50" }}
                style={styles.cardImage}
              />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>JGive</Text>
                <Text style={styles.cardDescription}>
                  אצלנו התרומה שלך שווה יותר
                </Text>
              </View>
            </View>
          </View>

          {/* All Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>הכל:</Text>
            <View style={styles.card}>
              <Image
                source={{ uri: "https://via.placeholder.com/50" }}
                style={styles.cardImage}
              />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>האגודה למלחמה בסרטן</Text>
                <Text style={styles.cardDescription}>
                  אצלנו התרומה שלך שווה יותר
                </Text>
              </View>
            </View>
            <View style={styles.card}>
              <Image
                source={{ uri: "https://via.placeholder.com/50" }}
                style={styles.cardImage}
              />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>לתת</Text>
                <Text style={styles.cardDescription}>סיוע הומניטרי ישראלי</Text>
              </View>
            </View>
            <View style={styles.card}>
              <Image
                source={{ uri: "https://via.placeholder.com/50" }}
                style={styles.cardImage}
              />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>לתת</Text>
                <Text style={styles.cardDescription}>סיוע הומניטרי ישראלי</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Menu Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isMenuOpen}
          onRequestClose={closeMenu}
        >
          <TouchableOpacity
            style={localStyles.modalOverlay}
            activeOpacity={1}
            onPressOut={closeMenu}
          >
            <Animated.View
              style={[
                localStyles.modalContent,
                {
                  opacity: opacityAnim,
                  transform: [{ scale: scaleAnim }],
                  top: menuIconPosition.y + menuIconPosition.height / 2,
                  right: 0,
                },
              ]}
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                {" "}
                {/* Added ScrollView here */}
                {menuOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      localStyles.menuOption,
                      index === menuOptions.length - 1 && {
                        borderBottomWidth: 0,
                      }, // Remove border from last item
                    ]}
                    onPress={() => {
                      alert(`Selected: ${option}`);
                      closeMenu();
                    }}
                  >
                    <Text style={localStyles.menuOptionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    position: "absolute",
    minWidth: 180,
    maxHeight: 250, // Set a fixed maxHeight for the menu
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingVertical: 10, // Add vertical padding to the content itself, not individual items
  },
  menuOption: {
    paddingHorizontal: 20, // Add horizontal padding for consistency
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    width: "100%",
    alignSelf: "flex-end",
  },
  menuOptionText: {
    fontSize: 16,
    textAlign: "right",
    writingDirection: "rtl",
  },
});
