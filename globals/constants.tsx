// Charities list moved to fakeData.ts file


// Motivational quotes moved to fakeData.ts file

export const FontSizes = {
    // --- General Text Sizes ---
    /** Smallest text size, often used for captions or fine print. */
    caption: 10,
    /** Typically used for secondary information, dates, or small labels. */
    small: 12,
    /** Standard body text size for most paragraphs and descriptions. */
    body: 14,
    /** Slightly larger text, often used for subheadings or prominent labels. */
    medium: 16,
    /** Larger text, suitable for section titles or important short phrases. */
    large: 18,
  
    // --- Heading Sizes ---
    /** Primary heading size for main screen titles. */
    heading1: 24,
    /** Secondary heading size for major sections. */
    heading2: 20,
    /** Tertiary heading size for subsections. */
    heading3: 18, // Can be same as 'large' if appropriate
    // --- Legacy/Compatibility ---
    /** Compatibility mapping for older screens expecting 'title' */
    title: 24,
  
    // --- UI Specific Sizes (if distinct from general text) ---
    /** Size for button text. */
    button: 14,
    /** Size for input field text. */
    input: 16,
    /** Size for tab bar labels. */
    tabLabel: 12,
    /** Size for icon labels that accompany text. */
    iconLabel: 12,
  
    // --- App-specific adjustments (if needed) ---
    /** For specific very large numbers or display text */
    displayLarge: 32,
    /** For very small UI elements */
    extraSmall: 8,
  };
 
// For searching 
export const filterOptions: string[] = [
  "חינוך",
  "בריאות",
  "רווחה",
  "סביבה",
  "בעלי חיים",
  "נוער בסיכון",
  "קשישים",
  "נכים",
  "חולים",
  "משפחות במצוקה",
  "עולים חדשים",
  "קהילה",
];

export const sortOptions: string[] = [
  "אלפביתי",
  "לפי מיקום",
  "לפי תחום",
  "לפי תאריך הקמה",
  "לפי מספר תורמים",
  "לפי דירוג",
  "לפי רלוונטיות",
];

export const filter_for_trumps: string[] = [
  'לפי מיקום',
  'לפי סוג תרומה',
  'לפי גיל',
  'לפי מגדר',
  'בחינם/בהשתתפות',
  'נסיעות עם ילדים',
]
export const menu_for_trumps: string[] = [
  'נסיעות קבועות',
  'נסיעות חד פעמיות',
  'נסיעות משותפות',
  'הובלות',
  'משלוחים',  
]

// WhatsApp groups details moved to fakeData.ts file
// All texts moved to texts.ts file

// Bubble Component Constants
export const BUBBLE_CONSTANTS = {
  NUM_BUBBLES: 30,
  MIN_SIZE: 50,
  MAX_SIZE: 150,
  MIN_NUMBER: 1,
  MAX_NUMBER: 100,
  ANIMATION_DURATION: 4000,
  ANIMATION_DELAY: 2000,
  OVERLAP_THRESHOLD: 2.5,
  MAX_ATTEMPTS: 1000,
  HEIGHT_OFFSET: 150,
  FONT_SIZE_RATIO: 7,
  NAME_SIZE_RATIO: 10,
  MIN_FONT_SIZE: 10,
  MIN_NAME_SIZE: 8,
  TEXT_SIZE_RATIO: 0.2,
  NAME_LINE_HEIGHT_RATIO: 1.2,
  MIN_FONT_SCALE: 0.5,
  MIN_NAME_SCALE: 0.3,
  MOVEMENT_BACKGROUND: 8,
  MOVEMENT_FOREGROUND: 5,
  OPACITY_BACKGROUND: 0.2,
  OPACITY_DEFAULT: 0.7,
  OPACITY_SELECTED: 1,
  SCALE_SELECTED: 1.1,
  SCALE_DEFAULT: 1,
  ANIMATION_DAMPING: 10,
  ANIMATION_STIFFNESS: 100,
  ANIMATION_DURATION_SHORT: 200,
  SHADOW_OPACITY: 0.1,
  SHADOW_OFFSET: -1,
  SHADOW_RADIUS: 3,
  MESSAGE_MARGIN_VERTICAL: 80,
  MESSAGE_MARGIN_HORIZONTAL: 20,
  MESSAGE_PADDING_HORIZONTAL: 5,
  MESSAGE_PADDING_VERTICAL: 8,
  MESSAGE_BORDER_RADIUS: 20,
  MESSAGE_SHADOW_OFFSET: 2,
  MESSAGE_SHADOW_OPACITY: 0.25,
  MESSAGE_SHADOW_RADIUS: 4,
  MESSAGE_OPACITY: 0.78,
  MESSAGE_ELEVATION: 1,
  TITLE_MARGIN_TOP: 10,
  TITLE_FONT_SIZE: 25,
};

// Animation constants
export const ANIMATION_CONSTANTS = {
  SPRING_CONFIG: {
    damping: 10,
    stiffness: 100,
  },
  TIMING_CONFIG: {
    duration: 300,
  },
  BUBBLE_MOVEMENT: {
    SLOW: 2000,
    MEDIUM: 3000,
    FAST: 4000,
  },
};

// Screen dimensions and layout constants
export const LAYOUT_CONSTANTS = {
  PANEL_OFFSET: 50,
  BOTTOM_NAV_HEIGHT: 80,
  TOP_BAR_HEIGHT: 60,
  BORDER_RADIUS: {
    SMALL: 8,
    MEDIUM: 15,
    LARGE: 20,
    XLARGE: 25,
  },
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
  },
  SHADOW: {
    LIGHT: {
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    MEDIUM: {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 5,
    },
    HEAVY: {
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 10,
    },
  },
};

// Categories for tasks and donations
export const categories = [
  'מזון', 'בגדים', 'חינוך', 'בריאות', 'סביבה', 'קשישים', 'ילדים', 'חיות', 'תרבות', 'ספורט', 'ייעוץ', 'תחבורה'
];

// Task priorities
export const priorities = [
  { value: 'low', label: 'נמוכה', color: '#4CAF50' },
  { value: 'medium', label: 'בינונית', color: '#FF9800' },
  { value: 'high', label: 'גבוהה', color: '#F44336' }
];

// Task statuses
export const statuses = [
  { value: 'pending', label: 'ממתין', color: '#FF9800' },
  { value: 'in_progress', label: 'בביצוע', color: '#2196F3' },
  { value: 'completed', label: 'הושלם', color: '#4CAF50' },
  { value: 'cancelled', label: 'בוטל', color: '#9E9E9E' }
];

// Component size constants
export const COMPONENT_SIZES = {
  AVATAR: {
    SMALL: 30,
    MEDIUM: 50,
    LARGE: 80,
    XLARGE: 120,
  },
  BUTTON_HEIGHT: {
    SMALL: 32,
    MEDIUM: 44,
    LARGE: 56,
  },
  INPUT_HEIGHT: {
    SMALL: 36,
    MEDIUM: 48,
    LARGE: 56,
  },
};

// API and network constants
export const API_CONSTANTS = {
  REQUEST_TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Validation constants
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_MESSAGE_LENGTH: 500,
  MAX_TITLE_LENGTH: 100,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
};

