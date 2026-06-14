// Expo resolves "react-native-nitro-device-info" to this file and require()s it
// synchronously as CommonJS, expecting module.exports to be the plugin function.
// The plugin is built to CommonJS under plugin/build (separate from the library's
// ESM-only bob output); .default unwraps the tsc esModuleInterop export.
module.exports = require('./plugin/build/withDeviceInfo').default;
