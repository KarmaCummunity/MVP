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
import { filterOptions, sortOptions } from "../globals/constants"; // Ensure this path is correct

interface SearchBarProps {
  onHasActiveConditionsChange: (isActive: boolean) => void;
}

const SearchBar = () => {
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

  const handleSearch = () => {
    if (searchText.trim() !== "") {
      Alert.alert(`מחפש: ${searchText}`); // Changed to Alert.alert
      // console.log("Searching with:", { searchText, selectedFilters, selectedSorts });
    } else {
      Alert.alert("אנא הכנס טקסט לחיפוש."); // Changed to Alert.alert
    }
  };

  const handleFilterSelection = (option: string) => {
    setSelectedFilters((prevFilters) => {
      if (prevFilters.includes(option)) {
        return prevFilters.filter((item) => item !== option);
      } else {
        return [...prevFilters, option];
      }
    });
  };

  const handleSortSelection = (option: string) => {
    setSelectedSorts((prevSorts) => {
      // For sort, assuming only one can be selected at a time, or none
      if (prevSorts.includes(option)) {
        return []; // Deselect if already selected
      } else {
        return [option]; // Select new option
      }
    });
  };

  const removeFilter = (filterToRemove: string) => {
    setSelectedFilters((prevFilters) =>
      prevFilters.filter((filter) => filter !== filterToRemove)
    );
  };

  const removeSort = (sortToRemove: string) => {
    setSelectedSorts([]); // Remove all sorts, as typically only one can be active
  };

  const isFilterSelected = (option: string) => selectedFilters.includes(option);
  const isSortSelected = (option: string) => selectedSorts.includes(option);


  return (
    <View style={localStyles.container}>
      {/* --- Main Search Bar Row --- */}
      <View style={localStyles.searchBarContainer}>
        {/* Sort Button (opens sort modal) */}
        <TouchableOpacity
          style={localStyles.buttonContainer}
          onPress={() => setIsSortModalVisible(true)}
        >
          <Text style={localStyles.buttonText}>מיון</Text>
        </TouchableOpacity>

        {/* Filter Button (opens filter modal) */}
        <TouchableOpacity
          style={localStyles.buttonContainer}
          onPress={() => setIsFilterModalVisible(true)}
        >
          <Text style={localStyles.buttonText}>סינון</Text>
        </TouchableOpacity>

        {/* Search Input Field */}
        <TextInput
          style={localStyles.searchInput}
          placeholder="חפש..."
          placeholderTextColor={colors.mediumGray}
          value={searchText}
          onChangeText={setSearchText}
          textAlign="right"
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
            onPressOut={() => setIsFilterModalVisible(false)}
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
                        color={colors.primaryBlue}
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
            onPressOut={() => setIsSortModalVisible(false)}
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
                        color={colors.primaryBlue}
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
          <Text style={localStyles.rowLabel}>סינון:</Text>
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
        </View>
      )}

      {/* --- Selected Sorts Row --- */}
      {selectedSorts.length > 0 && (
        <View style={localStyles.selectedRowWrapper}>
          <Text style={localStyles.rowLabel}>מיון:</Text>
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
    backgroundColor: "#FFDAB9",
    borderRadius: 30,
    marginHorizontal: 20,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    paddingVertical: 3,
  },
  buttonContainer: {
    backgroundColor: "#FFEFD5",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginHorizontal: 5,
  },
  buttonText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "bold",
    writingDirection: "rtl",
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 12,
    color: "#333",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: colors.darkGray,
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
    backgroundColor: colors.lightOrange,
  },
  modalOptionText: {
    fontSize: 18,
    textAlign: "right",
    writingDirection: "rtl",
    color: "#333",
    flex: 1,
  },
  modalOptionTextSelected: {
    fontWeight: "bold",
    color: colors.primaryBlue,
  },
  modalCheckmark: {
    marginLeft: 10,
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: colors.primaryBlue,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "white",
    fontSize: 18,
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
    fontSize: 12,
    fontWeight: "bold",
    color: colors.darkGray,
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
    backgroundColor: colors.mediumOrange,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: 5,
    borderRadius: 18,
    flexDirection: "row-reverse",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedFilterSortButtonText: {
    fontSize: 10,
    color: colors.black,
    marginLeft: 1,
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
    backgroundColor: colors.mediumOrange,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    flexShrink: 0,
  },
  staticFilterButtonText: {
    fontSize: 13,
    color: colors.black,
  },
});

export default SearchBar;