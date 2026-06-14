import { type ConfigPlugin, createRunOncePlugin, withPlugins } from '@expo/config-plugins';

import type { DeviceInfoPluginProps } from './types';
import { withSerialNumber } from './withSerialNumber';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../package.json') as { name: string; version: string };

const withDeviceInfo: ConfigPlugin<DeviceInfoPluginProps> = (config, props = {}) => {
  const plugins: ConfigPlugin[] = [];

  if (props.enableSerialNumber) {
    plugins.push(withSerialNumber);
  }

  return withPlugins(config, plugins);
};

// createRunOncePlugin keys on pkg.name, so listing the plugin more than once
// (or via autolinking + an explicit entry) applies the native changes once.
export default createRunOncePlugin(withDeviceInfo, pkg.name, pkg.version);
