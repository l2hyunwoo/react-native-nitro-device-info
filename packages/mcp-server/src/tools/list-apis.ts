/**
 * list_apis MCP Tool
 *
 * List all available API methods and properties with optional filtering.
 */

import { z } from 'zod';
import type { SearchIndex, ApiDefinition, ApiCategory } from '../types/index.js';

/**
 * Input schema for list_apis tool
 */
export const listApisInputSchema = z.object({
  category: z
    .enum([
      'all',
      'core-device-info',
      'device-capabilities',
      'display-screen',
      'system-resources',
      'battery-power',
      'application-metadata',
      'network',
      'carrier-info',
      'audio-accessories',
      'location-services',
      'localization',
      'cpu-architecture',
      'android-platform',
      'ios-platform',
      'installation-distribution',
      'legacy-compatibility',
      'device-integrity',
    ])
    .default('all')
    .describe('Filter by API category'),
  platform: z
    .enum(['all', 'ios', 'android', 'both'])
    .default('all')
    .describe("Filter by platform support: 'ios' = iOS only, 'android' = Android only, 'both' = must support both, 'all' = any platform"),
  kind: z
    .enum(['all', 'method', 'property'])
    .default('all')
    .describe("Filter by API kind: 'method' = functions with (), 'property' = readonly getters"),
});

export type ListApisInput = z.infer<typeof listApisInputSchema>;

/**
 * Category display names (16-category structure)
 */
const CATEGORY_NAMES: Record<ApiCategory, string> = {
  'core-device-info': 'Core Device Information',
  'device-capabilities': 'Device Capabilities',
  'display-screen': 'Display & Screen',
  'system-resources': 'System Resources',
  'battery-power': 'Battery & Power',
  'application-metadata': 'Application Metadata',
  'network': 'Network',
  'carrier-info': 'Carrier Information',
  'audio-accessories': 'Audio Accessories',
  'location-services': 'Location Services',
  'localization': 'Localization',
  'cpu-architecture': 'CPU & Architecture',
  'android-platform': 'Android Platform',
  'ios-platform': 'iOS Platform',
  'installation-distribution': 'Installation & Distribution',
  'legacy-compatibility': 'Legacy Compatibility',
  'device-integrity': 'Device Integrity',
};

/**
 * Format platform info for table
 */
function formatPlatformShort(api: ApiDefinition): string {
  const platform = api.platform;
  switch (platform.type) {
    case 'both':
      return 'iOS, Android';
    case 'ios':
      return platform.minVersion ? `iOS ${platform.minVersion}+` : 'iOS';
    case 'android':
      return platform.minApiLevel ? `API ${platform.minApiLevel}+` : 'Android';
    case 'ios-only':
      return 'iOS only';
    case 'android-only':
      return 'Android only';
    default:
      return 'iOS, Android';
  }
}

/**
 * Check if API matches platform filter
 */
function matchesPlatform(api: ApiDefinition, filter: string): boolean {
  const platformType = api.platform.type;

  switch (filter) {
    case 'all':
      return true;
    case 'ios':
      return platformType === 'ios' || platformType === 'ios-only' || platformType === 'both';
    case 'android':
      return platformType === 'android' || platformType === 'android-only' || platformType === 'both';
    case 'both':
      return platformType === 'both';
    default:
      return true;
  }
}

/**
 * Format API list by category
 */
function formatApisByCategory(
  apis: ApiDefinition[],
  category: string
): string {
  const lines: string[] = [];
  const displayName = CATEGORY_NAMES[category as ApiCategory] || category;

  lines.push(`## ${displayName}`);
  lines.push('');
  lines.push('| API | Kind | Platform | Description |');
  lines.push('|-----|------|----------|-------------|');

  for (const api of apis) {
    const name = api.kind === 'method' ? `\`${api.name}()\`` : `\`${api.name}\``;
    const kind = api.kind;
    const platform = formatPlatformShort(api);
    const description = api.description.length > 50
      ? api.description.slice(0, 50) + '...'
      : api.description;

    lines.push(`| ${name} | ${kind} | ${platform} | ${description} |`);
  }

  return lines.join('\n');
}

/**
 * Execute list_apis tool
 */
export function executeListApis(
  index: SearchIndex,
  input: ListApisInput
): { content: string; isError: boolean } {
  try {
    const { category, platform, kind } = input;

    // Filter APIs
    const filteredApis: ApiDefinition[] = [];
    for (const [, api] of index.apis) {
      // Category filter
      if (category !== 'all' && api.category !== category) {
        continue;
      }

      // Platform filter
      if (!matchesPlatform(api, platform)) {
        continue;
      }

      // Kind filter
      if (kind !== 'all' && api.kind !== kind) {
        continue;
      }

      filteredApis.push(api);
    }

    // Handle no results
    if (filteredApis.length === 0) {
      const lines: string[] = [];
      lines.push('No APIs found matching filters:');
      lines.push(`- Category: ${category}`);
      lines.push(`- Platform: ${platform}`);
      lines.push(`- Kind: ${kind}`);
      lines.push('');
      lines.push('Try broadening your filters or use `search_docs` for natural language search.');

      return {
        content: lines.join('\n'),
        isError: false,
      };
    }

    // Group by category
    const byCategory = new Map<string, ApiDefinition[]>();
    for (const api of filteredApis) {
      const cat = api.category;
      if (!byCategory.has(cat)) {
        byCategory.set(cat, []);
      }
      byCategory.get(cat)!.push(api);
    }

    // Sort APIs within each category
    for (const [, apis] of byCategory) {
      apis.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Format output
    const lines: string[] = [];
    lines.push('# Available APIs');
    lines.push('');
    lines.push(`**Filters**: Category: ${category} | Platform: ${platform} | Kind: ${kind}`);
    lines.push(`**Total**: ${filteredApis.length} APIs`);
    lines.push('');

    // Define category order (16-category structure)
    const categoryOrder: ApiCategory[] = [
      'core-device-info',
      'device-capabilities',
      'display-screen',
      'system-resources',
      'battery-power',
      'application-metadata',
      'network',
      'carrier-info',
      'audio-accessories',
      'location-services',
      'localization',
      'cpu-architecture',
      'android-platform',
      'ios-platform',
      'installation-distribution',
      'legacy-compatibility',
      'device-integrity',
    ];

    // Output categories in order
    for (const cat of categoryOrder) {
      const apis = byCategory.get(cat);
      if (apis && apis.length > 0) {
        lines.push(formatApisByCategory(apis, cat));
        lines.push('');
      }
    }

    return {
      content: lines.join('\n').trim(),
      isError: false,
    };
  } catch (error) {
    return {
      content: `Error listing APIs: ${error instanceof Error ? error.message : String(error)}`,
      isError: true,
    };
  }
}
