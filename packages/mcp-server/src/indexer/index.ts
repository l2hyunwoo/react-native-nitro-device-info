/**
 * Search Index Builder
 *
 * Combines API and documentation parsers to build a complete search index.
 */

import * as path from 'path';
import * as fs from 'fs';
import type { SearchIndex, ApiDefinition, DocumentationChunk } from '../types/index.js';
import { parseDeviceInfoFile, parseDeviceInfoContent, getDeviceInfoPath } from './api-parser.js';
import {
  parseDocsDirectory,
  parseReadme,
  getDocsPaths,
  createPlatformLimitationChunks,
} from './doc-parser.js';
import { buildSearchIndex } from './search.js';

export { buildSearchIndex, search, findSimilarApis, levenshteinDistance } from './search.js';
export { parseDeviceInfoFile, parseDeviceInfoContent } from './api-parser.js';
export { parseMarkdownFile, parseMarkdownContent, parseDocsDirectory } from './doc-parser.js';

/**
 * Index building options
 */
export interface IndexOptions {
  /** Path to DeviceInfo.nitro.ts (auto-detected if not provided) */
  deviceInfoPath?: string;

  /** Paths to documentation directories (auto-detected if not provided) */
  docsPaths?: string[];

  /** Include README in index */
  includeReadme?: boolean;

  /** Include platform limitation documentation */
  includePlatformLimitations?: boolean;

  /** DeviceInfo content string (for testing without file access) */
  deviceInfoContent?: string;

  /** Documentation chunks (for testing without file access) */
  documentationChunks?: DocumentationChunk[];
}

/**
 * Build a complete search index from source files
 */
export function buildIndex(
  packageRoot: string = process.cwd(),
  options: IndexOptions = {}
): SearchIndex {
  const apis: ApiDefinition[] = [];
  const chunks: DocumentationChunk[] = [];

  // Parse DeviceInfo.nitro.ts
  if (options.deviceInfoContent) {
    // Use provided content (for testing)
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

  // Parse documentation
  if (options.documentationChunks) {
    // Use provided chunks (for testing)
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

  // Parse README
  if (options.includeReadme !== false && !options.documentationChunks) {
    try {
      const readmeChunks = parseReadme(packageRoot);
      chunks.push(...readmeChunks);
      console.error(`Indexed ${readmeChunks.length} README chunks`);
    } catch (error) {
      console.error(`Warning: Could not parse README: ${error}`);
    }
  }

  // Add platform limitation documentation
  if (options.includePlatformLimitations !== false) {
    chunks.push(...createPlatformLimitationChunks());
  }

  // Build and return search index
  return buildSearchIndex(apis, chunks);
}

/**
 * Get index statistics
 */
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

/**
 * Validate index meets minimum requirements
 */
export function validateIndex(index: SearchIndex): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check minimum API count (spec requires 80+)
  if (index.apis.size < 80) {
    errors.push(
      `API count (${index.apis.size}) is below minimum requirement (80)`
    );
  }

  // Check for empty index
  if (index.documentCount === 0) {
    errors.push('Index is empty - no documents indexed');
  }

  // Check for missing categories
  const expectedCategories = [
    'device-info',
    'battery',
    'memory',
    'storage',
    'network',
    'capabilities',
  ];
  for (const category of expectedCategories) {
    const hasCategory = Array.from(index.apis.values()).some(
      (api) => api.category === category
    );
    if (!hasCategory) {
      warnings.push(`No APIs found in category: ${category}`);
    }
  }

  // Check for APIs without descriptions
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
