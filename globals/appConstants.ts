/**
 * Unified Application Constants
 * Central configuration file for all application constants, types, and enums
 * Organized by functional areas for better maintainability
 */

// ====================================
// DONATION CATEGORIES & TYPES
// ====================================

export const donationCategories = [
  'כסף',          // Money
  'חפצים',        // Items/Objects  
  'זמן',          // Time
  'ידע',          // Knowledge
  'תחבורה',       // Transportation
  'מזון',         // Food
  'בגדים',        // Clothing
  'רהיטים',       // Furniture
  'משחקים',       // Games/Toys
  'ספרים',        // Books
  'טכנולוגיה',    // Technology
  'אמנות',        // Art
  'מוזיקה',       // Music
  'ספורט',        // Sports
  'בעלי חיים',    // Animals
  'צמחים',        // Plants
  'אירועים',      // Events
  'בריאות',       // Health/Medical
  'משפחה',        // Family
  'חינוך',        // Education
  'סביבה',        // Environment
  'קשישים',       // Elderly
  'ילדים',        // Children
  'חיות',         // Animals (alt)
  'תרבות',        // Culture
  'ייעוץ'         // Consultation/Advice
] as const;

export type DonationCategory = typeof donationCategories[number];

export const donationTypes = [
  'money',    // כסף
  'item',     // חפץ
  'service',  // שירות
  'time',     // זמן
  'knowledge' // ידע
] as const;

export type DonationType = typeof donationTypes[number];

export const helpTypes = [
  'money',      // כסף
  'item',       // חפץ
  'service',    // שירות
  'time',       // זמן
  'knowledge',  // ידע
  'transport'   // תחבורה
] as const;

export type HelpType = typeof helpTypes[number];

// ====================================
// TASK MANAGEMENT
// ====================================

export const taskPriorities = [
  { value: 'low', label: 'נמוכה', color: '#4CAF50' },
  { value: 'medium', label: 'בינונית', color: '#FF9800' },
  { value: 'high', label: 'גבוהה', color: '#F44336' }
] as const;

export const taskStatuses = [
  { value: 'pending', label: 'ממתין', color: '#FF9800' },
  { value: 'in_progress', label: 'בביצוע', color: '#2196F3' },
  { value: 'completed', label: 'הושלם', color: '#4CAF50' },
  { value: 'cancelled', label: 'בוטל', color: '#9E9E9E' }
] as const;

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

// ====================================
// USER & PROFILE SETTINGS
// ====================================

export const userRoles = [
  'user',         // משתמש רגיל
  'admin',        // מנהל
  'moderator',    // מנהל קהילה
  'organization', // עמותה
  'donor',        // תורם
  'volunteer',    // מתנדב
  'recipient',    // מקבל עזרה
  'student',      // סטודנט
  'professional', // איש מקצוע
  'driver',       // נהג
  'developer',    // מפתח
  'artist'        // אמן
] as const;

export type UserRole = typeof userRoles[number];

export const privacyLevels = ['public', 'private', 'friends'] as const;
export type PrivacyLevel = typeof privacyLevels[number];

export const languages = ['he', 'en', 'ar', 'ru'] as const;
export type Language = typeof languages[number];

export const notificationTypes = [
  'message',  // הודעה
  'like',     // לייק
  'comment',  // תגובה
  'follow',   // עקיבה
  'system'    // מערכת
] as const;

export type NotificationType = typeof notificationTypes[number];

// ====================================
// UI & DESIGN CONSTANTS
// ====================================

export const iconSizes = {
  xxxsmall: 12,
  xxsmall: 16,
  xsmall: 20,
  small: 24,
  medium: 32,
  large: 48,
  xlarge: 56,
  xxlarge: 64,
} as const;

export const fontSizes = {
  // General Text Sizes
  caption: 10,     // כיתוב זעיר
  small: 12,       // טקסט קטן
  body: 14,        // גוף הטקסט
  medium: 16,      // בינוני
  large: 18,       // גדול

  // Heading Sizes  
  heading1: 24,    // כותרת ראשית
  heading2: 20,    // כותרת משנית
  heading3: 18,    // כותרת שלישית
  title: 24,       // תואם heading1
  
  // Display Sizes
  displayLarge: 32, // גדלים גדולים (אמוג'י, אייקונים)
  displayMedium: 28,
  displaySmall: 24,
  
  // Button and Interactive Elements
  button: 16,      // כפתורים
  link: 14,        // קישורים
  label: 14,       // תוויות
} as const;

export const layoutConstants = {
  // Screen Padding
  screenPadding: 16,
  sectionSpacing: 24,
  cardSpacing: 12,
  
  // Border Radius
  borderRadiusSmall: 8,
  borderRadiusMedium: 12,
  borderRadiusLarge: 16,
  
  // Component Heights
  buttonHeight: 48,
  inputHeight: 44,
  tabBarHeight: 60,
  headerHeight: 56,
  
  // Grid & Layout
  gridSpacing: 8,
  listItemHeight: 60,
  
  // Spacing (for backward compatibility with old styles.tsx)
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
  },
  
  // Panel and Layout Constants (from old constants.tsx)
  PANEL_OFFSET: 50,
  BOTTOM_NAV_HEIGHT: 80,
  TOP_BAR_HEIGHT: 60,
  BORDER_RADIUS: {
    SMALL: 8,
    MEDIUM: 12,
    LARGE: 16,
  },
} as const;

