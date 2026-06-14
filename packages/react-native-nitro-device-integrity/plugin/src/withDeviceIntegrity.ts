import { type ConfigPlugin, createRunOncePlugin, withPlugins } from '@expo/config-plugins';

import type { DeviceIntegrityPluginProps } from './types';
import { withAppAttestEntitlement } from './withAppAttestEntitlement';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../package.json') as { name: string; version: string };

const withDeviceIntegrity: ConfigPlugin<DeviceIntegrityPluginProps> = (config, props = {}) => {
  const plugins: ConfigPlugin[] = [];

  if (props.appAttest) {
    plugins.push(withAppAttestEntitlement);
  }

  return withPlugins(config, plugins);
};

export default createRunOncePlugin(withDeviceIntegrity, pkg.name, pkg.version);
