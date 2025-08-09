import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import SearchBar from "../components/SearchBar";
import MenuComp from "../components/MenuComp";
import ModeToggleButton from "../components/ModeToggleButton";
import GuestModeNotice from "../components/GuestModeNotice";
import colors from "../globals/colors";
import { FontSizes } from "../globals/constants";
import { useUser } from "../context/UserContext";

interface HeaderSectionProps {
  mode: boolean;  // false = search, true = offer
  menuOptions: string[];
  onToggleMode: () => void;
  onSelectMenuItem: (option: string) => void;
  title?: string; // Optional title for the screen
  placeholder?: string;
  // New props for search functionality
  filterOptions: string[]; // Filter options specific to each screen
  sortOptions: string[]; // Sort options specific to each screen
  searchData: any[]; // Data array to search through (charities, rides, etc.)
  onSearch: (query: string, filters?: string[], sorts?: string[], results?: any[]) => void; // Search handler function
}

const HeaderComp: React.FC<HeaderSectionProps> = ({
  mode,
  menuOptions,
  onToggleMode,
  onSelectMenuItem,
  placeholder,
  filterOptions,
  sortOptions,
  searchData,
  onSearch,
}) => {
  const { isGuestMode } = useUser();
 
  return (
    <View style={headerStyles.headerContainer}>
      {/* מציג את הבאנר במצב אורח אם המשתמש במצב אורח */}
      {isGuestMode && (
        <GuestModeNotice variant="compact" showLoginButton={true} />
      )}

      <View style={headerStyles.topRow}>
        <MenuComp options={menuOptions} onSelectOption={onSelectMenuItem} />
        <ModeToggleButton mode={mode} onToggle={onToggleMode} />
      </View>
      <SearchBar 
        placeholder={placeholder}
        filterOptions={filterOptions}
        sortOptions={sortOptions}
        searchData={searchData}
        onSearch={onSearch}
      />
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