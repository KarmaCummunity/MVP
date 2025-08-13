// File overview:
// - Purpose: Babel configuration for Expo app with module resolver and Reanimated plugin.
// - Notes: Aliases `tslib` to CJS build to ensure named exports, and enables Reanimated globals.
module.exports = function(api) {
  api.cache(true);
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
          extensions: ['.ts', '.tsx', '.js', '.jsx']
        }
      ],
      [
        'react-native-reanimated/plugin',
        {
          globals: ['__scanCodes'],
        },
      ],
    ],
  };
}; 