/**
 * Transform helpers for the `react-native-device-info` (RNDI) compatibility layer.
 *
 * These keep `index.ts` terse: most RNDI getters are thin wrappers over a
 * synchronous value on the core `DeviceInfoModule` singleton.
 *
 * @module react-native-nitro-device-info/compat
 */

import type { PowerState } from '../DeviceInfo.nitro';

/**
 * Map describing which location providers are currently enabled.
 *
 * Mirrors RNDI's `LocationProviderInfo` (`internal/types.d.ts`).
 */
export interface LocationProviderInfo {
  [key: string]: boolean;
}

/**
 * Shared shape returned by RNDI's asynchronous hooks.
 *
 * Mirrors RNDI's `AsyncHookResult<T>` (`internal/types.d.ts`).
 */
export interface AsyncHookResult<T> {
  loading: boolean;
  result: T;
}

/**
 * Disk capacity buckets used by iOS when querying storage information.
 *
 * Mirrors RNDI's `AvailableCapacityType`. Accepted for signature parity; the
 * core has no per-bucket query, so the argument is ignored.
 */
export type AvailableCapacityType = 'total' | 'important' | 'opportunistic';

/**
 * Google Play Services App Set ID payload describing identifier and scope.
 *
 * Mirrors RNDI's `AppSetIdInfo`.
 */
export interface AppSetIdInfo {
  id: string;
  scope: number;
}

/**
 * Wrap a synchronous core accessor as an RNDI async getter.
 *
 * RNDI exposes most values as `Promise<T>`; the core returns them synchronously,
 * so we resolve immediately. The caller's `await` usage is preserved. `read` is
 * invoked inside the Promise chain so a thrown error becomes a rejected Promise
 * rather than a synchronous throw, honoring the async contract.
 */
export function asyncProp<T>(read: () => T): () => Promise<T> {
  return () => Promise.resolve().then(read);
}

/**
 * Wrap a synchronous core accessor as an RNDI sync getter.
 */
export function syncProp<T>(read: () => T): () => T {
  return () => read();
}

/**
 * Convert the core's `string[]` provider list to RNDI's `LocationProviderInfo`
 * map shape, e.g. `["gps", "network"]` -> `{ gps: true, network: true }`.
 */
export function providersArrayToMap(providers: string[]): LocationProviderInfo {
  const map: LocationProviderInfo = {};
  for (const provider of providers) {
    map[provider] = true;
  }
  return map;
}

/**
 * Wrap a bare hook value as RNDI's `AsyncHookResult<T>` (`{ loading, result }`).
 *
 * The core's accessory hooks resolve synchronously, so `loading` is always
 * `false` once a value is available.
 */
export function toAsyncHookResult<T>(result: T): AsyncHookResult<T> {
  return { loading: false, result };
}

export type { PowerState };
