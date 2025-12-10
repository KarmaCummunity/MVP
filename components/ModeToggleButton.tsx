// components/ModeToggleButton.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../globals/colors';
import { useTranslation } from 'react-i18next';

interface ModeToggleButtonProps {
  mode: boolean;
  onToggle: () => void;
}

const ModeToggleButton: React.FC<ModeToggleButtonProps> = ({ mode, onToggle }) => {
  const { t } = useTranslation(['common']);

  return (
    <TouchableOpacity style={localStyles.toggleWrapper} onPress={onToggle} activeOpacity={0.9}>
      <View style={localStyles.toggleBackground}>
        {/* Helper (Offerer) - Left side in LTR, Right side in RTL (handled by row-reverse) */}
        <View
          style={[
            localStyles.toggleSegment,
            !mode ? localStyles.toggleSelected : localStyles.toggleUnselected
          ]}
        >
          <Text
            style={[
              localStyles.toggleText,
              !mode ? localStyles.toggleTextSelected : undefined
            ]}
          >
            {t('common:offerer')}
          </Text>
        </View>

        {/* Seeker - Right side in LTR, Left side in RTL */}
        <View
          style={[
            localStyles.toggleSegment,
            mode ? localStyles.toggleSelected : localStyles.toggleUnselected
          ]}
        >
          <Text
            style={[
              localStyles.toggleText,
              mode ? localStyles.toggleTextSelected : undefined
            ]}
          >
            {t('common:seeker')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const localStyles = StyleSheet.create({
  toggleWrapper: {
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    // Allow flexibility in width or constraints if passed from parent, 
    // but here we keep it self-contained
  },
  toggleBackground: {
    flexDirection: 'row-reverse', // RTL support
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 999,
    height: 32,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleSegment: {
    paddingHorizontal: 16,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    minWidth: 70, // Ensure minimum tap target area
  },
  toggleSelected: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleUnselected: {
    backgroundColor: 'transparent',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  toggleTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
});

export default ModeToggleButton;