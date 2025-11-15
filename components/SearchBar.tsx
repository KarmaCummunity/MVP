import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
  Alert, // Use Alert for messages instead of alert()
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Ensure @expo/vector-icons is installed
import colors from "../globals/colors"; // Ensure this path is correct
import { FontSizes, filterOptions as defaultFilterOptions, sortOptions as defaultSortOptions } from "../globals/constants";
import { useTranslation } from 'react-i18next';
import { createShadowStyle } from "../globals/styles";
import { biDiTextAlign, rowDirection, getResponsiveModalStyles, responsiveSpacing, responsiveFontSize, getScreenInfo, BREAKPOINTS } from "../globals/responsive";

interface SearchBarProps {
  onHasActiveConditionsChange?: (isActive: boolean) => void;
  onSearch?: (query: string, filters?: string[], sorts?: string[], results?: any[]) => void;
  placeholder?: string;
  // New props for dynamic filter/sort options and search data (optional for backward compatibility)
  filterOptions?: string[];
  sortOptions?: string[];
  searchData?: any[];
}

const SearchBar = ({ 
  onHasActiveConditionsChange, 
  onSearch, 
  placeholder,
  filterOptions = defaultFilterOptions,
  sortOptions = defaultSortOptions,
  searchData = []
}: SearchBarProps) => {
  const [searchText, setSearchText] = useState("");
  const { t } = useTranslation(['search','common']);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedSorts, setSelectedSorts] = useState<string[]>([]);
 // New state to track if SearchBar has active filters/sorts
 const [hasActiveConditions, setHasActiveConditions] = useState<boolean>(false);

 // Callback function to be passed to SearchBar
 const handleHasActiveConditionsChange = (isActive: boolean) => {
   setHasActiveConditions(isActive);
   onHasActiveConditionsChange?.(isActive);
 };

 // Determine paddingBottom based on hasActiveConditions
 const getPaddingBottom = () => {
   if (hasActiveConditions) {
     // If there are filters/sorts, provide less padding to avoid excessive space
     return Platform.select({
       ios: 20,
       android: 0,
       web: 0,
     });
   } else {
     // If no filters/sorts, provide more padding for the static buttons row
     return Platform.select({
       ios: 80,
       android: 0,
       web: 0, // Assuming web might handle spacing differently
     });
   }
 };

  // Effect to inform parent about active conditions
  useEffect(() => {
    const hasActive = selectedFilters.length > 0 || selectedSorts.length > 0;
    handleHasActiveConditionsChange(hasActive);
  }, [selectedFilters, selectedSorts]); // Add onHasActiveConditionsChange to dependencies

  // Function to perform search with given parameters
  const performSearch = (query: string, filters: string[], sorts: string[]) => {
    // For backward compatibility, if no searchData is provided, just call onSearch with basic parameters
    if (searchData.length === 0) {
      onSearch?.(query, filters, sorts, []);
      return;
    }
    
    // Perform search on the provided data
    let results = [...searchData];
    
    // Filter by search text if provided
    if (query.trim() !== "") {
      results = results.filter(item => {
        // Enhanced search for charities - check specific fields first
        if (item.name && item.name.toLowerCase().includes(query.toLowerCase())) {
          return true;
        }
        if (item.description && item.description.toLowerCase().includes(query.toLowerCase())) {
          return true;
        }
        if (item.location && item.location.toLowerCase().includes(query.toLowerCase())) {
          return true;
        }
        if (item.category && item.category.toLowerCase().includes(query.toLowerCase())) {
          return true;
        }
        if (item.organization && item.organization.toLowerCase().includes(query.toLowerCase())) {
          return true;
        }
        if (item.title && item.title.toLowerCase().includes(query.toLowerCase())) {
          return true;
        }
        
        // Fallback to generic search for other properties
        const itemStr = JSON.stringify(item).toLowerCase();
        return itemStr.includes(query.toLowerCase());
      });
    }
    
    // Apply filters if any are selected
    if (filters.length > 0) {
      results = results.filter(item => {
        // Enhanced filter logic for charities
        return filters.some(filter => {
          // Check category field first
          if (item.category && item.category.toLowerCase().includes(filter.toLowerCase())) {
            return true;
          }
          // Check tags field if it exists
          if (item.tags && Array.isArray(item.tags)) {
            return item.tags.some((tag: string) => tag.toLowerCase().includes(filter.toLowerCase()));
          }
          // Check organization field
          if (item.organization && item.organization.toLowerCase().includes(filter.toLowerCase())) {
            return true;
          }
          // Fallback to generic search
          const itemStr = JSON.stringify(item).toLowerCase();
          return itemStr.includes(filter.toLowerCase());
        });
      });
    }
    
    // Apply sorting if any is selected
    if (sorts.length > 0) {
      const sortOption = sorts[0]; // Only one sort at a time
      
      // Enhanced sorting logic for charities
      if (sortOption === 'alphabetical') {
        results.sort((a, b) => {
          const aName = (a.name || a.title || a.organization || '').toLowerCase();
          const bName = (b.name || b.title || b.organization || '').toLowerCase();
          return aName.localeCompare(bName, 'he');
        });
      } else if (sortOption === 'byLocation') {
        results.sort((a, b) => {
          const aLocation = (a.location || '').toLowerCase();
          const bLocation = (b.location || '').toLowerCase();
          return aLocation.localeCompare(bLocation, 'he');
        });
      } else if (sortOption === 'byCategory') {
        results.sort((a, b) => {
          const aCategory = (a.category || '').toLowerCase();
          const bCategory = (b.category || '').toLowerCase();
          return aCategory.localeCompare(bCategory, 'he');
        });
      } else if (sortOption === 'byDonors') {
        results.sort((a, b) => {
          const aDonors = a.donors || a.volunteers || 0;
          const bDonors = b.donors || b.volunteers || 0;
          return bDonors - aDonors; // Descending order
        });
      } else if (sortOption === 'byRating') {
        results.sort((a, b) => {
          const aRating = a.rating || 0;
          const bRating = b.rating || 0;
          return bRating - aRating; // Descending order
        });
      } else if (sortOption === 'byRelevance') {
        // Default - by rating
        results.sort((a, b) => {
          const aRating = a.rating || 0;
          const bRating = b.rating || 0;
          return bRating - aRating; // Descending order
        });
      }
    }
    
    // Call the parent's search handler with all the parameters
    onSearch?.(query, filters, sorts, results);
  };

  const handleSearch = () => {
    performSearch(searchText, selectedFilters, selectedSorts);
  };

  const handleFilterSelection = (option: string) => {
    setSelectedFilters((prevFilters) => {
      const newFilters = prevFilters.includes(option) 
        ? prevFilters.filter((item) => item !== option)
        : [...prevFilters, option];
      
      // Perform real-time search with new filters
      performSearch(searchText, newFilters, selectedSorts);
      
      return newFilters;
    });
  };

  const handleSortSelection = (option: string) => {
    setSelectedSorts((prevSorts) => {
      const newSorts = prevSorts.includes(option) ? [] : [option];
      
      // Perform real-time search with new sorts
      performSearch(searchText, selectedFilters, newSorts);
      
      return newSorts;
    });
  };

  const removeFilter = (filterToRemove: string) => {
    setSelectedFilters((prevFilters) => {
      const newFilters = prevFilters.filter((filter) => filter !== filterToRemove);
      
      // Perform real-time search with updated filters
      performSearch(searchText, newFilters, selectedSorts);
      
      return newFilters;
    });
  };

  const removeSort = (sortToRemove: string) => {
    setSelectedSorts([]); // Remove all sorts, as typically only one can be active
    
    // Perform real-time search with updated sorts
    performSearch(searchText, selectedFilters, []);
  };

  const isFilterSelected = (option: string) => selectedFilters.includes(option);
  const isSortSelected = (option: string) => selectedSorts.includes(option);

  // Handle text input changes
  const handleTextChange = (text: string) => {
    setSearchText(text);
    
    // Perform real-time search as user types
    performSearch(text, selectedFilters, selectedSorts);
  };

  // Handle search on submit
  const handleSubmitEditing = () => {
    handleSearch();
  };

  // Get responsive styles
  const modalStyles = getResponsiveModalStyles();
  const { isTablet, isDesktop, isLargeDesktop, width } = getScreenInfo();
  const isDesktopWeb = Platform.OS === 'web' && width > BREAKPOINTS.TABLET;
  const iconSize = isLargeDesktop ? 28 : isDesktopWeb ? 26 : isTablet ? 24 : 22;

  return (
    <View style={localStyles.container}>
      {/* --- Main Search Bar Row --- */}
      <View style={[localStyles.searchBarContainer, { flexDirection: rowDirection('row-reverse') }]}>
        {/* Sort Button (opens sort modal) */}
        <TouchableOpacity
          style={localStyles.buttonContainer}
          onPress={() => setIsSortModalVisible(true)}
        >
                      <Text style={localStyles.buttonText}>{t('search:sortTitle')}</Text>
        </TouchableOpacity>

        {/* Filter Button (opens filter modal) */}
        <TouchableOpacity
          style={localStyles.buttonContainer}
          onPress={() => setIsFilterModalVisible(true)}
        >
                      <Text style={localStyles.buttonText}>{t('search:filterTitle')}</Text>
        </TouchableOpacity>

        {/* Search Input Field */}
        <TextInput
          style={[localStyles.searchInput, { textAlign: biDiTextAlign('center') }]}
          placeholder={placeholder}
          placeholderTextColor="black"
          value={searchText}
          onChangeText={handleTextChange}
          onSubmitEditing={handleSubmitEditing}
          returnKeyType="search"
          textAlign="center"
        />

        {/* Search Icon Button */}
        <TouchableOpacity
          onPress={handleSearch}
          style={localStyles.searchIconContainer}
        >
          <Ionicons name="search" size={iconSize} color="#333" />
        </TouchableOpacity>

        {/* --- Filter Options Modal --- */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isFilterModalVisible}
          onRequestClose={() => setIsFilterModalVisible(false)}
        >
          <TouchableOpacity
            style={localStyles.modalOverlay}
            activeOpacity={1}
            onPress={() => setIsFilterModalVisible(false)}
          >
            <View style={[
              localStyles.modalContent,
              {
                width: modalStyles.width,
                maxWidth: modalStyles.maxWidth,
                maxHeight: modalStyles.maxHeight,
                padding: modalStyles.padding,
                borderRadius: modalStyles.borderRadius,
              }
            ]}>
              <Text style={localStyles.modalTitle}>{t('search:chooseFiltersTitle')}</Text>
              <ScrollView style={localStyles.modalScrollView}>
                {filterOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      localStyles.modalOption,
                      isFilterSelected(option) && localStyles.modalOptionSelected,
                    ]}
                    onPress={() => handleFilterSelection(option)}
                  >
                    <Text
                      style={[
                        localStyles.modalOptionText,
                        isFilterSelected(option) && localStyles.modalOptionTextSelected,
                      ]}
                    >
                       {t(`search:filters.${option}`)}
                    </Text>
                    {isFilterSelected(option) && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={colors.pink}
                        style={localStyles.modalCheckmark}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={localStyles.modalCloseButton}
                onPress={() => setIsFilterModalVisible(false)}
              >
                <Text style={localStyles.modalCloseButtonText}>{t('common:close')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* --- Sort Options Modal --- */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isSortModalVisible}
          onRequestClose={() => setIsSortModalVisible(false)}
        >
          <TouchableOpacity
            style={localStyles.modalOverlay}
            activeOpacity={1}
            onPress={() => setIsSortModalVisible(false)}
          >
            <View style={[
              localStyles.modalContent,
              {
                width: modalStyles.width,
                maxWidth: modalStyles.maxWidth,
                maxHeight: modalStyles.maxHeight,
                padding: modalStyles.padding,
                borderRadius: modalStyles.borderRadius,
              }
            ]}>
              <Text style={localStyles.modalTitle}>{t('search:chooseSortsTitle')}</Text>
              <ScrollView style={localStyles.modalScrollView}>
                {sortOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      localStyles.modalOption,
                      isSortSelected(option) && localStyles.modalOptionSelected,
                    ]}
                    onPress={() => handleSortSelection(option)}
                  >
                    <Text
                      style={[
                        localStyles.modalOptionText,
                        isSortSelected(option) && localStyles.modalOptionTextSelected,
                      ]}
                    >
                       {t(`search:sort.${option}`)}
                    </Text>
                    {isSortSelected(option) && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={colors.pink}
                        style={localStyles.modalCheckmark}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={localStyles.modalCloseButton}
                onPress={() => setIsSortModalVisible(false)}
              >
                <Text style={localStyles.modalCloseButtonText}>{t('common:close')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>

      {/* --- Selected Filters Row --- */}
      {selectedFilters.length > 0 && (
        <View style={localStyles.selectedRowWrapper}>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={localStyles.selectedButtonsContainer}
          >
            {selectedFilters.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={localStyles.selectedFilterSortButton}
                onPress={() => removeFilter(filter)}
              >
                <Text style={localStyles.selectedFilterSortButtonText}>
                  {filter}
                </Text>
                <Ionicons name="close-circle" size={15} color={colors.white} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={localStyles.rowLabel}>{t('search:filterLabel')}</Text>
        </View>
      )}

      {/* --- Selected Sorts Row --- */}
      {selectedSorts.length > 0 && (
        <View style={localStyles.selectedRowWrapper}>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={localStyles.selectedButtonsContainer}
          >
            {selectedSorts.map((sort) => (
              <TouchableOpacity
                key={sort}
                style={localStyles.selectedFilterSortButton}
                onPress={() => removeSort(sort)}
              >
                <Text style={localStyles.selectedFilterSortButtonText}>
                  {sort}
                </Text>
                <Ionicons name="close-circle" size={16} color={colors.white} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={localStyles.rowLabel}>{t('search:sortLabel')}</Text>

        </View>
      )}

     
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    width: "100%",
    // paddingBottom: 10,
    // Note: flex: 1 removed as it can interfere with parent layout if not carefully managed.
    // The height of SearchBar will be determined by its content.
  },
  searchBarContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.backgroundSecondary,
    borderRadius: responsiveSpacing(25, 27, 30),
    marginHorizontal: responsiveSpacing(20, 24, 28),
    marginTop: responsiveSpacing(8, 10, 12),
    ...createShadowStyle("#000", { width: 0, height: 2 }, 0.1, 4),
    elevation: 3,
    paddingVertical: responsiveSpacing(2, 3, 4),
    borderWidth: 1,
    borderColor: colors.searchBorder,
    maxWidth: '100%',
  },
  buttonContainer: {
    backgroundColor: colors.moneyFormBackground,
    borderRadius: responsiveSpacing(18, 20, 22),
    paddingVertical: responsiveSpacing(4, 5, 6),
    paddingHorizontal: responsiveSpacing(12, 14, 16),
    marginHorizontal: responsiveSpacing(4, 5, 6),
  },
  buttonText: {
    fontSize: responsiveFontSize(FontSizes.caption, 13, 15),
    color: colors.searchText,
    fontWeight: "bold",
    writingDirection: "rtl",
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: responsiveFontSize(FontSizes.small, 15, 17),
    color: colors.searchText,
    paddingHorizontal: responsiveSpacing(10, 12, 14),
  },
  searchIconContainer: {
    paddingLeft: responsiveSpacing(10, 12, 14),
  },

  // --- Modals Styles ---
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    // Dynamic styles applied in JSX for responsive sizing
    ...createShadowStyle("#000", { width: 0, height: 2 }, 0.25, 4),
    elevation: 5,
  },
  modalTitle: {
    fontSize: responsiveFontSize(FontSizes.heading2, 20, 22),
    fontWeight: "bold",
    marginBottom: responsiveSpacing(15, 18, 20),
    textAlign: "center",
    color: colors.textSecondary,
  },
  modalScrollView: {
    maxHeight: responsiveSpacing(300, 400, 500),
  },
  modalOption: {
    paddingVertical: responsiveSpacing(15, 18, 20),
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: rowDirection("row-reverse"),
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: responsiveSpacing(10, 12, 14),
  },
  modalOptionSelected: {
    backgroundColor: colors.orangeLight,
  },
  modalOptionText: {
    fontSize: responsiveFontSize(FontSizes.medium, 16, 18),
    textAlign: "right",
    writingDirection: "rtl",
    color: "#333",
    flex: 1,
  },
  modalOptionTextSelected: {
    fontWeight: "bold",
    color: colors.pink,
  },
  modalCheckmark: {
    marginLeft: responsiveSpacing(10, 12, 14),
  },
  modalCloseButton: {
    marginTop: responsiveSpacing(20, 24, 28),
    backgroundColor: colors.pink,
    paddingVertical: responsiveSpacing(12, 14, 16),
    borderRadius: responsiveSpacing(8, 10, 12),
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "white",
    fontSize: responsiveFontSize(FontSizes.medium, 16, 18),
    fontWeight: "bold",
  },

  // --- Selected Filter/Sort Rows Styles ---
  selectedRowWrapper: {
    flexDirection: "row-reverse",
    marginHorizontal: 10,
    marginTop: 5,
    // minHeight: 20,
  },
  rowLabel: {
    fontSize: responsiveFontSize(FontSizes.small, 14, 16),
    fontWeight: "bold",
    color: colors.textSecondary,
    marginRight: responsiveSpacing(8, 10, 12),
    paddingVertical: responsiveSpacing(5, 6, 7),
    paddingLeft: responsiveSpacing(10, 12, 14),
  },
  selectedButtonsContainer: {
    flexDirection: "row",
    gap: responsiveSpacing(8, 10, 12),
    paddingRight: responsiveSpacing(10, 12, 14),
    alignItems: 'center',
    flexGrow: 1,
  },
  selectedFilterSortButton: {
    backgroundColor: colors.pinkLight,
    paddingVertical: responsiveSpacing(2, 3, 4),
    paddingHorizontal: responsiveSpacing(5, 6, 7),
    borderRadius: responsiveSpacing(18, 20, 22),
    flexDirection: "row-reverse",
    alignItems: "center",
    ...createShadowStyle("#000", { width: 0, height: 1 }, 0.1, 2),
    elevation: 2,
  },
  selectedFilterSortButtonText: {
    fontSize: responsiveFontSize(FontSizes.caption, 12, 14),
    fontWeight: 'bold',
    color: colors.black,
    marginLeft: responsiveSpacing(4, 5, 6),
  },

  // --- Static Filter Buttons Row Styles ---
  staticRowWrapper: {
    marginTop: 10,
    paddingBottom: 10,
    minHeight: 40,
  },
  staticButtonsContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 15,
    flexGrow: 1,
  },
  staticFilterButton: {
    backgroundColor: colors.orange,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    flexShrink: 0,
  },
  staticFilterButtonText: {
    fontSize: FontSizes.small,
    color: colors.black,
  },
});

export default SearchBar;