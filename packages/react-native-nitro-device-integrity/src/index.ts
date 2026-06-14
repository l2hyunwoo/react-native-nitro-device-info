/**
 * React Native Nitro Device Integrity
 *
 * Opt-in hardware-backed device attestation through Nitro's zero-overhead JSI
 * bindings. Android uses the Play Integrity API; iOS uses App Attest
 * (DCAppAttestService) and DeviceCheck (DCDevice).
 *
 * This package is a **token-issuing client only**. Tokens are opaque and must
 * be verified by your own backend — see the package README for the server-side
 * verification guide.
 *
 * @module react-native-nitro-device-integrity
 */

import { NitroModules } from 'react-native-nitro-modules';
import type {
  DeviceIntegrity,
  IntegrityProviderType,
} from './DeviceIntegrity.nitro';

/**
 * Create the DeviceIntegrity HybridObject instance.
 *
 * @example
 * ```typescript
 * import { createDeviceIntegrity } from 'react-native-nitro-device-integrity'
 *
 * const integrity = createDeviceIntegrity()
 * if (integrity.providerType === 'playIntegrity') {
 *   await integrity.prepareStandardProvider(myCloudProjectNumber)
 *   const token = await integrity.requestIntegrityToken(requestHashB64)
 * }
 * ```
 */
export function createDeviceIntegrity(): DeviceIntegrity {
  return NitroModules.createHybridObject<DeviceIntegrity>('DeviceIntegrity');
}

/**
 * Pre-created singleton instance for convenience.
 *
 * @example
 * ```typescript
 * import { DeviceIntegrityModule } from 'react-native-nitro-device-integrity'
 *
 * console.log(DeviceIntegrityModule.providerType)
 * ```
 */
export const DeviceIntegrityModule: DeviceIntegrity = createDeviceIntegrity();

// Re-export types for convenience
export type { DeviceIntegrity, IntegrityProviderType };
