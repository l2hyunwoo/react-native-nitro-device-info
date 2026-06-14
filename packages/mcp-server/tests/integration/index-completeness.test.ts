/**
 * Integration test for index completeness
 *
 * Validates that the indexer can parse the real DeviceInfo.nitro.ts (core) and
 * DeviceIntegrity.nitro.ts (opt-in attestation package), and index all APIs.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  parseDeviceInfoFile,
  getDeviceInfoPath,
  getDeviceIntegrityPath,
} from '../../src/indexer/api-parser';
import { buildIndex } from '../../src/indexer';

// Resolve real spec paths via the same resolver the server uses. packageRoot is
// the mcp-server dir (two levels up from this tests/integration file).
const packageRoot = path.join(__dirname, '..', '..');

function tryResolve(fn: (root: string) => string): string | undefined {
  try {
    const p = fn(packageRoot);
    return fs.existsSync(p) ? p : undefined;
  } catch {
    return undefined;
  }
}

const deviceInfoPath = tryResolve(getDeviceInfoPath);
const deviceIntegrityPath = tryResolve(getDeviceIntegrityPath);

describe('Index Completeness', () => {
  describe('core DeviceInfo API', () => {
    if (deviceInfoPath) {
      it('should index at least 80 APIs from DeviceInfo.nitro.ts', () => {
        const apis = parseDeviceInfoFile(deviceInfoPath);
        expect(apis.length).toBeGreaterThanOrEqual(80);
      });

      it('should have APIs in all major categories', () => {
        const apis = parseDeviceInfoFile(deviceInfoPath);
        const categories = new Set(apis.map((a) => a.category));

        expect(categories.has('core-device-info')).toBe(true);
        expect(categories.has('battery-power')).toBe(true);
        expect(categories.has('system-resources')).toBe(true);
        expect(categories.has('network')).toBe(true);
      });

      it('should have both methods and properties', () => {
        const apis = parseDeviceInfoFile(deviceInfoPath);
        const methods = apis.filter((a) => a.kind === 'method');
        const properties = apis.filter((a) => a.kind === 'property');

        expect(methods.length).toBeGreaterThan(20);
        expect(properties.length).toBeGreaterThan(20);
      });

      it('should have cross-platform APIs', () => {
        const apis = parseDeviceInfoFile(deviceInfoPath);
        const bothApis = apis.filter((a) => a.platform.type === 'both');
        expect(bothApis.length).toBeGreaterThan(30);
      });
    } else {
      it.skip('DeviceInfo.nitro.ts not found - skipping', () => {});
    }
  });

  describe('attestation DeviceIntegrity API', () => {
    if (deviceIntegrityPath) {
      it('should index the DeviceIntegrity attestation APIs', () => {
        const apis = parseDeviceInfoFile(deviceIntegrityPath, 'DeviceIntegrity');
        const names = apis.map((a) => a.name);

        expect(apis.length).toBeGreaterThanOrEqual(8);
        for (const expected of [
          'isSupported',
          'providerType',
          'prepareStandardProvider',
          'requestIntegrityToken',
          'requestClassicIntegrityToken',
          'generateKey',
          'attestKey',
          'generateAssertion',
          'getDeviceCheckToken',
        ]) {
          expect(names).toContain(expected);
        }
      });

      it('should categorize attestation APIs as device-integrity', () => {
        const apis = parseDeviceInfoFile(deviceIntegrityPath, 'DeviceIntegrity');
        const integrity = apis.filter(
          (a) => a.category === 'device-integrity'
        );
        expect(integrity.length).toBeGreaterThan(0);
      });
    } else {
      it.skip('DeviceIntegrity.nitro.ts not found - skipping', () => {});
    }
  });

  describe('combined search index', () => {
    if (deviceInfoPath) {
      it('should build a valid index covering core + attestation', () => {
        const index = buildIndex(packageRoot);
        expect(index.apis.size).toBeGreaterThanOrEqual(80);
        expect(index.documentCount).toBeGreaterThan(0);
        expect(index.averageDocumentLength).toBeGreaterThan(0);

        if (deviceIntegrityPath) {
          expect(index.apis.has('requestIntegrityToken')).toBe(true);
          expect(index.apis.has('attestKey')).toBe(true);
        }
      });
    } else {
      it.skip('specs not found - skipping', () => {});
    }
  });

  describe('known core APIs', () => {
    if (deviceInfoPath) {
      const apis = parseDeviceInfoFile(deviceInfoPath);
      const apiNames = apis.map((a) => a.name);

      const knownApis = [
        'deviceId',
        'brand',
        'model',
        'systemName',
        'systemVersion',
        'isEmulator',
        'isTablet',
      ];

      for (const apiName of knownApis) {
        it(`should include ${apiName}`, () => {
          expect(apiNames).toContain(apiName);
        });
      }
    } else {
      it.skip('DeviceInfo.nitro.ts not found - skipping', () => {});
    }
  });
});
