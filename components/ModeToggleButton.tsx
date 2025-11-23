// components/ModeToggleButton.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import { useTranslation } from 'react-i18next';

interface ModeToggleButtonProps {
  mode: boolean;
  onToggle: () => void;
}

const ModeToggleButton: React.FC<ModeToggleButtonProps> = ({ mode, onToggle }) => {
  const { t } = useTranslation(['common']);
  // // console removed
  return (
    <TouchableOpacity style={localStyles.modeToggleWrapper} onPress={onToggle}>
      <View style={localStyles.modeToggleBackground}>
        <View
          style={[
            localStyles.modeButton,
            !mode ? localStyles.selected: localStyles.unselected // Adjusted for 'מחפש' (left)
          ]}
        >
          <Text style={localStyles.modeText}>{t('common:offerer')}</Text>
        </View>
        <View
          style={[
            localStyles.modeButton,
            mode ? localStyles.selected : localStyles.unselected // Adjusted for 'מציע' (right)
          ]}
        >
          <Text style={localStyles.modeText}>{t('common:seeker')}</Text>
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
    flexDirection: 'row-reverse', // Keeps "מחפש" on the right initially for rtl
    backgroundColor: colors.toggleBackground,
    borderRadius: 999, // Use 999 for full pill shape
    height: 25, // Fixed height for consistency
  },
  modeButton: {
    flex: 1, // Distributes space evenly
    alignItems: 'center',
    justifyContent: 'center', // Center text vertically
  },
  unselected: { 
    backgroundColor: colors.toggleActive,
    borderRadius: 999, // Full pill shape
  },
  selected: {
    backgroundColor: colors.toggleBackground,
  },

  modeText: {
    fontWeight: 'bold',
    color: colors.toggleText,
    fontSize: FontSizes.small,
  },
});

export default ModeToggleButton;