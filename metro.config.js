const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix nanoid resolution issue
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'nanoid/non-secure' || moduleName.startsWith('nanoid/')) {
    return context.resolveRequest(context, 'nanoid', platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
