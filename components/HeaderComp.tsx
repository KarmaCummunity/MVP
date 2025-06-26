import React, { useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import SearchBar from "../components/SearchBar"; // Ensure this path is correct
import MenuComp from "../components/MenuComp"; // Ensure this path is correct
import ModeToggleButton from "../components/ModeToggleButton"; // Ensure this path is correct

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
    <View style={[
      headerStyles.headerContainer,
    ]}>
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
    paddingTop: 10,
    backgroundColor: 'transparent',
    marginBottom: 10,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default HeaderComp;