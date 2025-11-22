import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import SearchBar from "../components/SearchBar";
import MenuComp from "../components/MenuComp";
import ModeToggleButton from "../components/ModeToggleButton";
import GuestModeNotice from "../components/GuestModeNotice";
import colors from "../globals/colors";
import { getScreenInfo, scaleSize, rowDirection, responsiveSpacing, responsiveFontSize, BREAKPOINTS } from "../globals/responsive";
import { FontSizes } from "../globals/constants";
import { useUser } from "../stores/userStore";

// TODO: Add comprehensive TypeScript interfaces for all props instead of loose types
// TODO: Implement proper component composition instead of props drilling
// TODO: Add comprehensive accessibility support (roles, labels, hints)
// TODO: Implement proper responsive design for different screen sizes
// TODO: Add comprehensive error handling for search operations
// TODO: Extract search logic to custom hook (useHeaderSearch)
// TODO: Add proper memoization with React.memo for performance
// TODO: Implement proper theming system integration
// TODO: Add comprehensive unit tests for all component functionality
// TODO: Remove hardcoded styles and use theme system consistently

// TODO: Create proper TypeScript interfaces in separate types file
// TODO: Add JSDoc documentation for all interface properties
// TODO: Replace 'any[]' with proper generic types
// TODO: Add validation for required vs optional props
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
  searchData: any[]; // Data array to search through (charities, rides, etc.) - TODO: Replace any[] with proper types
  onSearch: (query: string, filters?: string[], sorts?: string[], results?: any[]) => void; // Search handler function - TODO: Improve typing
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
 
  const { isTablet, isDesktop, isLargeDesktop, width } = getScreenInfo();
  const isDesktopWeb = Platform.OS === 'web' && width > BREAKPOINTS.TABLET;
  const horizontalPadding = isLargeDesktop ? 32 : isDesktopWeb ? 24 : isTablet ? 20 : 16;
  const containerRadius = isLargeDesktop ? 28 : isDesktopWeb ? 24 : isTablet ? 22 : 30;
  const verticalPadding = isLargeDesktop ? 16 : isDesktopWeb ? 14 : isTablet ? 12 : 10;
  const marginHorizontal = isLargeDesktop ? 20 : isDesktopWeb ? 16 : isTablet ? 14 : 10;
  
  return (
    <View style={[
      headerStyles.headerContainer,
      {
        paddingHorizontal: horizontalPadding,
        paddingVertical: verticalPadding,
        borderRadius: containerRadius,
        marginHorizontal: marginHorizontal,
      }
    ]}>
      {/* מציג את הבאנר במצב אורח אם המשתמש במצב אורח */}
      {isGuestMode && (
        <GuestModeNotice variant="compact" showLoginButton={true} />
      )}

      <View style={[headerStyles.topRow, { flexDirection: rowDirection('row') }]}>
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
    backgroundColor: colors.moneyFormBackground,
    marginBottom: responsiveSpacing(5, 6, 7),
    borderBottomWidth: 1,
    borderBottomColor: colors.headerBorder,
    paddingBottom: responsiveSpacing(8, 10, 12),
    marginTop: responsiveSpacing(10, 12, 14),
    // Dynamic styles applied in JSX for responsive padding and radius
  },
  topRow: {
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: responsiveSpacing(6, 8, 10),
  },
  screenTitle: {
    fontSize: responsiveFontSize(FontSizes.body, 17, 19),
    fontWeight: 'bold',
    color: colors.headerTitleText,
    textAlign: 'center',
    flex: 1,
  },
});

export default HeaderComp;