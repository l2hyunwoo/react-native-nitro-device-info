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

  test('App Attest rejects malformed base64 on iOS, including the Simulator', async () => {
    if (Platform.OS !== 'ios') return;
    for (const invoke of [
      () => integrity.attestKey('key', 'not valid base64!!'),
      () => integrity.generateAssertion('key', 'not valid base64!!'),
    ]) {
      expect(await expectRejection(invoke())).toContain('INVALID_BASE64');
    }
  });

  test('App Attest rejects hashes that do not decode to 32 bytes on iOS', async () => {
    if (Platform.OS !== 'ios') return;
    for (const hash of ['', 'AA==', `${'A'.repeat(42)}==`, 'A'.repeat(44)]) {
      for (const invoke of [
        () => integrity.attestKey('key', hash),
        () => integrity.generateAssertion('key', hash),
      ]) {
        const message = await expectRejection(invoke());
        expect(message).toContain('INVALID_INPUT');
        expect(message).toContain('32-byte SHA-256 digest');
      }
    }
  });

  test('valid hash on unsupported iOS rejects with UNSUPPORTED_PLATFORM', async () => {
    if (Platform.OS !== 'ios' || integrity.isSupported) return;
    const hash = `${'A'.repeat(43)}=`;
    expect(await expectRejection(integrity.attestKey('key', hash))).toContain(
      'UNSUPPORTED_PLATFORM'
    );
    expect(
      await expectRejection(integrity.generateAssertion('key', hash))
    ).toContain('UNSUPPORTED_PLATFORM');
  });
});
