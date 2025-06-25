// import styles from "../navigations/styles";
// import TopBarNavigator from "../navigations/TopBarNavigator";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { View, TouchableOpacity, Text } from "react-native";
// import { NavigationProp, ParamListBase } from "@react-navigation/native";

// export default function SearchScreen({
//   navigation,
// }: {
//   navigation: NavigationProp<ParamListBase>;
// }) {
//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.content}>
//         <TouchableOpacity
//           onPress={() => navigation.navigate("FirstScreen")}
//           style={styles.button}
//         >
//           <Text style={styles.buttonText}>
//             {"Go to First\nthis is search page"}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import SearchBar from '../components/SearchBar'; // Update path as needed

const SearchScreen = () => {
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const recommendedOptions = ['פעילויות קרובות', 'חדש בקהילה', 'פופולרי השבוע'];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Replace this with actual search logic
    const mockResults = [
      `${query} תוצאה 1`,
      `${query} תוצאה 2`,
      `${query} תוצאה 3`,
    ];
    setSearchResults(mockResults);
  };

  return (
    <ScrollView contentContainerStyle={local_Styles.container}>
      <SearchBar  />
    <View style={{ padding: 20, marginBottom: 20 }}>
      <Text style={local_Styles.sectionTitle}>אפשרויות מומלצות</Text>
      {recommendedOptions.map((option, index) => (
        <Text key={index} style={local_Styles.recommendation}>
          • {option}
        </Text>
      ))}

      {searchResults.length > 0 && (
        <>
          <Text style={local_Styles.sectionTitle}>תוצאות עבור: {searchQuery}</Text>
          {searchResults.map((result, index) => (
            <Text key={index} style={local_Styles.resultItem}>
              🔍 {result}
            </Text>
          ))}
        </>
      )}
      </View>
    </ScrollView>
  );
};

const local_Styles = StyleSheet.create({
  container: {
    // padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'right',
  },
  recommendation: {
    fontSize: 16,
    textAlign: 'right',
    marginTop: 5,
  },
  resultItem: {
    fontSize: 16,
    textAlign: 'right',
    marginTop: 10,
  },
});

export default SearchScreen;
