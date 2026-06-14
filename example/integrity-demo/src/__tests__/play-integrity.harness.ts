/**
 * E2E Tests: Play Integrity (Android)
 *
 * These tests assert the deterministic client-side contract that does NOT
 * require a configured Google Cloud project:
 * - input validation (invalid cloudProjectNumber)
 * - ordering (request before prepare)
 * - iOS rejects these Android-only methods
 *
 * A real token request needs a linked Cloud project, so success of
 * requestIntegrityToken is NOT asserted here.
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

describe('Play Integrity (Android-only)', () => {
  test('prepareStandardProvider rejects an empty cloudProjectNumber', async () => {
    if (Platform.OS !== 'android') return;
    const message = await expectRejection(
      integrity.prepareStandardProvider('')
    );
    expect(message).toContain('CLOUD_PROJECT_NUMBER_IS_INVALID');
  });

  test('prepareStandardProvider rejects a non-numeric cloudProjectNumber', async () => {
    if (Platform.OS !== 'android') return;
    const message = await expectRejection(
      integrity.prepareStandardProvider('not-a-number')
    );
    expect(message).toContain('CLOUD_PROJECT_NUMBER_IS_INVALID');
  });

  test('requestIntegrityToken before prepare rejects with PROVIDER_NOT_PREPARED', async () => {
    if (Platform.OS !== 'android') return;
    const message = await expectRejection(
      integrity.requestIntegrityToken('')
    );
    expect(message).toContain('PROVIDER_NOT_PREPARED');
  });

  test('Android-only methods reject on iOS', async () => {
    if (Platform.OS !== 'ios') return;
    const message = await expectRejection(
      integrity.prepareStandardProvider('123456789012')
    );
    expect(message).toContain('UNSUPPORTED_PLATFORM');
  });
});
