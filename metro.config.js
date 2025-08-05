const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Disable unstable package exports to prevent issues
defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig; 