// components/ModeToggleButton.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ModeToggleButtonProps {
  mode: 'מחפש' | 'מציע';
  onToggle: () => void;
}

const ModeToggleButton: React.FC<ModeToggleButtonProps> = ({ mode, onToggle }) => {
  return (
    <TouchableOpacity style={localStyles.modeToggleWrapper} onPress={onToggle}>
      <View style={localStyles.modeToggleBackground}>
        <View
          style={[
            localStyles.modeButton,
            mode === 'מחפש' ? localStyles.selectedLeft : localStyles.unselectedLeft // Adjusted for 'מחפש' (left)
          ]}
        >
          <Text style={localStyles.modeText}>מחפש</Text>
        </View>
        <View
          style={[
            localStyles.modeButton,
            mode === 'מציע' ? localStyles.selectedRight : localStyles.unselectedRight // Adjusted for 'מציע' (right)
          ]}
        >
          <Text style={localStyles.modeText}>מציע</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const localStyles = StyleSheet.create({
  modeToggleWrapper: {
    borderRadius: 999,
    overflow: 'hidden',
    width: '40%', 
  },
  modeToggleBackground: {
    flexDirection: 'row-reverse', // Keeps "מחפש" on the right initially for RTL
    backgroundColor: '#FBD5D5',
    borderRadius: 999, // Use 999 for full pill shape
    height: 40, // Fixed height for consistency
  },
  modeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1, // Distributes space evenly
    alignItems: 'center',
    justifyContent: 'center', // Center text vertically
  },
  selectedLeft: { // Styles for "מחפש" when selected
    backgroundColor: '#FB923C',
    borderRadius: 999, // Full pill shape
  },
  unselectedLeft: { // Styles for "מחפש" when unselected
    backgroundColor: '#FBD5D5',
  },
  selectedRight: { // Styles for "מציע" when selected
    backgroundColor: '#FB923C',
    borderRadius: 999, // Full pill shape
  },
  unselectedRight: { // Styles for "מציע" when unselected
    backgroundColor: '#FBD5D5',
  },
  modeText: {
    fontWeight: 'bold',
    color: '#000',
    fontSize: 14,
  },
});

export default ModeToggleButton;