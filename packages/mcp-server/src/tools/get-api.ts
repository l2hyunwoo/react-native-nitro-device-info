import { z } from 'zod';
import type { SearchIndex, ApiDefinition, Platform } from '../types/index.js';
import { findSimilarApis } from '../indexer/search.js';

export const getApiInputSchema = z.object({
  name: z
    .string()
    .min(1, 'API name cannot be empty')
    .max(100, 'API name exceeds maximum length')
    .describe("API method or property name (e.g., 'getBatteryLevel', 'deviceId'). Case-insensitive lookup with exact-match boost."),
});

export type GetApiInput = z.infer<typeof getApiInputSchema>;

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

function formatExamples(examples: string[]): string {
  if (examples.length === 0) {
    return '*No examples documented.*';
  }

  const lines: string[] = [];
  for (const example of examples) {
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

function formatApiDocumentation(api: ApiDefinition): string {
  const lines: string[] = [];

  lines.push(`# ${api.name}`);
  lines.push('');

  lines.push(api.description);
  lines.push('');

  lines.push('## Signature');
  lines.push('');
  lines.push('```typescript');
  lines.push(api.signature);
  lines.push('```');
  lines.push('');

  lines.push('## Parameters');
  lines.push('');
  lines.push(formatParameters(api));
  lines.push('');

  lines.push('## Returns');
  lines.push('');
  lines.push(`\`${api.returnType}\``);
  lines.push('');
  if (api.isAsync) {
    lines.push('*This is an async method that returns a Promise.*');
    lines.push('');
  }

  lines.push('## Platform Support');
  lines.push('');
  lines.push(formatPlatformSupport(api.platform));
  lines.push('');

  lines.push('## Example');
  lines.push('');
  lines.push(formatExamples(api.examples));
  lines.push('');

  lines.push('## Import');
  lines.push('');
  lines.push('```typescript');
  const isIntegrity = api.module === 'DeviceIntegrity';
  const moduleName = isIntegrity ? 'DeviceIntegrityModule' : 'DeviceInfoModule';
  const packageName = isIntegrity ? 'react-native-nitro-device-integrity' : 'react-native-nitro-device-info';
  lines.push(`import { ${moduleName} } from '${packageName}';`);
  lines.push('');
  if (api.kind === 'method') {
    if (api.isAsync) {
      lines.push(`const result = await ${moduleName}.${api.name}(${api.parameters.map(p => p.name).join(', ')});`);
    } else {
      lines.push(`const result = ${moduleName}.${api.name}(${api.parameters.map(p => p.name).join(', ')});`);
    }
  } else {
    lines.push(`const result = ${moduleName}.${api.name};`);
  }
  lines.push('```');
  lines.push('');

  const relatedSection = formatRelatedApis(api.relatedApis);
  if (relatedSection) {
    lines.push(relatedSection);
  }

  return lines.join('\n').trim();
}

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

export function executeGetApi(
  index: SearchIndex,
  input: GetApiInput
): { content: string; isError: boolean } {
  try {
    const { name } = input;
    const nameLower = name.toLowerCase();

    let api: ApiDefinition | undefined;
    for (const [apiName, apiDef] of index.apis) {
      if (apiName.toLowerCase() === nameLower) {
        api = apiDef;
        break;
      }
    }

    if (api) {
      return {
        content: formatApiDocumentation(api),
        isError: false,
      };
    }

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
