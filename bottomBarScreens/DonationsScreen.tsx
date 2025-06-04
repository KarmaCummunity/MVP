import styles from "../navigations/styles";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { View, TouchableOpacity, Text, ScrollView, Dimensions,} from "react-native";


export default function DonationsScreen({
  navigation,
}: {
  navigation: NavigationProp<ParamListBase>;
}) {
  return (
    <View style={styles.container}>
      {/* Recent Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>מומלצים בשבילך</Text>
        <View style={styles.recentButtonsContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('MoneyScreen')} style={styles.recentButton}>
            <Text style={styles.recentButtonText}>כסף</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.recentButton}>
            <Text style={styles.recentButtonText}>זמן</Text>
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