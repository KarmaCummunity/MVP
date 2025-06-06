// components/SettingsItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Or any other icon set you prefer
import colors from '../globals/colors'; // Adjust path

// Define types for the different kinds of settings items
type SettingItemType = 'navigate' | 'toggle' | 'button' | 'value';

interface SettingsItemProps {
  title: string;
  description?: string;
  iconName?: string; // Icon to display on the left
  type: SettingItemType;
  onPress?: () => void; // For 'navigate' and 'button' types
  value?: boolean; // For 'toggle' type
  onValueChange?: (newValue: boolean) => void; // For 'toggle' type
  displayValue?: string; // For 'value' type (e.g., "English" for Language)
  isDestructive?: boolean; // For buttons like "Delete Account"
  children?: React.ReactNode; // For more complex custom content
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  title,
  description,
  iconName,
  type,
  onPress,
  value,
  onValueChange,
  displayValue,
  isDestructive,
  children,
}) => {
  const textColor = isDestructive ? colors.danger : colors.textPrimary;

  const renderContent = () => {
    switch (type) {
      case 'toggle':
        return (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: colors.border, true: colors.blue }}
            thumbColor={value ? colors.blue : colors.backgroundSecondary}
            ios_backgroundColor={colors.border}
          />
        );
      case 'value':
        return (
          <Text style={styles.valueText}>
            {displayValue}
            {Platform.OS === 'web' && <Icon name="chevron-forward-outline" size={20} color={colors.textSecondary} style={styles.webChevron}/>}
          </Text>
        );
      case 'navigate':
        return (
          <Icon name="chevron-forward-outline" size={20} color={colors.textSecondary} />
        );
      case 'button':
        return null; // Button content is handled by the title itself inside TouchableOpacity
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, type === 'button' && styles.buttonItem]}
      onPress={onPress}
      disabled={!onPress && type !== 'toggle'} // Disable if no action and not a toggle
      activeOpacity={type === 'toggle' ? 1 : 0.7} // No active opacity for toggle
    >
      {iconName && (
        <Icon name={iconName} size={24} color={textColor} style={styles.icon} />
      )}
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      <View style={styles.rightContent}>
        {renderContent()}
        {children} {/* Render any custom children passed */}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse', // For RTL layout
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    writingDirection: 'rtl', // For RTL
    textAlign: 'right', // For RTL
  },
  buttonItem: {
    justifyContent: 'center',
  },
  icon: {
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rightContent: {
    marginLeft: 'auto', // Push content to the right
    flexDirection: 'row', // Align content and chevron
    textAlign: 'right', // For rtl
    writingDirection: 'rtl', // For RTL
    alignItems: 'center',
  },
  valueText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginRight: Platform.OS === 'web' ? -5 : 0, // Adjust for web chevron position
  },
  webChevron: {
    marginLeft: 5, // Space between value text and chevron on web
  }
});

export default SettingsItem;