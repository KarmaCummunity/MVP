import React from "react";
import { Ionicons } from "@expo/vector-icons"; // Assuming you are using Expo for vector icons
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import TopBarNavigator from "../navigations/TopBarNavigator";
import styles from "../navigations/styles";

interface TopBarNavigatorProps {
  navigation: NavigationProp<ParamListBase>;
  title: string;
}

export default function MoneyScreen({ navigation,}: { navigation: NavigationProp<ParamListBase>; }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Search/Filter Bar */}
          <View style={styles.searchFilterContainer}>
            <Ionicons name="menu" size={24} color="black" />
            <View style={styles.searchBox}>
              <Text style={styles.searchText}>מציע מחפש</Text>
            </View>
            <View style={styles.searchInputs}>
              <TextInput style={styles.searchInput} placeholder="סימן" />
              <TextInput style={styles.searchInput} placeholder="מין" />
              <TouchableOpacity style={styles.searchIcon}>
                <Ionicons name="search" size={20} color="gray" />
              </TouchableOpacity>
            </View>
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
              {/* You'd replace this with actual images/logos */}
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
      </View>
    </SafeAreaView>
  );
}
