// Color Constants

// TODO: Create proper color design system with semantic naming
// TODO: Reduce color duplication - many similar shades can be consolidated
// TODO: Add dark mode color variants
// TODO: Implement proper accessibility contrast ratios (WCAG AA/AAA)
// TODO: Create color palette generator/validator tool
// TODO: Remove legacy colors after migration is complete
// TODO: Add proper TypeScript interfaces for color types
// TODO: Implement dynamic theming system
// TODO: Add color documentation and usage guidelines
// TODO: Create proper color testing and validation

const colors = {
  // Primary Theme - Updated to match pink_logo.png
  pink: '#FF69B4',         // Hot pink from logo
  pinkLight: '#FFB6C1',    // Light pink 
  pinkDark: '#C71585',     // Deep pink
  blue: '#4169E1',         // Royal blue from logo  
  blueLight: '#87CEEB',    // Sky blue/turquoise
  blueDark: '#0000CD',     // Medium blue
  green: '#90EE90',        // Light green from logo
  orange: '#FF8A65',       // Keeping some orange as accent
  orangeLight: '#FFCCBC',
  orangeDark: '#FF5722',

  // Backgrounds
  backgroundPrimary: '#FFFFFF',      // רקע ראשי
  backgroundSecondary: '#F0F8FF', // רקע משני (כחול בהיר יותר)
  backgroundSecondary_2: '#E6F3FF', // רקע משני (כחול בהיר)
  backgroundSecondaryPink: 'rgba(255, 182, 193, 0.9)', // Updated to match new pink
  backgroundTertiary: '#F0FFFF',     // רקע שלישי (תכלת בהיר)
  cardBackground: '#FFFFFF',         // רקע כרטיסים
  modalBackground: '#FFFFFF',        // רקע מודאלים

  // Text
  textPrimary: '#2C2C2C',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textDisabled: '#CCCCCC',
  textPlaceholder: '#BBBBBB',
  textInverse: '#FFFFFF',

  // Status
  success: '#4CAF50',
  successLight: '#E8F5E8',
  error: '#F44336',
  errorLight: '#FFEBEE',
  warning: '#FF9800',
  warningLight: '#FFF3E0',
  info: '#4169E1',         // Updated to royal blue
  infoLight: '#E3F2FD',

  // Border
  border: '#E8E8E8',
  borderSecondary: '#F0F0F0',
  borderAccent: '#FFB3D1',
  borderFocus: '#FF8A65',

  // Shadow
  shadowLight: 'rgba(0, 0, 0, 0.1)',
  shadowMedium: 'rgba(0, 0, 0, 0.2)',
  shadowDark: 'rgba(0, 0, 0, 0.3)',
  shadowColored: 'rgba(255, 107, 157, 0.2)',

  // Overlay
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayMedium: 'rgba(0, 0, 0, 0.5)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  overlayColored: 'rgba(255, 107, 157, 0.1)',

  // Button
  buttonPrimary: '#FF69B4',        // Hot pink
  buttonPrimaryPressed: '#C71585', // Deep pink
  buttonSecondary: '#4169E1',      // Royal blue
  buttonSecondaryPressed: '#0000CD', // Medium blue
  buttonDisabled: '#E0E0E0',
  buttonText: '#FFFFFF',
  buttonTextDisabled: '#999999',

  // Input
  inputBackground: '#FFFFFF',
  inputBorder: '#E8E8E8',
  inputBorderFocus: '#4169E1',     // Royal blue focus
  inputPlaceholder: '#BBBBBB',
  inputText: '#2C2C2C',

  // Navigation
  navigationBackground: '#FFFFFF',
  navigationBorder: '#E8E8E8',
  navigationActive: '#FF69B4',     // Hot pink
  navigationInactive: '#999999',

  // Bottom Navigation
  bottomNavBackground: 'rgba(255, 255, 255, 0.65)',
  bottomNavActive: '#FF69B4',      // Hot pink
  bottomNavInactive: 'rgba(0, 0, 0, 0.8)',
  bottomNavShadow: 'rgba(0, 0, 0, 0.1)',

  // Top Navigation
  topNavBackground: 'rgba(255, 255, 255, 0.8)',
  topNavTitle: 'rgba(44, 44, 44, 0.9)',
  topNavIcon: 'rgba(0, 0, 0, 0.7)',
  topNavShadow: 'rgba(0, 0, 0, 0.08)',

  // Chat
  chatSent: '#FF69B4',             // Hot pink
  chatReceived: '#F0F0F0',
  chatText: '#2C2C2C',
  chatTime: '#999999',

  // Donation
  donationMoney: '#4CAF50',
  donationTime: '#4169E1',          // Royal blue
  donationKnowledge: '#87CEEB',    // Sky blue
  donationItems: '#9C27B0',

  // Category Cards (unified styling for Donations categories)
  categoryCardBackground: '#F6F9FC',
  categoryIconBackground: '#7A93B2',
  categoryBorder: '#E5EDF6',

  // Utility
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
  clear: 'rgba(0, 0, 0, 0)',

  // Legacy compatibility (for existing code)
  // TODO: URGENT - Remove all legacy color aliases after migration
  // TODO: Update all components to use semantic color names
  text: '#2C2C2C',           // Alias for textPrimary
  primary: '#FF69B4',        // Alias for pink - updated
  secondary: '#FFB6C1',      // Alias for pinkLight
  background: '#FFFFFF',     // Alias for backgroundPrimary
  shadow: 'rgba(0, 0, 0, 0.1)', // Alias for shadowLight
  danger: '#F44336',         // Alias for error
  accent: '#FF8A65',         // Alias for orange
  offWhite: '#F8F8F8',       // Alias for legacyOffWhite
  lightGray: '#F5F5F5',      // Alias for legacyLightGray

  // Money Screen Specific Colors
  moneyFormBackground: 'rgba(255, 235, 240, 0.9)',
  moneyFormBorder: 'rgba(255, 200, 210, 0.7)',
  moneyInputBackground: 'rgba(255, 255, 255, 0.95)',
  moneyButtonBackground: 'rgba(255, 140, 105, 0.8)',
  moneyButtonSelected: 'rgba(255, 182, 193, 0.8)',
  moneyCardBackground: 'rgba(255, 235, 240, 0.9)',
  moneyHistoryAmount: 'rgba(255, 140, 105, 0.9)',
  moneyStatusBackground: 'rgba(144, 238, 144, 0.8)',
  moneyStatusText: 'rgba(0, 100, 0, 0.9)',

  // Header Components Colors
  headerBackground: 'rgba(255, 255, 255, 0.8)',
  headerBorder: 'rgba(232, 232, 232, 0.6)',
  headerTitleText: 'rgba(44, 44, 44, 0.8)',
  searchBackground: 'rgba(248, 248, 248, 0.9)',
  searchBorder: 'rgba(232, 232, 232, 0.7)',
  searchText: 'rgba(44, 44, 44, 0.9)',
  searchPlaceholder: 'rgba(187, 187, 187, 0.8)',
  menuBackground: 'rgba(255, 255, 255, 0.95)',
  menuBorder: 'rgba(232, 232, 232, 0.8)',
  menuText: 'rgba(44, 44, 44, 0.9)',
  toggleBackground: 'rgba(248, 248, 248, 0.9)',
  toggleActive: 'rgba(255, 107, 157, 0.8)',
  toggleInactive: 'rgba(255, 138, 101, 0.8)',
  toggleText: 'rgba(0, 0, 0, 0.95)',

  // Autocomplete Dropdown Colors
  dropdownLabel: '#333333',
  dropdownBackground: '#FFFFFF',
  dropdownBorder: '#DDDDDD',
  dropdownText: '#333333',
  dropdownPlaceholder: '#999999',
  dropdownIcon: '#666666',
  dropdownSearchIcon: '#888888',
  dropdownCloseIcon: '#666666',
  dropdownModalOverlay: 'rgba(0, 0, 0, 0.4)',
  dropdownModalBackground: '#FFFFFF',
  dropdownSearchBorder: '#EEEEEE',
  dropdownOptionBorder: '#EEEEEE',
  dropdownNoOptionsText: '#777777',

  // Bubble Component Colors
  bubbleBackground: 'rgba(100, 255, 255, 0.9)',
  bubbleBackgroundSelected: 'rgba(250, 220, 220, 0.9)',
  bubbleBackgroundDefault: 'rgba(173, 216, 255, 0.8)',
  bubbleBackgroundInactive: 'rgba(0, 230, 255, 0.2)',
  bubbleBorderSelected: 'rgba(0, 0, 0, 1)',
  bubbleBorderDefault: 'rgba(255, 255, 255, 0.9)',
  bubbleBorderInactive: 'rgba(255, 255, 255, 0.5)',
  bubbleTextSelected: '#333333',
  bubbleTextDefault: '#000000',
  bubbleNameSelected: '#555555',
  bubbleNameDefault: '#000000',
  bubbleShadow: '#ffffff',
  messageBackground: '#F5F5F5',
  messageShadow: '#000000',

  // Legacy (לשימוש זמני במעבר)
  legacyGreen: '#4CAF50',
  legacyBlue: '#2196F3',
  legacyLightGray: '#F5F5F5',
  legacyMediumGray: '#9E9E9E',
  legacyDarkGray: '#424242',
  legacyOffWhite: '#F8F8F8',
  legacyLightOrange: '#FFE0B2',
  legacyMediumOrange: '#FFB74D',
  legacyDarkOrange: '#FF9800',
  legacyLightBlue: '#E3F2FD',
  legacyMediumBlue: '#64B5F6',
  legacyDarkBlue: '#1976D2',
  legacyLightGreen: '#E8F5E9',
  legacyMediumGreen: '#81C784',
  legacyDarkGreen: '#388E3C',
  legacyLightRed: '#FFEBEE',
  legacyMediumRed: '#EF5350',
  legacyDarkRed: '#D32F2F',
  legacyLightYellow: '#FFF8E1',
  legacyMediumYellow: '#FFD54F',
  legacyDarkYellow: '#FFC107',
  legacyLightPurple: '#F3E5F5',
  legacyMediumPurple: '#BA68C8',
  legacyDarkPurple: '#7B1FA2',
  legacyLightPink: '#FCE4EC',
  legacyMediumPink: '#F06292',
  legacyDarkPink: '#C2185B',
  legacyDeleteRed: '#FF0000',
};

export default colors;
