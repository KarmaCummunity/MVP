// Color Constants

const colors = {
  // Primary Neutrals
  white: '#FFFFFF',
  black: '#000000',
  green: '#28A745', // A standard green, often used for success actions
  blue: '#007BFF', // A standard blue, often used for primary actions
  lightGray: '#EEEEEE',
  mediumGray: '#666666',
  darkGray: '#333333',
  offWhite: '#F8F5F0', // A warm off-white, often used for backgrounds

  // Oranges & Pinks (App-specific palette)
  lightOrange: '#FFE5D2', // Very light orange, good for subtle backgrounds
  mediumOrange: '#FF9966', // A standard orange
  darkOrange: '#E79D7F', // Muted, earthy orange
  vibrantOrange: '#FA815D', // Bright, eye-catching orange
  accentOrange: '#FF7A5A', // A lively accent orange
  peach: '#FFB19A', // Soft, light orange-pink
  pink: '#FFEAF4', // Very light pink, often for backgrounds
  darkPink: '#F06292', // A strong, darker pink

  // General UI Colors (can be mapped to the app's palette if desired)
  primary: '#007BFF', // A general app primary color (currently not used but kept for general app design)
  secondary: '#6c757d', // Muted secondary color (currently not used)
  accent: '#28a745', // For success, active states (currently not used)
  danger: '#dc3545', // For destructive actions (currently not used)

  // Backgrounds
  backgroundPrimary: '#FFE5D2', // Primary screen background, matches lightOrange
  backgroundSecondary: '#FFF0E0', // Secondary background, e.g., for cards

  // Text Colors
  textPrimary: '#333333', // Primary text color, matches darkGray
  textSecondary: '#6c757d', // Muted text color (currently not used)

  // Borders
  border: '#dee2e6', // General border color (currently not used)
  headerBorder: '#F2CDDB', // Specific border for headers

    // Priority badge colors
    priorityHigh: '#FF6B6B',      // Red for High priority tasks
    priorityMedium: '#FFD166',    // Yellow/Orange for Medium priority tasks
    priorityLow: '#6FCF97',       // Green for Low priority tasks
    priorityDefault: '#CCCCCC',   // Default color for undefined priority
  
    // Switch component colors
    switchTrackFalse: '#767577',  // Color when switch is OFF
    switchTrackTrue: '#81b0ff',   // Color when switch is ON
    switchThumbCompleted: '#f5dd4b', // Thumb color when task is completed
    switchThumbDefault: '#f4f3f4',   // Default thumb color for switch
  
    // Task item specific colors
    completedBackground: '#F0F0F0', // Background for completed tasks
    completedText: '#888888',       // Text color for completed task titles
    deleteRed: '#D85151',           // Color for the delete icon
};

export default colors;