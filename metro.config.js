const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Add support for .cjs files which Firebase uses
defaultConfig.resolver.sourceExts.push('cjs');

// Disable unstable package exports to prevent issues
defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig; 