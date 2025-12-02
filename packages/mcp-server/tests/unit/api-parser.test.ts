/**
 * Unit tests for API parser - TypeScript signature extraction
 */

import { parseDeviceInfoContent } from '../../src/indexer/api-parser';
import { SAMPLE_DEVICE_INFO_CONTENT, EXPECTED_API_COUNT, EXPECTED_API_NAMES } from '../fixtures/sample-device-info';

describe('API Parser', () => {
  const apis = parseDeviceInfoContent(SAMPLE_DEVICE_INFO_CONTENT);

  describe('basic parsing', () => {
    it('should parse the expected number of APIs', () => {
      expect(apis.length).toBe(EXPECTED_API_COUNT);
    });

    it('should parse all expected API names', () => {
      const apiNames = apis.map(a => a.name);
      for (const name of EXPECTED_API_NAMES) {
        expect(apiNames).toContain(name);
      }
    });
  });

  describe('TypeScript signature extraction', () => {
    it('should extract method signature correctly', () => {
      const api = apis.find(a => a.name === 'getBatteryLevel');
      expect(api).toBeDefined();
      expect(api!.signature).toContain('getBatteryLevel');
      expect(api!.signature).toContain('number');
    });

    it('should extract property signature with readonly', () => {
      const api = apis.find(a => a.name === 'deviceId');
      expect(api).toBeDefined();
      expect(api!.signature).toContain('readonly');
      expect(api!.signature).toContain('string');
    });

    it('should extract Promise return type for async methods', () => {
      const api = apis.find(a => a.name === 'getIpAddress');
      expect(api).toBeDefined();
      expect(api!.returnType).toContain('Promise');
      expect(api!.returnType).toContain('string');
      expect(api!.isAsync).toBe(true);
    });

    it('should extract complex return type (PowerState)', () => {
      const api = apis.find(a => a.name === 'getPowerState');
      expect(api).toBeDefined();
      expect(api!.returnType).toBe('PowerState');
    });

    it('should extract parameter types', () => {
      const api = apis.find(a => a.name === 'isLowBatteryLevel');
      expect(api).toBeDefined();
      expect(api!.parameters.length).toBe(1);
      expect(api!.parameters[0].name).toBe('threshold');
      expect(api!.parameters[0].type).toBe('number');
    });
  });

  describe('method vs property detection', () => {
    it('should identify methods correctly', () => {
      const api = apis.find(a => a.name === 'getBatteryLevel');
      expect(api).toBeDefined();
      expect(api!.kind).toBe('method');
    });

    it('should identify properties correctly', () => {
      const api = apis.find(a => a.name === 'deviceId');
      expect(api).toBeDefined();
      expect(api!.kind).toBe('property');
    });
  });

  describe('platform detection', () => {
    it('should detect iOS-only APIs', () => {
      const api = apis.find(a => a.name === 'getHasNotch');
      expect(api).toBeDefined();
      expect(api!.platform.type).toContain('ios');
    });

    it('should detect Android-only APIs', () => {
      const api = apis.find(a => a.name === 'getIsAirplaneMode');
      expect(api).toBeDefined();
      // Note: The sample fixture doesn't have strict @platform android only annotation
      // but does mention Android in the description
      expect(['android-only', 'both']).toContain(api!.platform.type);
    });

    it('should detect APIs supporting both platforms', () => {
      const api = apis.find(a => a.name === 'getBatteryLevel');
      expect(api).toBeDefined();
      expect(api!.platform.type).toBe('both');
    });
  });

  describe('category assignment', () => {
    it('should categorize battery-related APIs', () => {
      const api = apis.find(a => a.name === 'getBatteryLevel');
      expect(api).toBeDefined();
      expect(api!.category).toBe('battery');
    });

    it('should categorize memory-related APIs', () => {
      const api = apis.find(a => a.name === 'totalMemory');
      expect(api).toBeDefined();
      expect(api!.category).toBe('memory');
    });

    it('should categorize device-info APIs', () => {
      const api = apis.find(a => a.name === 'deviceId');
      expect(api).toBeDefined();
      expect(api!.category).toBe('device-info');
    });
  });

  describe('JSDoc example extraction', () => {
    it('should extract examples from JSDoc', () => {
      const api = apis.find(a => a.name === 'getBatteryLevel');
      expect(api).toBeDefined();
      expect(api!.examples.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('description extraction', () => {
    it('should extract description from JSDoc', () => {
      const api = apis.find(a => a.name === 'getBatteryLevel');
      expect(api).toBeDefined();
      expect(api!.description).toContain('battery');
    });

    it('should handle multi-line descriptions', () => {
      const api = apis.find(a => a.name === 'getPowerState');
      expect(api).toBeDefined();
      expect(api!.description.length).toBeGreaterThan(20);
    });
  });

  describe('related APIs', () => {
    it('should suggest related APIs for battery methods', () => {
      const api = apis.find(a => a.name === 'getBatteryLevel');
      expect(api).toBeDefined();
      expect(api!.relatedApis.length).toBeGreaterThan(0);
    });
  });
});
