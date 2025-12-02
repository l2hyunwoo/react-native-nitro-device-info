/**
 * get_api MCP Tool
 *
 * Retrieve detailed information about a specific API method or property.
 */

import { z } from 'zod';
import type { SearchIndex, ApiDefinition, Platform } from '../types/index.js';
import { findSimilarApis } from '../indexer/search.js';

/**
 * Input schema for get_api tool
 */
export const getApiInputSchema = z.object({
  name: z
    .string()
    .min(1, 'API name cannot be empty')
    .max(100, 'API name exceeds maximum length')
    .describe("API method or property name (e.g., 'getBatteryLevel', 'deviceId'). Case-insensitive lookup with exact-match boost."),
});

export type GetApiInput = z.infer<typeof getApiInputSchema>;

/**
 * Format platform support table
 */
function formatPlatformSupport(platform: Platform): string {
  const lines: string[] = [];
  lines.push('| Platform | Support |');
  lines.push('|----------|---------|');

  switch (platform.type) {
    case 'both':
      lines.push('| iOS | ✅ Full support |');
      lines.push('| Android | ✅ Full support |');
      break;
    case 'ios':
      lines.push(`| iOS | ✅ ${platform.minVersion ? `iOS ${platform.minVersion}+` : 'Full support'} |`);
      lines.push('| Android | ✅ Full support |');
      break;
    case 'android':
      lines.push('| iOS | ✅ Full support |');
      lines.push(`| Android | ✅ ${platform.minApiLevel ? `API ${platform.minApiLevel}+` : 'Full support'} |`);
      break;
    case 'ios-only':
      lines.push(`| iOS | ✅ ${platform.minVersion ? `iOS ${platform.minVersion}+` : 'Full support'} |`);
      lines.push('| Android | ❌ Not supported |');
      break;
    case 'android-only':
      lines.push('| iOS | ❌ Not supported |');
      lines.push(`| Android | ✅ ${platform.minApiLevel ? `API ${platform.minApiLevel}+` : 'Full support'} |`);
      break;
  }

  return lines.join('\n');
}

/**
 * Format parameters table
 */
function formatParameters(api: ApiDefinition): string {
  if (api.parameters.length === 0) {
    return '*No parameters.*';
  }

  const lines: string[] = [];
  lines.push('| Name | Type | Required | Description |');
  lines.push('|------|------|----------|-------------|');

  for (const param of api.parameters) {
    const required = param.optional ? 'No' : 'Yes';
    lines.push(`| ${param.name} | \`${param.type}\` | ${required} | ${param.description || '-'} |`);
  }

  return lines.join('\n');
}

/**
 * Format related APIs section
 */
function formatRelatedApis(relatedApis: string[]): string {
  if (relatedApis.length === 0) {
    return '';
  }

  const lines: string[] = [];
  lines.push('## Related APIs');
  lines.push('');
  for (const api of relatedApis) {
    lines.push(`- \`${api}()\``);
  }
  return lines.join('\n');
}

/**
 * Format examples section
 */
function formatExamples(examples: string[]): string {
  if (examples.length === 0) {
    return '*No examples documented.*';
  }

  const lines: string[] = [];
  for (const example of examples) {
    // Check if example already has code fence
    if (example.includes('```')) {
      lines.push(example);
    } else {
      lines.push('```typescript');
      lines.push(example);
      lines.push('```');
    }
  }
  return lines.join('\n');
}

/**
 * Format complete API documentation
 */
function formatApiDocumentation(api: ApiDefinition): string {
  const lines: string[] = [];

  // Title
  lines.push(`# ${api.name}`);
  lines.push('');

  // Description
  lines.push(api.description);
  lines.push('');

  // Signature
  lines.push('## Signature');
  lines.push('');
  lines.push('```typescript');
  lines.push(api.signature);
  lines.push('```');
  lines.push('');

  // Parameters
  lines.push('## Parameters');
  lines.push('');
  lines.push(formatParameters(api));
  lines.push('');

  // Returns
  lines.push('## Returns');
  lines.push('');
  lines.push(`\`${api.returnType}\``);
  lines.push('');
  if (api.isAsync) {
    lines.push('*This is an async method that returns a Promise.*');
    lines.push('');
  }

  // Platform Support
  lines.push('## Platform Support');
  lines.push('');
  lines.push(formatPlatformSupport(api.platform));
  lines.push('');

  // Example
  lines.push('## Example');
  lines.push('');
  lines.push(formatExamples(api.examples));
  lines.push('');

  // Import suggestion
  lines.push('## Import');
  lines.push('');
  lines.push('```typescript');
  lines.push("import { NitroModules } from 'react-native-nitro-modules';");
  lines.push("import type { DeviceInfo } from 'react-native-nitro-device-info';");
  lines.push('');
  lines.push("const deviceInfo = NitroModules.createHybridObject<DeviceInfo>('DeviceInfo');");
  lines.push('');
  if (api.kind === 'method') {
    if (api.isAsync) {
      lines.push(`const result = await deviceInfo.${api.name}(${api.parameters.map(p => p.name).join(', ')});`);
    } else {
      lines.push(`const result = deviceInfo.${api.name}(${api.parameters.map(p => p.name).join(', ')});`);
    }
  } else {
    lines.push(`const result = deviceInfo.${api.name};`);
  }
  lines.push('```');
  lines.push('');

  // Related APIs
  const relatedSection = formatRelatedApis(api.relatedApis);
  if (relatedSection) {
    lines.push(relatedSection);
  }

  return lines.join('\n').trim();
}

/**
 * Format error response with suggestions
 */
function formatNotFoundError(name: string, suggestions: ApiDefinition[]): string {
  const lines: string[] = [];
  lines.push(`Error: API '${name}' not found.`);
  lines.push('');

  if (suggestions.length > 0) {
    lines.push('Did you mean:');
    for (const api of suggestions) {
      lines.push(`- \`${api.name}\` - ${api.description.slice(0, 60)}${api.description.length > 60 ? '...' : ''}`);
    }
    lines.push('');
  }

  lines.push('Use `list_apis` to see all available APIs.');

  return lines.join('\n');
}

/**
 * Execute get_api tool
 */
export function executeGetApi(
  index: SearchIndex,
  input: GetApiInput
): { content: string; isError: boolean } {
  try {
    const { name } = input;
    const nameLower = name.toLowerCase();

    // Try case-insensitive lookup
    let api: ApiDefinition | undefined;
    for (const [apiName, apiDef] of index.apis) {
      if (apiName.toLowerCase() === nameLower) {
        api = apiDef;
        break;
      }
    }

    // If found, return documentation
    if (api) {
      return {
        content: formatApiDocumentation(api),
        isError: false,
      };
    }

    // Not found - try fuzzy matching
    const suggestions = findSimilarApis(name, index.apis, 3, 3);

    return {
      content: formatNotFoundError(name, suggestions),
      isError: true,
    };
  } catch (error) {
    return {
      content: `Error retrieving API: ${error instanceof Error ? error.message : String(error)}`,
      isError: true,
    };
  }
}
