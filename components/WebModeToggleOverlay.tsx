// WebModeToggleOverlay.tsx
// A centered, web-only toggle control to switch between 'אפליקציה' and 'אתר בית'. Hidden on native.
import React from 'react';
import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useWebMode } from '../context/WebModeContext';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';

const WebModeToggleOverlay: React.FC = () => {
  if (Platform.OS !== 'web') return null as any;
  const { mode, toggleMode } = useWebMode();

  return (
    <View pointerEvents="box-none" style={styles.container}>
      <TouchableOpacity onPress={toggleMode} activeOpacity={0.9} style={styles.wrapper}>
        <View style={styles.background}>
          <View style={[styles.segment, mode === 'site' ? styles.selected : styles.unselected]}>
            <Text style={[styles.text, mode === 'site' ? styles.textSelected : undefined]}>אתר בית</Text>
          </View>
          <View style={[styles.segment, mode === 'app' ? styles.selected : styles.unselected]}>
            <Text style={[styles.text, mode === 'app' ? styles.textSelected : undefined]}>אפליקציה</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  wrapper: {
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  background: {
    flexDirection: 'row-reverse',
    backgroundColor: colors.toggleBackground,
    borderRadius: 999,
    height: 30,
    borderWidth: 1,
    borderColor: colors.headerBorder,
  },
  segment: {
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: colors.toggleActive,
  },
  unselected: {
    backgroundColor: 'transparent',
  },
  text: {
    fontSize: FontSizes.small,
    fontWeight: '700',
    color: colors.toggleText,
  },
  textSelected: {
    color: colors.textPrimary,
  },
});

export default WebModeToggleOverlay;


