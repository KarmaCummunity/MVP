import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native"; // Import Platform
import SearchBar from "../components/SearchBar";
import MenuComp from "../components/MenuComp";
import ModeToggleButton from "../components/ModeToggleButton";
// import styles from "../globals/styles"; // If you have global styles, ensure they don't conflict

interface HeaderSectionProps {
  mode: "מחפש" | "מציע";
  onToggleMode: () => void;
  onSelectMenuItem: (option: string) => void;
}

const HeaderComp: React.FC<HeaderSectionProps> = ({
  mode,
  onToggleMode,
  onSelectMenuItem,
}) => {
  return (
    <View style={headerStyles.headerContainer}>
      <View style={headerStyles.topRow}>
        <ModeToggleButton mode={mode} onToggle={onToggleMode} />
        <MenuComp
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
          onSelectOption={onSelectMenuItem}
        />
      </View>
      <SearchBar />
    </View>
  );
};

const headerStyles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    // Use Platform.select to apply different values based on the platform
    paddingBottom: Platform.select({
      ios: 80,       // For iOS
      android: 80,    // For Android
      web: 0,         // For Web
      default: 80,    // Fallback for any other platform
    }),
    backgroundColor: "#FFEDD5",
    // You might want a subtle border or shadow here
    // borderBottomWidth: 1,
    // borderBottomColor: '#E0E0E0',
    // elevation: 3, // For Android shadow
    // shadowColor: '#000', // For iOS shadow
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
});

export default HeaderComp;