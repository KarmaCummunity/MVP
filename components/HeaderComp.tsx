import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import SearchBar from "../components/SearchBar";
import MenuComp from "../components/MenuComp";
import ModeToggleButton from "../components/ModeToggleButton";
import Colors from "../globals/Colors";
interface HeaderSectionProps {
  mode: "מחפש" | "מציע";
  menuOptions: string[];
  onToggleMode: () => void;
  onSelectMenuItem: (option: string) => void;
}

const HeaderComp: React.FC<HeaderSectionProps> = ({
  mode,
  menuOptions,
  onToggleMode,
  onSelectMenuItem,
}) => {
  return (
    <View style={headerStyles.headerContainer}>
      <View style={headerStyles.topRow}>
        <ModeToggleButton mode={mode} onToggle={onToggleMode} />
        <MenuComp options={menuOptions} onSelectOption={onSelectMenuItem} />
      </View>
      <SearchBar />
    </View>
  );
};

const headerStyles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 5,
    paddingTop: 12,
    // Set a consistent paddingBottom for all platforms
    paddingBottom: Platform.select({
      ios: 80,       // For iOS
      android: 140,    // For Android
      web: 0,         // For Web
      default: 80,    // Fallback for any other platform
    }),
    backgroundColor: 'transparent',
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // marginBottom: 1,
  },
});

export default HeaderComp;