import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../globals/colors";
import { filterOptions, sortOptions } from "../globals/constants";

const SearchBar = () => {
  const [searchText, setSearchText] = useState("");
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedSorts, setSelectedSorts] = useState<string[]>([]);

  const handleSearch = () => {
    if (searchText.trim() !== "") {
      alert(`מחפש: ${searchText}`);
      console.log("Searching with:", { searchText, selectedFilters, selectedSorts });
    } else {
      alert("אנא הכנס טקסט לחיפוש.");
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
      if (prevSorts.includes(option)) {
        return [];
      } else {
        return [option];
      }
    });
  };

  const removeFilter = (filterToRemove: string) => {
    setSelectedFilters((prevFilters) =>
      prevFilters.filter((filter) => filter !== filterToRemove)
    );
  };

  const removeSort = (sortToRemove: string) => {
    setSelectedSorts((prevSorts) =>
      prevSorts.filter((sort) => sort !== sortToRemove)
    );
  };

  const isFilterSelected = (option: string) => selectedFilters.includes(option);
  const isSortSelected = (option: string) => selectedSorts.includes(option);

  const staticFilterButtons = [
    "הטבות",
    "אמצעי תשלום",
    "ילדים",
    "קרוב אליי",
    "עברו עימות",
    "רק מתנדבים",
    "החזר מס",
    "מרצנדייז",
  ];

  const showStaticFilters = selectedFilters.length === 0 && selectedSorts.length === 0;

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
                <Ionicons name="close-circle" size={16} color={colors.white} />
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

      {/* --- Static Filter Buttons Row (conditionally rendered) --- */}
      {showStaticFilters && (
        <View style={localStyles.staticRowWrapper}>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={localStyles.staticButtonsContainer}
          >
            {staticFilterButtons.map((label, index) => (
              <TouchableOpacity
                key={label + index}
                style={localStyles.staticFilterButton}
              >
                <Text style={localStyles.staticFilterButtonText}>{label}</Text>
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
    flex: 1,
    width: "100%",
    paddingBottom: 10,
  },
  searchBarContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#FFDAB9",
    borderRadius: 30,
    marginHorizontal: 20,
    marginTop: 15,
    height: 55,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontSize: 16,
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
    // Add minHeight to ensure it's visible even if content is small
    minHeight: 30, // A minimum height for the wrapper
    // The ScrollView inside will then take its content size or the height of the wrapper
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
    // flexGrow is crucial here for horizontal ScrollViews on Android
    // It allows the content container to grow within the ScrollView's bounds
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
    // Add minHeight here as well for consistency
    minHeight: 40, // A minimum height for the wrapper
  },
  staticButtonsContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 15,
    // Apply flexGrow here too
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