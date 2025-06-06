// web/HapticFeedbackMock.js
// This file acts as a dummy replacement for react-native-haptic-feedback when building for web.

const HapticFeedback = {
    trigger: (type, options) => {
      // On web, haptic feedback isn't natively supported like on mobile.
      // So, we just create a dummy function that does nothing.
      // console.log(`Haptic feedback triggered: ${type} (mocked for web)`);
    },
    // If the original library exports other functions (e.g., isSupported),
    // you might need to add them here as no-ops too to prevent errors.
    // Example: isSupported: () => false,
  };
  
  // To satisfy TypeScript's import for `HapticFeedbackTypes`,
  // we export a dummy object. The actual type checking relies on the
  // `SpecificHapticType` you defined in TodoListScreen.tsx.
  export const HapticFeedbackTypes = {};
  
  export default HapticFeedback;