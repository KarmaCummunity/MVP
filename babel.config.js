// File overview:
// - Purpose: Babel configuration for Expo app with module resolver and Reanimated plugin.
// - Notes: Aliases `tslib` to CJS build to ensure named exports, and enables Reanimated globals.
// IMPORTANT: react-native-reanimated/plugin MUST be last in the plugins array
module.exports = function(api) {
  api.cache(true); // Re-enable cache for performance
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            // Resolve to CJS build that exposes named exports on module.exports
            tslib: 'tslib/tslib.js',
          },
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']
        }
      ],
      // CRITICAL: react-native-reanimated/plugin MUST be the last plugin
      [
        'react-native-reanimated/plugin',
        {
          // Disable globals to avoid circular dependency issues on web
          globals: [],
        },
      ],
    ],
  };
}; 