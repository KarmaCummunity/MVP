// components/WebModeToggle.tsx
// Purpose: Web-only toggle switch overlay for switching between 'site' (landing page) and 'app' (full application) modes
// This component is positioned absolutely at the top-right of the screen and always visible on web

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useWebMode } from '../stores/webModeStore';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';

const WebModeToggle: React.FC = () => {
  const { mode, toggleMode } = useWebMode();

  // Only render on web platform
  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.toggleWrapper} 
        onPress={toggleMode}
        accessibilityLabel={`Switch to ${mode === 'site' ? 'app' : 'site'} mode`}
        accessibilityRole="switch"
      >
        <View style={styles.toggleBackground}>
          <View
            style={[
              styles.toggleOption,
              mode === 'site' && styles.activeOption
            ]}
          >
            <Text style={[
              styles.toggleText,
              mode === 'site' && styles.activeText
            ]}>
              אתר
            </Text>
          </View>
          <View
            style={[
              styles.toggleOption,
              mode === 'app' && styles.activeOption
            ]}
          >
            <Text style={[
              styles.toggleText,
              mode === 'app' && styles.activeText
            ]}>
              אפליקציה
            </Text>
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
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    // Elegant shadow for depth
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 6,
    // Border for definition
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  toggleBackground: {
    flexDirection: 'row',
    backgroundColor: colors.toggleBackground || '#F0F0F0',
    borderRadius: 18,
    padding: 3,
    minWidth: 180,
    height: 32,
  },
  toggleOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    marginHorizontal: 1,
    transition: 'all 0.3s ease',
  },
  activeOption: {
    backgroundColor: colors.primary || '#4A90E2',
    // Subtle inner shadow for active state
    shadowColor: colors.primary || '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  toggleText: {
    fontSize: FontSizes.small,
    fontWeight: '600',
    color: colors.secondaryText || '#888',
    letterSpacing: 0.2,
  },
  activeText: {
    color: colors.white || '#FFFFFF',
    fontWeight: '700',
  },
});

export default WebModeToggle;