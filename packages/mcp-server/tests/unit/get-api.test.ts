/**
 * Unit tests for get_api tool
 */

import { executeGetApi, getApiInputSchema } from '../../src/tools/get-api';
import { buildSearchIndex } from '../../src/indexer/search';
import { parseDeviceInfoContent } from '../../src/indexer/api-parser';
import { SAMPLE_DEVICE_INFO_CONTENT } from '../fixtures/sample-device-info';

describe('get_api tool', () => {
  // Build a test index from sample content
  const apis = parseDeviceInfoContent(SAMPLE_DEVICE_INFO_CONTENT);
  const index = buildSearchIndex(apis, []);

  describe('input validation', () => {
    it('should reject empty name', () => {
      const result = getApiInputSchema.safeParse({ name: '' });
      expect(result.success).toBe(false);
    });

    it('should reject name exceeding max length', () => {
      const longName = 'a'.repeat(101);
      const result = getApiInputSchema.safeParse({ name: longName });
      expect(result.success).toBe(false);
    });

    it('should accept valid name', () => {
      const result = getApiInputSchema.safeParse({ name: 'getBatteryLevel' });
      expect(result.success).toBe(true);
    });
  });

  describe('case sensitivity', () => {
    it('should find API with exact case', () => {
      const result = executeGetApi(index, { name: 'getBatteryLevel' });
      expect(result.isError).toBe(false);
      expect(result.content).toContain('# getBatteryLevel');
    });

    it('should find API with lowercase', () => {
      const result = executeGetApi(index, { name: 'getbatterylevel' });
      expect(result.isError).toBe(false);
      expect(result.content).toContain('# getBatteryLevel');
    });

    it('should find API with mixed case', () => {
      const result = executeGetApi(index, { name: 'GETBATTERYLEVEL' });
      expect(result.isError).toBe(false);
      expect(result.content).toContain('# getBatteryLevel');
    });
  });

  describe('fuzzy matching', () => {
    it('should suggest similar APIs for typos', () => {
      const result = executeGetApi(index, { name: 'getBatteryLevl' });
      expect(result.isError).toBe(true);
      expect(result.content).toContain('Did you mean:');
      expect(result.content).toContain('getBatteryLevel');
    });

    it('should suggest similar APIs for partial names', () => {
      const result = executeGetApi(index, { name: 'batteryLevel' });
      expect(result.isError).toBe(true);
      expect(result.content).toContain('Did you mean:');
    });
  });

  describe('not found handling', () => {
    it('should return error for non-existent API', () => {
      const result = executeGetApi(index, { name: 'nonExistentApi' });
      expect(result.isError).toBe(true);
      expect(result.content).toContain("Error: API 'nonExistentApi' not found");
    });

    it('should suggest using list_apis', () => {
      const result = executeGetApi(index, { name: 'unknown' });
      expect(result.isError).toBe(true);
      expect(result.content).toContain('list_apis');
    });
  });

  describe('response content', () => {
    it('should include signature section', () => {
      const result = executeGetApi(index, { name: 'getBatteryLevel' });
      expect(result.isError).toBe(false);
      expect(result.content).toContain('## Signature');
      expect(result.content).toContain('```typescript');
    });

    it('should include parameters section', () => {
      const result = executeGetApi(index, { name: 'isLowBatteryLevel' });
      expect(result.isError).toBe(false);
      expect(result.content).toContain('## Parameters');
    });

    it('should include platform support section', () => {
      const result = executeGetApi(index, { name: 'getBatteryLevel' });
      expect(result.isError).toBe(false);
      expect(result.content).toContain('## Platform Support');
    });

    it('should include import example', () => {
      const result = executeGetApi(index, { name: 'getBatteryLevel' });
      expect(result.isError).toBe(false);
      expect(result.content).toContain('## Import');
      expect(result.content).toContain("react-native-nitro-modules");
    });

    it('should mark iOS-only APIs correctly', () => {
      const result = executeGetApi(index, { name: 'getHasNotch' });
      expect(result.isError).toBe(false);
      expect(result.content).toContain('iOS');
    });

    it('should mark Android-only APIs correctly', () => {
      const result = executeGetApi(index, { name: 'getIsAirplaneMode' });
      expect(result.isError).toBe(false);
      expect(result.content).toContain('Android');
    });
  });

  describe('properties vs methods', () => {
    it('should format properties without parentheses', () => {
      const result = executeGetApi(index, { name: 'deviceId' });
      expect(result.isError).toBe(false);
      expect(result.content).toContain('# deviceId');
      expect(result.content).toContain('readonly deviceId');
    });

    it('should format methods with parentheses', () => {
      const result = executeGetApi(index, { name: 'getBatteryLevel' });
      expect(result.isError).toBe(false);
      expect(result.content).toContain('getBatteryLevel()');
    });
  });

  describe('async methods', () => {
    it('should indicate async methods return Promise', () => {
      const result = executeGetApi(index, { name: 'getIpAddress' });
      expect(result.isError).toBe(false);
      expect(result.content).toContain('Promise');
    });
  });
});
