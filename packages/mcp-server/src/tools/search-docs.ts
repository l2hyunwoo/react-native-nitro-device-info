/**
 * search_docs MCP Tool
 *
 * Search documentation using natural language queries with BM25 ranking.
 */

import { z } from 'zod';
import type { SearchIndex, ApiDefinition, DocumentationChunk } from '../types/index.js';
import { search } from '../indexer/search.js';

/**
 * Input schema for search_docs tool
 */
export const searchDocsInputSchema = z.object({
  query: z
    .string()
    .min(1, 'Query cannot be empty')
    .max(1000, 'Query exceeds maximum length of 1000 characters')
    .describe("Natural language search query (e.g., 'how to get battery level')"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(20)
    .default(5)
    .describe('Maximum number of results to return. If fewer results exist, returns all available.'),
  type: z
    .enum(['all', 'api', 'guide'])
    .default('all')
    .describe("Filter results by content type: 'api' = API definitions, 'guide' = documentation guides, 'all' = both"),
});

export type SearchDocsInput = z.infer<typeof searchDocsInputSchema>;

/**
 * Format platform info for display
 */
function formatPlatform(api: ApiDefinition): string {
  const platform = api.platform;
  switch (platform.type) {
    case 'both':
      return 'iOS, Android';
    case 'ios':
      return platform.minVersion ? `iOS ${platform.minVersion}+` : 'iOS';
    case 'android':
      return platform.minApiLevel ? `Android API ${platform.minApiLevel}+` : 'Android';
    case 'ios-only':
      return platform.minVersion ? `iOS ${platform.minVersion}+ only` : 'iOS only';
    case 'android-only':
      return platform.minApiLevel ? `Android API ${platform.minApiLevel}+ only` : 'Android only';
    default:
      return 'iOS, Android';
  }
}

/**
 * Format a single API search result
 */
function formatApiResult(api: ApiDefinition, score: number, index: number): string {
  const lines: string[] = [];

  lines.push(`### ${index}. ${api.name}() (API)`);
  lines.push(`**Relevance**: ${score}%`);
  lines.push(`**Platform**: ${formatPlatform(api)}`);
  lines.push('');

  lines.push(api.description);
  lines.push('');

  // Add signature
  lines.push('```typescript');
  lines.push(api.signature);
  lines.push('```');

  return lines.join('\n');
}

/**
 * Format a single documentation chunk search result
 */
function formatDocResult(chunk: DocumentationChunk, score: number, index: number): string {
  const lines: string[] = [];

  const typeLabel = chunk.type === 'api' ? 'API' : chunk.type === 'troubleshooting' ? 'Troubleshooting' : 'Guide';
  lines.push(`### ${index}. ${chunk.title} (${typeLabel})`);
  lines.push(`**Relevance**: ${score}%`);

  if (chunk.platforms.length > 0) {
    lines.push(`**Platform**: ${chunk.platforms.map(p => p === 'ios' ? 'iOS' : 'Android').join(', ')}`);
  }

  lines.push('');

  // Truncate content for display
  const excerpt = chunk.content.length > 300
    ? chunk.content.slice(0, 300) + '...'
    : chunk.content;

  lines.push(excerpt);

  return lines.join('\n');
}

/**
 * Get suggested search terms when no results found
 */
function getSuggestions(): string {
  return `Try searching for:
- Battery: getBatteryLevel, isCharging, powerState
- Device: deviceId, model, brand
- Network: ipAddress, carrier, macAddress
- Memory: totalMemory, usedMemory
- Storage: diskCapacity, freeDiskStorage`;
}

/**
 * Execute search_docs tool
 */
export function executeSearchDocs(
  index: SearchIndex,
  input: SearchDocsInput
): { content: string; isError: boolean } {
  try {
    const { query, limit, type } = input;

    // Perform search
    const results = search(index, query, limit, {
      type: type === 'api' ? 'api' : type === 'guide' ? 'guide' : 'all',
    });

    // Handle no results
    if (results.length === 0) {
      return {
        content: `No results found for "${query}".\n\n${getSuggestions()}`,
        isError: false,
      };
    }

    // Format results
    const lines: string[] = [];
    lines.push(`## Search Results for "${query}"`);
    lines.push('');
    lines.push(`Found ${results.length} result${results.length === 1 ? '' : 's'}:`);
    lines.push('');

    let resultIndex = 1;
    for (const result of results) {
      if (result.type === 'api') {
        lines.push(formatApiResult(result.item as ApiDefinition, result.score, resultIndex));
      } else {
        lines.push(formatDocResult(result.item as DocumentationChunk, result.score, resultIndex));
      }
      lines.push('');
      lines.push('---');
      lines.push('');
      resultIndex++;
    }

    return {
      content: lines.join('\n').trim(),
      isError: false,
    };
  } catch (error) {
    return {
      content: `Error searching documentation: ${error instanceof Error ? error.message : String(error)}`,
      isError: true,
    };
  }
}
