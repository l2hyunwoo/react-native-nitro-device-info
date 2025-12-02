/**
 * Integration test for index completeness
 *
 * Validates that the indexer can parse the actual DeviceInfo.nitro.ts
 * and index all 80+ APIs.
 */

import * as path from 'path';
import * as fs from 'fs';
import { parseDeviceInfoFile } from '../../src/indexer/api-parser';
import { buildSearchIndex } from '../../src/indexer/search';

describe('Index Completeness', () => {
  // Try to find the actual DeviceInfo.nitro.ts file
  const possiblePaths = [
    path.join(__dirname, '..', '..', '..', '..', 'src', 'DeviceInfo.nitro.ts'),
    path.join(__dirname, '..', '..', '..', '..', '..', 'src', 'DeviceInfo.nitro.ts'),
  ];

  const deviceInfoPath = possiblePaths.find(p => fs.existsSync(p));

  describe('API count validation', () => {
    if (deviceInfoPath) {
      it('should index at least 80 APIs from actual DeviceInfo.nitro.ts', () => {
        const apis = parseDeviceInfoFile(deviceInfoPath);
        expect(apis.length).toBeGreaterThanOrEqual(80);
      });

      it('should have APIs in all major categories', () => {
        const apis = parseDeviceInfoFile(deviceInfoPath);
        const categories = new Set(apis.map(a => a.category));

        // Check for essential categories
        expect(categories.has('device-info')).toBe(true);
        expect(categories.has('battery')).toBe(true);
        expect(categories.has('memory')).toBe(true);
        expect(categories.has('network')).toBe(true);
      });

      it('should have both methods and properties', () => {
        const apis = parseDeviceInfoFile(deviceInfoPath);
        const methods = apis.filter(a => a.kind === 'method');
        const properties = apis.filter(a => a.kind === 'property');

        expect(methods.length).toBeGreaterThan(20);
        expect(properties.length).toBeGreaterThan(20);
      });

      it('should have APIs for both platforms', () => {
        const apis = parseDeviceInfoFile(deviceInfoPath);

        // Should have many cross-platform APIs
        const bothApis = apis.filter(a => a.platform.type === 'both');

        expect(bothApis.length).toBeGreaterThan(30);
      });

      it('should build a valid search index', () => {
        const apis = parseDeviceInfoFile(deviceInfoPath);
        const index = buildSearchIndex(apis, []);

        expect(index.apis.size).toBeGreaterThanOrEqual(80);
        expect(index.documentCount).toBeGreaterThanOrEqual(80);
        expect(index.averageDocumentLength).toBeGreaterThan(0);
      });
    } else {
      it.skip('DeviceInfo.nitro.ts not found - skipping completeness test', () => {
        // This test will be skipped when running in isolation
      });
    }
  });

  describe('known APIs', () => {
    if (deviceInfoPath) {
      const apis = parseDeviceInfoFile(deviceInfoPath);
      const apiNames = apis.map(a => a.name);

      // Test for specific known APIs
      const knownApis = [
        'deviceId',
        'brand',
        'model',
        'systemName',
        'systemVersion',
        'getBatteryLevel',
        'getPowerState',
        'getIsBatteryCharging',
        'totalMemory',
        'getUsedMemory',
        'totalDiskCapacity',
        'getFreeDiskStorage',
        'getIpAddress',
        'getCarrier',
        'isEmulator',
        'isTablet',
        'uniqueId',
        'version',
        'bundleId',
        'applicationName',
      ];

      for (const apiName of knownApis) {
        it(`should include ${apiName}`, () => {
          expect(apiNames).toContain(apiName);
        });
      }
    }
  });
});
