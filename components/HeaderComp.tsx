import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import SearchBar from "../components/SearchBar";
import MenuComp from "../components/MenuComp";
import ModeToggleButton from "../components/ModeToggleButton";
import colors from "../globals/colors";
import { FontSizes } from "../globals/constants";

interface HeaderSectionProps {
  mode: boolean;  // false = search, true = offer
  menuOptions: string[];
  onToggleMode: () => void;
  onSelectMenuItem: (option: string) => void;
  title?: string; // Optional title for the screen
  placeholder?: string;
}

const HeaderComp: React.FC<HeaderSectionProps> = ({
  mode,
  menuOptions,
  onToggleMode,
  onSelectMenuItem,
  placeholder,
}) => {
 
  return (
    <View style={headerStyles.headerContainer}>
      <View style={headerStyles.topRow}>
        <ModeToggleButton mode={mode} onToggle={onToggleMode} />
        <MenuComp options={menuOptions} onSelectOption={onSelectMenuItem} />
      </View>
      <SearchBar placeholder={placeholder} />
    </View>
  );
};

const headerStyles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    backgroundColor: colors.moneyFormBackground,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.headerBorder,
    paddingBottom: 8,
    marginHorizontal: 10,
    borderRadius: 30,
    marginTop: 10,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  screenTitle: {
    fontSize: FontSizes.body,
    fontWeight: 'bold',
    color: colors.headerTitleText,
    textAlign: 'center',
    flex: 1,
  },
});

export default HeaderComp;