// ====================================
// SEARCH & FILTER OPTIONS
// ====================================

export const filterOptions = [
  'הכל',           // All
  'חדש',           // New
  'פופולרי',        // Popular
  'בקרבתי',        // Near me
  'דחוף',          // Urgent
  'השבוע',         // This week
  'החודש',         // This month
  'בעמותות',       // Organizations
  'פרטיים',        // Private individuals
  'מאושר',         // Verified
] as const;

export const sortOptions = [
  'חדש ביותר',     // Newest
  'ישן ביותר',     // Oldest
  'הכי רלוונטי',   // Most relevant
  'הכי קרוב',      // Closest
  'הכי פופולרי',   // Most popular
  'הכי דחוף',      // Most urgent
] as const;

// Transportation/Trump specific filters and menus
export const filterForTrumps = [
  'לפי מיקום',
  'לפי סוג תרומה', 
  'לפי גיל',
  'לפי מגדר',
  'בחינם/בהשתתפות',
] as const;

export const menuForTrumps = [
  'נסיעות קבועות',
  'נסיעות חד פעמיות', 
  'נסיעות משותפות',
  'הובלות',
  'משלוחים',
] as const;

// ====================================
// ANIMATION & INTERACTION
// ====================================

export const animationConstants = {
  // Duration (milliseconds)
  fast: 200,
  normal: 300,
  slow: 500,
  
  // Spring Animation
  springConfig: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  
  // Bubble Animation
  bubbleFloatSpeed: 0.5,
  bubblePulseSpeed: 2000,
} as const;

// Bubble display constants
export const bubbleConstants = {
  NUM_BUBBLES: 30,
  MIN_SIZE: 50,
  MAX_SIZE: 150,
  MIN_NUMBER: 1,
  MAX_NUMBER: 100,
  FLOAT_SPEED: 0.5,
  PULSE_DURATION: 2000,
  BACKGROUND_OPACITY: 0.3,
} as const;

// ====================================
// COMPONENT DIMENSIONS
// ====================================

export const componentSizes = {
  // Cards
  cardMinHeight: 120,
  cardMaxHeight: 300,
  
  // Buttons
  buttonSmall: 32,
  buttonMedium: 40,
  buttonLarge: 48,
  
  // Avatar Sizes
  avatarSmall: 32,
  avatarMedium: 48,
  avatarLarge: 64,
  avatarXLarge: 80,
  
  // Modal
  modalMaxWidth: 400,
  modalPadding: 24,
} as const;

// ====================================
// VALIDATION RULES
// ====================================

export const validation = {
  // Text Limits
  minUsernameLength: 2,
  maxUsernameLength: 50,
  minPasswordLength: 6,
  maxDescriptionLength: 500,
  maxBioLength: 200,
  
  // File Sizes (bytes)
  maxImageSize: 5 * 1024 * 1024, // 5MB
  maxVideoSize: 50 * 1024 * 1024, // 50MB
  
  // Other Limits
  maxTagsCount: 10,
  maxInterestsCount: 15,
} as const;

// ====================================
// API & EXTERNAL CONSTANTS
// ====================================

export const apiConstants = {
  timeout: 10000,           // 10 seconds
  retryAttempts: 3,
  cacheDuration: 300000,    // 5 minutes
  
  // Endpoints
  defaultPageSize: 20,
  maxPageSize: 100,
} as const;

// ====================================
// LEGACY SUPPORT (for backward compatibility)
// ====================================

// Export individual arrays for components still using them
export const categories = donationCategories;

// Re-export common constants with original names (for backward compatibility)
export const IconSizes = iconSizes;
export const FontSizes = fontSizes;
export const LAYOUT_CONSTANTS = layoutConstants;
export const ANIMATION_CONSTANTS = animationConstants;
export const BUBBLE_CONSTANTS = bubbleConstants;
export const COMPONENT_SIZES = componentSizes;
export const API_CONSTANTS = apiConstants;
export const VALIDATION = validation;

// Trump/Transportation specific legacy exports
export const filter_for_trumps = filterForTrumps;
export const menu_for_trumps = menuForTrumps;

// Default exports for convenience
export default {
  // Core Data
  donationCategories,
  donationTypes,
  helpTypes,
  taskPriorities,
  taskStatuses,
  userRoles,
  privacyLevels,
  languages,
  notificationTypes,
  
  // UI Constants
  iconSizes,
  fontSizes,
  layoutConstants,
  animationConstants,
  bubbleConstants,
  componentSizes,
  
  // Filters & Options
  filterOptions,
  sortOptions,
  filterForTrumps,
  menuForTrumps,
  
  // System
  validation,
  apiConstants,
} as const;
