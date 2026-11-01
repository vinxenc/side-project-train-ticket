const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// three >= 0.186: require('three') resolves to build/three.cjs, a Node-only shim
// that calls process.emitWarning (missing in React Native). R3F native's CJS build
// requires 'three', so resolve it as an ESM import instead.
config.resolver.resolveRequest = (context, moduleName, platform) =>
  context.resolveRequest(
    moduleName === 'three' ? { ...context, isESMImport: true } : context,
    moduleName,
    platform,
  );

module.exports = config;
