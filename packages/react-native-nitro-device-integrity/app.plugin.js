// Expo resolves "react-native-nitro-device-integrity" to this file and require()s
// it synchronously as CommonJS, expecting module.exports to be the plugin function.
// The plugin is built to CommonJS under plugin/build; .default unwraps the tsc
// esModuleInterop export.
module.exports = require('./plugin/build/withDeviceIntegrity').default;
