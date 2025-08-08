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
import { texts } from "../globals/texts";
import { createShadowStyle } from "../globals/styles";

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
            return item.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()));
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
      if (sortOption === "אלפביתי") {
        results.sort((a, b) => {
          const aName = (a.name || a.title || a.organization || '').toLowerCase();
          const bName = (b.name || b.title || b.organization || '').toLowerCase();
          return aName.localeCompare(bName, 'he');
        });
      } else if (sortOption === "לפי מיקום") {
        results.sort((a, b) => {
          const aLocation = (a.location || '').toLowerCase();
          const bLocation = (b.location || '').toLowerCase();
          return aLocation.localeCompare(bLocation, 'he');
        });
      } else if (sortOption === "לפי תחום") {
        results.sort((a, b) => {
          const aCategory = (a.category || '').toLowerCase();
          const bCategory = (b.category || '').toLowerCase();
          return aCategory.localeCompare(bCategory, 'he');
        });
      } else if (sortOption === "לפי מספר תורמים") {
        results.sort((a, b) => {
          const aDonors = a.donors || a.volunteers || 0;
          const bDonors = b.donors || b.volunteers || 0;
          return bDonors - aDonors; // Descending order
        });
      } else if (sortOption === "לפי דירוג") {
        results.sort((a, b) => {
          const aRating = a.rating || 0;
          const bRating = b.rating || 0;
          return bRating - aRating; // Descending order
        });
      } else if (sortOption === "לפי רלוונטיות") {
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

  return (
    <View style={localStyles.container}>
      {/* --- Main Search Bar Row --- */}
      <View style={localStyles.searchBarContainer}>
        {/* Sort Button (opens sort modal) */}
        <TouchableOpacity
          style={localStyles.buttonContainer}
          onPress={() => setIsSortModalVisible(true)}
        >
                      <Text style={localStyles.buttonText}>{texts.sort}</Text>
        </TouchableOpacity>

        {/* Filter Button (opens filter modal) */}
        <TouchableOpacity
          style={localStyles.buttonContainer}
          onPress={() => setIsFilterModalVisible(true)}
        >
                      <Text style={localStyles.buttonText}>{texts.filter}</Text>
        </TouchableOpacity>

        {/* Search Input Field */}
        <TextInput
          style={localStyles.searchInput}
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
          <Ionicons name="search" size={24} color="#333" />
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
            <View style={localStyles.modalContent}>
              <Text style={localStyles.modalTitle}>בחר אפשרויות סינון</Text>
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
                      {option}
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
                <Text style={localStyles.modalCloseButtonText}>סגור</Text>
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
            <View style={localStyles.modalContent}>
              <Text style={localStyles.modalTitle}>בחר אפשרויות מיון</Text>
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
                      {option}
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
                <Text style={localStyles.modalCloseButtonText}>סגור</Text>
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
          <Text style={localStyles.rowLabel}>סינון:</Text>
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
          <Text style={localStyles.rowLabel}>מיון:</Text>

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
    borderRadius: 25,
    marginHorizontal: 20,
    marginTop: 8,
    ...createShadowStyle("#000", { width: 0, height: 2 }, 0.1, 4),
    elevation: 3,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.searchBorder,
  },
  buttonContainer: {
    backgroundColor: colors.moneyFormBackground,
    borderRadius: 18,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginHorizontal: 4,
  },
  buttonText: {
    fontSize: FontSizes.caption,
    color: colors.searchText,
    fontWeight: "bold",
    writingDirection: "rtl",
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: FontSizes.small,
    color: colors.searchText,
    paddingHorizontal: 10,
  },
  searchIconContainer: {
    paddingLeft: 10,
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
    borderRadius: 10,
    padding: 20,
    width: "80%",
    maxHeight: "70%",
    ...createShadowStyle("#000", { width: 0, height: 2 }, 0.25, 4),
    elevation: 5,
  },
  modalTitle: {
    fontSize: FontSizes.heading2,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: colors.textSecondary,
  },
  modalScrollView: {
    maxHeight: 300,
  },
  modalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  modalOptionSelected: {
    backgroundColor: colors.orangeLight,
  },
  modalOptionText: {
    fontSize: FontSizes.medium,
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
    marginLeft: 10,
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: colors.pink,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "white",
    fontSize: FontSizes.medium,
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
    fontSize: FontSizes.small,
    fontWeight: "bold",
    color: colors.textSecondary,
    marginRight: 8,
    paddingVertical: 5,
    paddingLeft: 10,
  },
  selectedButtonsContainer: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 10,
    alignItems: 'center',
    flexGrow: 1,
  },
  selectedFilterSortButton: {
    backgroundColor: colors.pinkLight,
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 18,
    flexDirection: "row-reverse",
    alignItems: "center",
    ...createShadowStyle("#000", { width: 0, height: 1 }, 0.1, 2),
    elevation: 2,
  },
  selectedFilterSortButtonText: {
    fontSize: FontSizes.caption,
    fontWeight: 'bold',
    color: colors.black,
    marginLeft: 4,
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