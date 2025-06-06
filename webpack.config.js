// // webpack.config.js
// const createExpoWebpackConfigAsync = require('@expo/webpack-config');
// const path = require('path');

// module.exports = async function (env, argv) {
//   const config = await createExpoWebpackConfigAsync(env, argv);

//   // Add an alias to replace 'react-native-haptic-feedback' with our mock file
//   // when webpack builds for the web.
//   config.resolve.alias = {
//     ...(config.resolve.alias || {}), // Keep any existing aliases
//     // 'react-native-haptic-feedback': path.resolve(__dirname, './web/HapticFeedbackMock.js'),
//   };

//   return config;
// };
const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  // If you don't have other aliases, you can remove config.resolve.alias = { ... } entirely
  return config;
};