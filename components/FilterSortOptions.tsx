import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Filter, SortBy, SortOrder } from '../globals';
import Icon from 'react-native-vector-icons/MaterialIcons';
import colors from '../globals/colors';

interface FilterSortOptionsProps {
  currentFilter: Filter;
  onSelectFilter: (filter: Filter) => void;
  currentSortBy: SortBy;
  onSelectSortBy: (sortBy: SortBy) => void;
  currentSortOrder: SortOrder;
  onToggleSortOrder: () => void;
}

const FilterSortOptions: React.FC<FilterSortOptionsProps> = ({
  currentFilter,
  onSelectFilter,
  currentSortBy,
  onSelectSortBy,
  currentSortOrder,
  onToggleSortOrder,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Text style={styles.label}>Filter:</Text>
        {['All', 'Pending', 'Completed'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.optionButton,
              currentFilter === filter && styles.selectedOption,
            ]}
            onPress={() => onSelectFilter(filter as Filter)}
          >
            <Text
              style={[
                styles.optionText,
                currentFilter === filter && styles.selectedOptionText,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sortContainer}>
        <Text style={styles.label}>Sort By:</Text>
        {['createdAt', 'dueDate', 'priority'].map((sortBy) => (
          <TouchableOpacity
            key={sortBy}
            style={[
              styles.optionButton,
              currentSortBy === sortBy && styles.selectedOption,
            ]}
            onPress={() => onSelectSortBy(sortBy as SortBy)}
          >
            <Text
              style={[
                styles.optionText,
                currentSortBy === sortBy && styles.selectedOptionText,
              ]}
            >
              {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.sortOrderButton} onPress={onToggleSortOrder}>
          <Icon
            name={currentSortOrder === 'asc' ? 'arrow-upward' : 'arrow-downward'}
            size={20}
            color={colors.blue}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.lightOrange,
    padding: 10,
    borderRadius: 10,
    // marginBottom: 20,
    elevation: 1,
    // shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    marginBottom: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: 10,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 10,
    color: '#333',
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
  },
  selectedOption: {
    backgroundColor: '#007AFF',
  },
  optionText: {
    color: '#555',
    fontSize: 10,
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  sortOrderButton: {
    marginLeft: 10,
    padding: 5,
  },
});

export default FilterSortOptions;