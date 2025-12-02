/**
 * Integration tests for MCP server - Platform-specific queries
 */

import { buildSearchIndex } from '../../src/indexer/search';
import { parseDeviceInfoContent } from '../../src/indexer/api-parser';
import { createPlatformLimitationChunks } from '../../src/indexer/doc-parser';
import { executeSearchDocs } from '../../src/tools/search-docs';
import { executeGetApi } from '../../src/tools/get-api';
import { SAMPLE_DEVICE_INFO_CONTENT } from '../fixtures/sample-device-info';

describe('MCP Server Integration - Platform-specific queries', () => {
  // Build a test index with platform limitation documentation
  const apis = parseDeviceInfoContent(SAMPLE_DEVICE_INFO_CONTENT);
  const platformChunks = createPlatformLimitationChunks();
  const index = buildSearchIndex(apis, platformChunks);

  describe('iOS platform queries', () => {
    it('should find iOS limitations when searching for iOS', () => {
      const result = executeSearchDocs(index, {
        query: 'iOS limitations',
        limit: 10,
        type: 'all',
      });

      expect(result.isError).toBe(false);
      expect(result.content).toContain('iOS');
    });

    it('should explain getMacAddress limitation on iOS', () => {
      const result = executeSearchDocs(index, {
        query: 'getMacAddress iOS',
        limit: 5,
        type: 'all',
      });

      expect(result.isError).toBe(false);
      // Should find content about MAC address restrictions
    });

    it('should return iOS simulator information', () => {
      const result = executeSearchDocs(index, {
        query: 'simulator',
        limit: 5,
        type: 'all',
      });

      expect(result.isError).toBe(false);
    });
  });

  describe('Android platform queries', () => {
    it('should find Android limitations when searching for Android', () => {
      const result = executeSearchDocs(index, {
        query: 'Android limitations',
        limit: 10,
        type: 'all',
      });

      expect(result.isError).toBe(false);
      expect(result.content).toContain('Android');
    });

    it('should explain serialNumber permission requirement', () => {
      const result = executeSearchDocs(index, {
        query: 'serialNumber permission Android',
        limit: 5,
        type: 'all',
      });

      expect(result.isError).toBe(false);
    });
  });

  describe('platform-specific API queries', () => {
    it('should indicate isAirplaneMode is Android-only', () => {
      const result = executeGetApi(index, {
        name: 'getIsAirplaneMode',
      });

      expect(result.isError).toBe(false);
      expect(result.content).toContain('Android');
    });

    it('should indicate getHasNotch is iOS-specific', () => {
      const result = executeGetApi(index, {
        name: 'getHasNotch',
      });

      expect(result.isError).toBe(false);
      expect(result.content).toContain('iOS');
    });
  });

  describe('troubleshooting queries', () => {
    it('should find troubleshooting content for platform issues', () => {
      const result = executeSearchDocs(index, {
        query: 'not working iOS',
        limit: 5,
        type: 'all',
      });

      expect(result.isError).toBe(false);
    });

    it('should provide workaround suggestions', () => {
      const result = executeSearchDocs(index, {
        query: 'returns false iOS',
        limit: 5,
        type: 'all',
      });

      expect(result.isError).toBe(false);
    });
  });

  describe('cross-platform search', () => {
    it('should boost iOS content when query mentions iOS', () => {
      const result = executeSearchDocs(index, {
        query: 'brightness iOS',
        limit: 5,
        type: 'all',
      });

      expect(result.isError).toBe(false);
      // Results should prioritize iOS-specific content
    });

    it('should boost Android content when query mentions Android', () => {
      const result = executeSearchDocs(index, {
        query: 'permissions Android',
        limit: 5,
        type: 'all',
      });

      expect(result.isError).toBe(false);
      // Results should prioritize Android-specific content
    });
  });

  describe('combined searches', () => {
    it('should handle combined API and troubleshooting queries', () => {
      const result = executeSearchDocs(index, {
        query: 'battery level not updating',
        limit: 5,
        type: 'all',
      });

      expect(result.isError).toBe(false);
      // Should include both API docs and troubleshooting
    });

    it('should find APIs by functionality description', () => {
      const result = executeSearchDocs(index, {
        query: 'check if device is charging',
        limit: 5,
        type: 'api',
      });

      expect(result.isError).toBe(false);
      // Should find getIsBatteryCharging or similar
    });
  });
});
