import styles from "../globals/styles";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { View, TouchableOpacity, Text, ScrollView, StyleSheet,} from "react-native";
import colors from "../globals/colors";

export default function DonationsScreen({
  navigation,
}: {
  navigation: NavigationProp<ParamListBase>;
}) {
  return (
    <View style={localStyles.container}>
      {/* Recent Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>מומלצים בשבילך</Text>
        <View style={styles.recentButtonsContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('MoneyScreen')} style={styles.recentButton}>
            <Text style={styles.recentButtonText}>כסף</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('TrumpScreen')} style={styles.recentButton}>
            <Text style={styles.recentButtonText}>טרמפים</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.recentButton}>
            <Text style={styles.recentButtonText}>אוכל</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* All Categories Section */}
      <Text style={styles.sectionTitle}>הכל</Text>
      <ScrollView style={styles.scrollView}>
        <View style={styles.sectionContainer}>
          <View style={styles.allCategoriesGrid}>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>תחבורה</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>תחבורה</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>תחבורה</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>תחבורה</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>תחבורה</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>שיעורים פרטיים</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>הספרייה</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>חפצים</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>חיות</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>בגדים</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>דיור</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>רפואה</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>משפחה</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>תמיכה</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>מלונות</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>שאריות</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>תחבורה</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>תחבורה</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>תחבורה</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>תחבורה</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}


const localStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFEDD5",
    alignItems: 'center', // Center content horizontally
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: colors.lightOrange,
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
});