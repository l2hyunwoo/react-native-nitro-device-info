import type { SearchIndex, ApiDefinition, DocumentationChunk } from '../types/index.js';
import {
  parseDeviceInfoFile,
  parseDeviceInfoContent,
  getDeviceInfoPath,
  getDeviceIntegrityPath,
} from './api-parser.js';
import {
  parseDocsDirectory,
  parseReadme,
  getDocsPaths,
  createPlatformLimitationChunks,
} from './doc-parser.js';
import { buildSearchIndex } from './search.js';

export { buildSearchIndex, search, findSimilarApis, levenshteinDistance } from './search.js';
export {
  parseDeviceInfoFile,
  parseDeviceInfoContent,
  getDeviceInfoPath,
  getDeviceIntegrityPath,
} from './api-parser.js';
export { parseMarkdownFile, parseMarkdownContent, parseDocsDirectory } from './doc-parser.js';

export interface IndexOptions {
  /** Path to DeviceInfo.nitro.ts (auto-detected if not provided) */
  deviceInfoPath?: string;

  /** Paths to documentation directories (auto-detected if not provided) */
  docsPaths?: string[];

  includeReadme?: boolean;

  includePlatformLimitations?: boolean;

  /** DeviceInfo content string (for testing without file access) */
  deviceInfoContent?: string;

  /** Path to DeviceIntegrity.nitro.ts (auto-detected if not provided) */
  deviceIntegrityPath?: string;

  /** DeviceIntegrity content string (for testing without file access) */
  deviceIntegrityContent?: string;

  /** Documentation chunks (for testing without file access) */
  documentationChunks?: DocumentationChunk[];
}

export function buildIndex(
  packageRoot: string = process.cwd(),
  options: IndexOptions = {}
): SearchIndex {
  const apis: ApiDefinition[] = [];
  const chunks: DocumentationChunk[] = [];

  if (options.deviceInfoContent) {
    apis.push(...parseDeviceInfoContent(options.deviceInfoContent));
  } else {
    try {
      const deviceInfoPath =
        options.deviceInfoPath || getDeviceInfoPath(packageRoot);
      apis.push(...parseDeviceInfoFile(deviceInfoPath));
      console.error(`Indexed ${apis.length} APIs from DeviceInfo.nitro.ts`);
    } catch (error) {
      console.error(`Warning: Could not parse DeviceInfo.nitro.ts: ${error}`);
    }
  }

  // Parse DeviceIntegrity.nitro.ts (opt-in attestation package). Optional —
  // absence is not an error (the package may not be present).
  if (options.deviceIntegrityContent) {
    apis.push(
      ...parseDeviceInfoContent(options.deviceIntegrityContent, 'DeviceIntegrity')
    );
  } else {
    try {
      const integrityPath =
        options.deviceIntegrityPath || getDeviceIntegrityPath(packageRoot);
      const integrityApis = parseDeviceInfoFile(integrityPath, 'DeviceIntegrity');
      apis.push(...integrityApis);
      console.error(
        `Indexed ${integrityApis.length} APIs from DeviceIntegrity.nitro.ts`
      );
    } catch (error) {
      // A missing spec is expected (the attestation package is optional) and is
      // reported as info. Any other failure (unreadable file, parser error) is
      // surfaced as a warning so it isn't silently dropped.
      const message = error instanceof Error ? error.message : String(error);
      if (message.startsWith('Could not find DeviceIntegrity.nitro.ts')) {
        console.error(
          'Info: DeviceIntegrity.nitro.ts not found (attestation package not present); skipping.'
        );
      } else {
        console.error(
          `Warning: Could not parse DeviceIntegrity.nitro.ts: ${message}`
        );
      }
    }
  }

  if (options.documentationChunks) {
    chunks.push(...options.documentationChunks);
  } else {
    const docsPaths = options.docsPaths || getDocsPaths(packageRoot);
    for (const docsPath of docsPaths) {
      try {
        const docChunks = parseDocsDirectory(docsPath);
        chunks.push(...docChunks);
        console.error(`Indexed ${docChunks.length} documentation chunks from ${docsPath}`);
      } catch (error) {
        console.error(`Warning: Could not parse docs at ${docsPath}: ${error}`);
      }
    }
  }

  if (options.includeReadme !== false && !options.documentationChunks) {
    try {
      const readmeChunks = parseReadme(packageRoot);
      chunks.push(...readmeChunks);
      console.error(`Indexed ${readmeChunks.length} README chunks`);
    } catch (error) {
      console.error(`Warning: Could not parse README: ${error}`);
    }
  }

  if (options.includePlatformLimitations !== false) {
    chunks.push(...createPlatformLimitationChunks());
  }

  return buildSearchIndex(apis, chunks);
}

export function getIndexStats(index: SearchIndex): {
  apiCount: number;
  chunkCount: number;
  totalDocuments: number;
  averageDocumentLength: number;
  termCount: number;
  categoryCounts: Record<string, number>;
} {
  const categoryCounts: Record<string, number> = {};
  for (const [, api] of index.apis) {
    categoryCounts[api.category] = (categoryCounts[api.category] || 0) + 1;
  }

  return {
    apiCount: index.apis.size,
    chunkCount: index.chunks.length,
    totalDocuments: index.documentCount,
    averageDocumentLength: Math.round(index.averageDocumentLength),
    termCount: index.invertedIndex.size,
    categoryCounts,
  };
}

export function validateIndex(index: SearchIndex): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (index.apis.size < 80) {
    errors.push(
      `API count (${index.apis.size}) is below minimum requirement (80)`
    );
  }

  if (index.documentCount === 0) {
    errors.push('Index is empty - no documents indexed');
  }

  const expectedCategories = [
    'core-device-info',
    'battery-power',
    'system-resources',
    'application-metadata',
    'network',
    'device-capabilities',
  ];
  for (const category of expectedCategories) {
    const hasCategory = Array.from(index.apis.values()).some(
      (api) => api.category === category
    );
    if (!hasCategory) {
      warnings.push(`No APIs found in category: ${category}`);
    }
  }

  for (const [name, api] of index.apis) {
    if (!api.description || api.description.length < 10) {
      warnings.push(`API '${name}' has missing or short description`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Create index from DeviceInfo content string (for embedded content)
 */
export function createEmbeddedIndex(deviceInfoContent: string): SearchIndex {
  const apis = parseDeviceInfoContent(deviceInfoContent);
  const chunks = createPlatformLimitationChunks();
  return buildSearchIndex(apis, chunks);
}
