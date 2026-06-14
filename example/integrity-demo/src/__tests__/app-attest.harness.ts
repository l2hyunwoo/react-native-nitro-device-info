/**
 * E2E Tests: App Attest + DeviceCheck (iOS)
 *
 * On Android these iOS-only methods must reject with UNSUPPORTED_PLATFORM.
 * On the iOS Simulator App Attest is unsupported, so generateKey rejects too.
 * On a real iOS device generateKey would succeed, but attest/assert need a
 * server challenge and configured signing, so token success is NOT asserted.
 */

import { describe, test, expect } from 'react-native-harness';
import { Platform } from 'react-native';
import { createDeviceIntegrity } from 'react-native-nitro-device-integrity';

const integrity = createDeviceIntegrity();

async function expectRejection(p: Promise<unknown>): Promise<string> {
  try {
    await p;
  } catch (e) {
    return e instanceof Error ? e.message : String(e);
  }
  throw new Error('expected promise to reject, but it resolved');
}

describe('App Attest / DeviceCheck (iOS-only)', () => {
  test('generateKey rejects on Android', async () => {
    if (Platform.OS !== 'android') return;
    const message = await expectRejection(integrity.generateKey());
    expect(message).toContain('UNSUPPORTED_PLATFORM');
  });

  test('attestKey rejects on Android', async () => {
    if (Platform.OS !== 'android') return;
    const message = await expectRejection(
      integrity.attestKey('key', 'aGFzaA==')
    );
    expect(message).toContain('UNSUPPORTED_PLATFORM');
  });

  test('generateAssertion rejects on Android', async () => {
    if (Platform.OS !== 'android') return;
    const message = await expectRejection(
      integrity.generateAssertion('key', 'aGFzaA==')
    );
    expect(message).toContain('UNSUPPORTED_PLATFORM');
  });

  test('getDeviceCheckToken rejects on Android', async () => {
    if (Platform.OS !== 'android') return;
    const message = await expectRejection(integrity.getDeviceCheckToken());
    expect(message).toContain('UNSUPPORTED_PLATFORM');
  });

  test('attestKey rejects an invalid base64 clientDataHash on iOS', async () => {
    if (Platform.OS !== 'ios') return;
    // Only meaningful where App Attest is supported; on the Simulator the
    // unsupported guard fires first. Either rejection message is acceptable.
    const message = await expectRejection(
      integrity.attestKey('some-key-id', 'not valid base64!!')
    );
    expect(
      message.includes('INVALID_BASE64') || message.includes('App Attest')
    ).toBe(true);
  });
});
