/**
 * Unit tests for search_docs tool
 */

import { executeSearchDocs, searchDocsInputSchema } from '../../src/tools/search-docs';
import { buildSearchIndex } from '../../src/indexer/search';
import { parseDeviceInfoContent } from '../../src/indexer/api-parser';
import { SAMPLE_DEVICE_INFO_CONTENT } from '../fixtures/sample-device-info';

describe('search_docs tool', () => {
  // Build a test index from sample content
  const apis = parseDeviceInfoContent(SAMPLE_DEVICE_INFO_CONTENT);
  const index = buildSearchIndex(apis, []);

  describe('input validation', () => {
    it('should reject empty query', () => {
      const result = searchDocsInputSchema.safeParse({ query: '' });
      expect(result.success).toBe(false);
    });

    it('should reject query exceeding max length', () => {
      const longQuery = 'a'.repeat(1001);
      const result = searchDocsInputSchema.safeParse({ query: longQuery });
      expect(result.success).toBe(false);
    });

    it('should accept valid query', () => {
      const result = searchDocsInputSchema.safeParse({ query: 'battery level' });
      expect(result.success).toBe(true);
    });

    it('should use default limit when not specified', () => {
      const result = searchDocsInputSchema.parse({ query: 'test' });
      expect(result.limit).toBe(5);
    });

    it('should use default type when not specified', () => {
      const result = searchDocsInputSchema.parse({ query: 'test' });
      expect(result.type).toBe('all');
    });
  });

  describe('search execution', () => {
    it('should return results for valid query', () => {
      const result = executeSearchDocs(index, {
        query: 'battery',
        limit: 5,
        type: 'all',
      });

      expect(result.isError).toBe(false);
      expect(result.content).toContain('Search Results');
      expect(result.content).toContain('battery');
    });

    it('should return no results message for unmatched query', () => {
      const result = executeSearchDocs(index, {
        query: 'xyznonexistent',
        limit: 5,
        type: 'all',
      });

      expect(result.isError).toBe(false);
      expect(result.content).toContain('No results found');
    });

    it('should respect limit parameter', () => {
      const result = executeSearchDocs(index, {
        query: 'get',
        limit: 2,
        type: 'all',
      });

      expect(result.isError).toBe(false);
      // Count the number of ### headers (each result has one)
      const resultCount = (result.content.match(/### \d+\./g) || []).length;
      expect(resultCount).toBeLessThanOrEqual(2);
    });

    it('should filter by api type', () => {
      const result = executeSearchDocs(index, {
        query: 'battery',
        limit: 10,
        type: 'api',
      });

      expect(result.isError).toBe(false);
      // Should only have API results, no Guide results
      expect(result.content).not.toContain('(Guide)');
    });

    it('should include relevance scores', () => {
      const result = executeSearchDocs(index, {
        query: 'getBatteryLevel',
        limit: 5,
        type: 'all',
      });

      expect(result.isError).toBe(false);
      expect(result.content).toContain('**Relevance**:');
    });

    it('should handle empty index gracefully', () => {
      const emptyIndex = buildSearchIndex([], []);
      const result = executeSearchDocs(emptyIndex, {
        query: 'battery',
        limit: 5,
        type: 'all',
      });

      expect(result.isError).toBe(false);
      expect(result.content).toContain('No results found');
    });
  });

  describe('result formatting', () => {
    it('should include API signatures in results', () => {
      const result = executeSearchDocs(index, {
        query: 'getBatteryLevel',
        limit: 1,
        type: 'api',
      });

      expect(result.isError).toBe(false);
      expect(result.content).toContain('```typescript');
    });

    it('should include platform information', () => {
      const result = executeSearchDocs(index, {
        query: 'getHasNotch',
        limit: 1,
        type: 'api',
      });

      expect(result.isError).toBe(false);
      expect(result.content).toContain('**Platform**:');
    });
  });
});
