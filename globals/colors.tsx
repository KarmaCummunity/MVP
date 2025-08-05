// Color Constants

const colors = {
  // Primary Theme
  pink: '#FF6B9D',           // ורוד ראשי
  pinkLight: '#FFB3D1',      // ורוד בהיר
  pinkDark: '#E91E63',       // ורוד כהה
  orange: '#FF8A65',         // כתום ראשי
  orangeLight: '#FFCCBC',    // כתום בהיר
  orangeDark: '#FF5722',     // כתום כהה

  // Backgrounds
  backgroundPrimary: '#FFFFFF',      // רקע ראשי
  backgroundSecondary: '#FFF8F8',    // רקע משני (ורדרד)
  backgroundSecondaryPink: 'rgba(255, 235, 240, 0.9)',
  backgroundTertiary: '#FFF5F0',     // רקע שלישי (כתמתם)
  cardBackground: '#FFFFFF',         // רקע כרטיסים
  modalBackground: '#FFFFFF',        // רקע מודאלים

  // Text
  textPrimary: '#2C2C2C',     // טקסט ראשי
  textSecondary: '#666666',   // טקסט משני
  textTertiary: '#999999',    // טקסט שלישי
  textDisabled: '#CCCCCC',    // טקסט מושבת
  textPlaceholder: '#BBBBBB', // טקסט placeholder
  textInverse: '#FFFFFF',     // טקסט על רקע כהה

  // Status
  success: '#4CAF50',         // הצלחה
  successLight: '#E8F5E8',    // הצלחה בהיר
  error: '#F44336',           // שגיאה
  errorLight: '#FFEBEE',      // שגיאה בהיר
  warning: '#FF9800',         // אזהרה
  warningLight: '#FFF3E0',    // אזהרה בהיר
  info: '#2196F3',            // מידע
  infoLight: '#E3F2FD',       // מידע בהיר

  // Border
  border: '#E8E8E8',          // גבול ראשי
  borderSecondary: '#F0F0F0', // גבול משני
  borderAccent: '#FFB3D1',    // גבול ורוד
  borderFocus: '#FF8A65',     // גבול כתום

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
  buttonPrimary: '#FF6B9D',
  buttonPrimaryPressed: '#E91E63',
  buttonSecondary: '#FF8A65',
  buttonSecondaryPressed: '#FF5722',
  buttonDisabled: '#E0E0E0',
  buttonText: '#FFFFFF',
  buttonTextDisabled: '#999999',

  // Input
  inputBackground: '#FFFFFF',
  inputBorder: '#E8E8E8',
  inputBorderFocus: '#FF8A65',
  inputPlaceholder: '#BBBBBB',
  inputText: '#2C2C2C',

  // Navigation
  navigationBackground: '#FFFFFF',
  navigationBorder: '#E8E8E8',
  navigationActive: '#FF6B9D',
  navigationInactive: '#999999',
  
  // Bottom Navigation
  bottomNavBackground: 'rgba(255, 255, 255, 0.65)',
  bottomNavActive: '#FF6B9D',
  bottomNavInactive: 'rgba(0, 0, 0, 0.8)',
  bottomNavShadow: 'rgba(0, 0, 0, 0.1)',

  // Top Navigation
  topNavBackground: 'rgba(255, 255, 255, 0.8)',
  topNavTitle: 'rgba(44, 44, 44, 0.9)',
  topNavIcon: 'rgba(0, 0, 0, 0.7)',
  topNavShadow: 'rgba(0, 0, 0, 0.08)',

  // Chat
  chatSent: '#FF6B9D',
  chatReceived: '#F0F0F0',
  chatText: '#2C2C2C',
  chatTime: '#999999',

  // Donation
  donationMoney: '#4CAF50',
  donationTime: '#FF8A65',
  donationKnowledge: '#2196F3',
  donationItems: '#9C27B0',

  // Utility
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
  clear: 'rgba(0, 0, 0, 0)',

  // Legacy compatibility (for existing code)
  text: '#2C2C2C',           // Alias for textPrimary
  primary: '#FF6B9D',        // Alias for pink
  background: '#FFFFFF',     // Alias for backgroundPrimary
  shadow: 'rgba(0, 0, 0, 0.1)', // Alias for shadowLight
  danger: '#F44336',         // Alias for error
  accent: '#FF8A65',         // Alias for orange
  offWhite: '#F8F8F8',       // Alias for legacyOffWhite
  lightGray: '#F5F5F5',      // Alias for legacyLightGray
  blue: '#2196F3',           // Alias for info

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
