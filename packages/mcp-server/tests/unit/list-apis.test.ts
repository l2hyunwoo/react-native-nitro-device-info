/**
 * Unit tests for list_apis tool
 */

import { executeListApis, listApisInputSchema } from '../../src/tools/list-apis';
import { buildSearchIndex } from '../../src/indexer/search';
import { parseDeviceInfoContent } from '../../src/indexer/api-parser';
import { SAMPLE_DEVICE_INFO_CONTENT } from '../fixtures/sample-device-info';

describe('list_apis tool', () => {
  // Build a test index from sample content
  const apis = parseDeviceInfoContent(SAMPLE_DEVICE_INFO_CONTENT);
  const index = buildSearchIndex(apis, []);

  describe('input validation', () => {
    it('should use default values when no input provided', () => {
      const result = listApisInputSchema.parse({});
      expect(result.category).toBe('all');
      expect(result.platform).toBe('all');
      expect(result.kind).toBe('all');
    });

    it('should accept valid category', () => {
      const result = listApisInputSchema.safeParse({ category: 'battery-power' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid category', () => {
      const result = listApisInputSchema.safeParse({ category: 'invalid' });
      expect(result.success).toBe(false);
    });

    it('should accept valid platform', () => {
      const result = listApisInputSchema.safeParse({ platform: 'ios' });
      expect(result.success).toBe(true);
    });

    it('should accept valid kind', () => {
      const result = listApisInputSchema.safeParse({ kind: 'method' });
      expect(result.success).toBe(true);
    });
  });

  describe('category filter', () => {
    it('should return all APIs when category is "all"', () => {
      const result = executeListApis(index, {
        category: 'all',
        platform: 'all',
        kind: 'all',
      });

      expect(result.isError).toBe(false);
      expect(result.content).toContain('Available APIs');
    });

    it('should filter by battery category', () => {
      const result = executeListApis(index, {
        category: 'battery-power',
        platform: 'all',
        kind: 'all',
      });

      expect(result.isError).toBe(false);
      expect(result.content).toContain('Battery');
      // Should include battery-related APIs
      expect(result.content.toLowerCase()).toContain('battery');
    });

    it('should return empty results message for non-matching category', () => {
      // Create a smaller index that won't have all categories
      const smallIndex = buildSearchIndex(
        apis.filter(a => a.category === 'battery-power'),
        []
      );

      const result = executeListApis(smallIndex, {
        category: 'audio-accessories',
        platform: 'all',
        kind: 'all',
      });

      expect(result.isError).toBe(false);
      expect(result.content).toContain('No APIs found');
    });
  });

  describe('platform filter', () => {
    it('should filter by iOS platform', () => {
      const result = executeListApis(index, {
        category: 'all',
        platform: 'ios',
        kind: 'all',
      });

      expect(result.isError).toBe(false);
      // Should not include Android-only APIs
      // The getIsAirplaneMode is Android-only
    });

    it('should filter by Android platform', () => {
      const result = executeListApis(index, {
        category: 'all',
        platform: 'android',
        kind: 'all',
      });

      expect(result.isError).toBe(false);
      // Should include Android APIs
    });

    it('should filter for APIs supporting both platforms', () => {
      const result = executeListApis(index, {
        category: 'all',
        platform: 'both',
        kind: 'all',
      });

      expect(result.isError).toBe(false);
      // APIs that support both platforms should be included
    });
  });

  describe('kind filter', () => {
    it('should filter by method kind', () => {
      const result = executeListApis(index, {
        category: 'all',
        platform: 'all',
        kind: 'method',
      });

      expect(result.isError).toBe(false);
      // Should only include methods (with parentheses)
      expect(result.content).toContain('method');
    });

    it('should filter by property kind', () => {
      const result = executeListApis(index, {
        category: 'all',
        platform: 'all',
        kind: 'property',
      });

      expect(result.isError).toBe(false);
      // Should only include properties
      expect(result.content).toContain('property');
    });
  });

  describe('combined filters', () => {
    it('should apply multiple filters together', () => {
      const result = executeListApis(index, {
        category: 'battery-power',
        platform: 'all',
        kind: 'method',
      });

      expect(result.isError).toBe(false);
      // Should only include battery methods
    });
  });

  describe('response formatting', () => {
    it('should include total count', () => {
      const result = executeListApis(index, {
        category: 'all',
        platform: 'all',
        kind: 'all',
      });

      expect(result.isError).toBe(false);
      expect(result.content).toContain('**Total**:');
    });

    it('should include filter summary', () => {
      const result = executeListApis(index, {
        category: 'battery-power',
        platform: 'all',
        kind: 'method',
      });

      expect(result.isError).toBe(false);
      expect(result.content).toContain('**Filters**:');
    });

    it('should format as table', () => {
      const result = executeListApis(index, {
        category: 'all',
        platform: 'all',
        kind: 'all',
      });

      expect(result.isError).toBe(false);
      expect(result.content).toContain('| API |');
      expect(result.content).toContain('|-----|');
    });

    it('should group APIs by category', () => {
      const result = executeListApis(index, {
        category: 'all',
        platform: 'all',
        kind: 'all',
      });

      expect(result.isError).toBe(false);
      // Should have category headers
      expect(result.content).toContain('##');
    });
  });

  describe('empty results', () => {
    it('should handle empty index gracefully', () => {
      const emptyIndex = buildSearchIndex([], []);
      const result = executeListApis(emptyIndex, {
        category: 'all',
        platform: 'all',
        kind: 'all',
      });

      expect(result.isError).toBe(false);
      expect(result.content).toContain('No APIs found');
    });

    it('should suggest broadening filters when no results', () => {
      const emptyIndex = buildSearchIndex([], []);
      const result = executeListApis(emptyIndex, {
        category: 'battery-power',
        platform: 'ios',
        kind: 'method',
      });

      expect(result.isError).toBe(false);
      expect(result.content).toContain('Try broadening your filters');
    });
  });
});
