/**
 * E2E Tests: Attestation provider availability
 *
 * Deterministic on a real device. On a physical Android device with Google
 * Play Services, the provider is Play Integrity and isSupported is true. On the
 * iOS Simulator, App Attest is unsupported.
 */

import { describe, test, expect } from 'react-native-harness';
import { Platform } from 'react-native';
import { createDeviceIntegrity } from 'react-native-nitro-device-integrity';

const integrity = createDeviceIntegrity();

describe('Attestation availability', () => {
  test('providerType is a known value', () => {
    const type = integrity.providerType;
    expect(['playIntegrity', 'appAttest', 'unsupported']).toContain(type);
  });

  test('isSupported is a boolean', () => {
    expect(typeof integrity.isSupported).toBe('boolean');
  });

  test('providerType matches the platform', () => {
    const type = integrity.providerType;
    if (Platform.OS === 'android') {
      // Physical devices with Play Services report playIntegrity; devices
      // without GMS report unsupported. Never appAttest.
      expect(['playIntegrity', 'unsupported']).toContain(type);
    } else {
      // iOS: appAttest on a real device, unsupported on the Simulator.
      expect(['appAttest', 'unsupported']).toContain(type);
    }
  });

  test('isSupported agrees with providerType', () => {
    // unsupported provider must mean not supported, and vice versa.
    expect(integrity.isSupported).toBe(integrity.providerType !== 'unsupported');
  });

  test('unsupported iOS rejects key generation', async () => {
    if (Platform.OS !== 'ios' || integrity.isSupported) return;
    let message = '';
    try {
      await integrity.generateKey();
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    expect(message).toContain('UNSUPPORTED_PLATFORM');
  });
});
