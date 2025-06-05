import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SearchBar = () => {
  const [searchText, setSearchText] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);

  const filterOptions: string[] = ['לפי תאריך', 'לפי קטגוריה', 'לפי רלוונטיות'];
  const sortOptions: string[] = ['מהחדש לישן', 'מהישן לחדש', 'אלפביתי'];

  const handleSearch = () => {
    if (searchText.trim() !== '') {
      alert(`מחפש: ${searchText}`);
    } else {
      alert('אנא הכנס טקסט לחיפוש.');
    }
  };

  // --- FIX APPLIED HERE ---
  const handleFilterSelection = (option: string) => { // <--- Added ': string'
    alert(`סינון לפי: ${option}`);
    setIsFilterModalVisible(false);
  };

  // --- FIX APPLIED HERE ---
  const handleSortSelection = (option: string) => { // <--- Added ': string'
    alert(`מיון לפי: ${option}`);
    setIsSortModalVisible(false);
  };

  return (
    <View style={localStyles.safeArea}>
      <View style={localStyles.searchBarContainer}>
        {/* Sort Button */}
        <TouchableOpacity
          style={localStyles.buttonContainer}
          onPress={() => setIsSortModalVisible(true)}
        >
          <Text style={localStyles.buttonText}>מיון</Text>
        </TouchableOpacity>

        {/* Filter Button */}
        <TouchableOpacity
          style={localStyles.buttonContainer}
          onPress={() => setIsFilterModalVisible(true)}
        >
          <Text style={localStyles.buttonText}>סינון</Text>
        </TouchableOpacity>

        {/* Search Input */}
        <TextInput
          style={localStyles.searchInput}
          placeholder="חפש..."
          placeholderTextColor="#A0A0A0"
          value={searchText}
          onChangeText={setSearchText}
          textAlign="right" // For RTL text input
        />

        {/* Search Icon */}
        <TouchableOpacity onPress={handleSearch} style={localStyles.searchIconContainer}>
          <Ionicons name="search" size={24} color="#333" />
        </TouchableOpacity>

        {/* Filter Options Modal */}
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
              {filterOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={localStyles.modalOption}
                  onPress={() => handleFilterSelection(option)}
                >
                  <Text style={localStyles.modalOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Sort Options Modal */}
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
              {sortOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={localStyles.modalOption}
                  onPress={() => handleSortSelection(option)}
                >
                  <Text style={localStyles.modalOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'transparent',
    flex: 1,
    width: '100%',
  },
  searchBarContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#FFDAB9',
    borderRadius: 30,
    paddingHorizontal: 15,
    marginHorizontal: 20,
    marginVertical: 15,
    height: 55,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContainer: {
    backgroundColor: '#FFEFD5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginHorizontal: 5,
  },
  buttonText: {
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
    writingDirection: 'rtl',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 10,
  },
  searchIconContainer: {
    paddingLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalOptionText: {
    fontSize: 18,
    textAlign: 'right',
    writingDirection: 'rtl',
    color: '#333',
  },
});

export default SearchBar;