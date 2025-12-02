/**
 * Documentation Parser
 *
 * Parses markdown documentation files with heading-based chunking
 * for searchable documentation sections.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { DocumentationChunk, DocumentType } from '../types/index.js';

/**
 * Determine document type from file path and content
 */
function determineDocType(filePath: string, content: string): DocumentType {
  const fileNameLower = filePath.toLowerCase();
  const contentLower = content.toLowerCase();

  if (
    fileNameLower.includes('troubleshoot') ||
    contentLower.includes('troubleshooting') ||
    contentLower.includes('common issues') ||
    contentLower.includes('known limitations')
  ) {
    return 'troubleshooting';
  }

  if (
    fileNameLower.includes('example') ||
    fileNameLower.includes('demo') ||
    contentLower.includes('example usage')
  ) {
    return 'example';
  }

  if (
    fileNameLower.includes('api') ||
    fileNameLower.includes('reference')
  ) {
    return 'api';
  }

  return 'guide';
}

/**
 * Extract platform mentions from content
 */
function extractPlatforms(content: string): ('ios' | 'android')[] {
  const platforms: ('ios' | 'android')[] = [];
  const contentLower = content.toLowerCase();

  // Check for platform-specific indicators
  const iosIndicators = [
    'ios',
    'iphone',
    'ipad',
    'swift',
    'xcode',
    'apple',
    'cocoapods',
    'simulator',
  ];
  const androidIndicators = [
    'android',
    'kotlin',
    'gradle',
    'java',
    'emulator',
    'google play',
  ];

  const hasIos = iosIndicators.some((ind) => contentLower.includes(ind));
  const hasAndroid = androidIndicators.some((ind) =>
    contentLower.includes(ind)
  );

  if (hasIos) platforms.push('ios');
  if (hasAndroid) platforms.push('android');

  return platforms;
}

/**
 * Extract API names mentioned in content
 */
function extractMentionedApis(content: string): string[] {
  const apis: string[] = [];

  // Match camelCase or PascalCase API-like names
  const apiPattern =
    /\b(get[A-Z]\w+|is[A-Z]\w+|has[A-Z]\w+|sync[A-Z]\w+|[a-z]+[A-Z]\w*)\b/g;
  const matches = content.match(apiPattern) || [];

  // Filter to unique, likely API names
  const uniqueApis = new Set(
    matches.filter((m) => {
      // Filter out common non-API words
      const lower = m.toLowerCase();
      return (
        !['true', 'false', 'null', 'undefined', 'return', 'import', 'export', 'const', 'let', 'var', 'function', 'async', 'await', 'typeof', 'instanceof'].includes(lower) &&
        m.length > 3
      );
    })
  );

  return Array.from(uniqueApis);
}

/**
 * Parse a single markdown file into documentation chunks
 */
export function parseMarkdownFile(filePath: string): DocumentationChunk[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  return parseMarkdownContent(content, filePath);
}

/**
 * Parse markdown content string into documentation chunks
 */
export function parseMarkdownContent(
  content: string,
  source: string = 'unknown'
): DocumentationChunk[] {
  const chunks: DocumentationChunk[] = [];
  const docType = determineDocType(source, content);

  // Split content by headings
  const lines = content.split('\n');
  let currentChunk: {
    title: string;
    content: string[];
    level: number;
    parentId?: string;
  } | null = null;
  let chunkIndex = 0;

  // Track parent chain for hierarchy
  const parentStack: { id: string; level: number }[] = [];

  for (const line of lines) {
    // Check for heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

    if (headingMatch) {
      // Save previous chunk
      if (currentChunk && currentChunk.content.length > 0) {
        const chunkContent = currentChunk.content.join('\n').trim();
        if (chunkContent.length > 0) {
          chunks.push({
            id: `${path.basename(source, '.md')}-${chunkIndex}`,
            source,
            title: currentChunk.title,
            content: chunkContent,
            type: docType,
            headingLevel: currentChunk.level,
            parentId: currentChunk.parentId,
            mentionedApis: extractMentionedApis(chunkContent),
            platforms: extractPlatforms(chunkContent),
          });
          chunkIndex++;
        }
      }

      const level = headingMatch[1].length;
      const title = headingMatch[2].trim();

      // Update parent stack
      while (parentStack.length > 0 && parentStack[parentStack.length - 1].level >= level) {
        parentStack.pop();
      }

      const parentId =
        parentStack.length > 0
          ? parentStack[parentStack.length - 1].id
          : undefined;

      currentChunk = {
        title,
        content: [],
        level,
        parentId,
      };

      // Add current heading to parent stack
      parentStack.push({
        id: `${path.basename(source, '.md')}-${chunkIndex}`,
        level,
      });
    } else if (currentChunk) {
      // Add line to current chunk
      currentChunk.content.push(line);
    }
  }

  // Save last chunk
  if (currentChunk && currentChunk.content.length > 0) {
    const chunkContent = currentChunk.content.join('\n').trim();
    if (chunkContent.length > 0) {
      chunks.push({
        id: `${path.basename(source, '.md')}-${chunkIndex}`,
        source,
        title: currentChunk.title,
        content: chunkContent,
        type: docType,
        headingLevel: currentChunk.level,
        parentId: currentChunk.parentId,
        mentionedApis: extractMentionedApis(chunkContent),
        platforms: extractPlatforms(chunkContent),
      });
    }
  }

  return chunks;
}

/**
 * Parse all markdown files in a directory
 */
export function parseDocsDirectory(dirPath: string): DocumentationChunk[] {
  const chunks: DocumentationChunk[] = [];

  if (!fs.existsSync(dirPath)) {
    console.warn(`Documentation directory not found: ${dirPath}`);
    return chunks;
  }

  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively parse subdirectories
      chunks.push(...parseDocsDirectory(filePath));
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      try {
        chunks.push(...parseMarkdownFile(filePath));
      } catch (error) {
        console.warn(`Failed to parse ${filePath}: ${error}`);
      }
    }
  }

  return chunks;
}

/**
 * Get documentation paths relative to package root
 */
export function getDocsPaths(packageRoot: string): string[] {
  const possiblePaths = [
    path.join(packageRoot, '..', '..', 'docs', 'docs'),
    path.join(packageRoot, '..', '..', 'docs'),
    path.join(packageRoot, '..', 'docs'),
    path.join(packageRoot, 'docs'),
  ];

  return possiblePaths.filter((p) => fs.existsSync(p));
}

/**
 * Parse README file for quick reference content
 */
export function parseReadme(packageRoot: string): DocumentationChunk[] {
  const possiblePaths = [
    path.join(packageRoot, '..', '..', 'README.md'),
    path.join(packageRoot, '..', 'README.md'),
    path.join(packageRoot, 'README.md'),
  ];

  for (const readmePath of possiblePaths) {
    if (fs.existsSync(readmePath)) {
      try {
        return parseMarkdownFile(readmePath);
      } catch (error) {
        console.warn(`Failed to parse README: ${error}`);
      }
    }
  }

  return [];
}

/**
 * Create platform limitation documentation chunks
 */
export function createPlatformLimitationChunks(): DocumentationChunk[] {
  return [
    {
      id: 'platform-ios-limitations',
      source: 'internal',
      title: 'iOS Platform Limitations',
      content: `
Known iOS limitations and platform-specific behaviors:

- **getMacAddress**: Always returns "02:00:00:00:00:00" due to iOS privacy restrictions since iOS 7
- **getIsAirplaneMode**: Returns false on iOS (not accessible due to privacy APIs)
- **androidId, serialNumber**: Returns "unknown" on iOS (Android-specific)
- **lastUpdateTimeSync**: Returns -1 on iOS
- **isEmulator**: Detects iOS Simulator
- **getIpAddress on Simulator**: May return empty or localhost depending on network configuration
- **getBrightness**: Works on iOS, returns -1 on Android
- **isDisplayZoomed**: iOS-only feature

For iOS-specific issues, check that:
1. Your app has the required permissions in Info.plist
2. You're testing on a physical device for hardware-dependent features
3. Network settings are properly configured for IP/carrier APIs
      `.trim(),
      type: 'troubleshooting',
      headingLevel: 1,
      mentionedApis: [
        'getMacAddress',
        'getIsAirplaneMode',
        'androidId',
        'serialNumber',
        'lastUpdateTimeSync',
        'isEmulator',
        'getIpAddress',
        'getBrightness',
        'isDisplayZoomed',
      ],
      platforms: ['ios'],
    },
    {
      id: 'platform-android-limitations',
      source: 'internal',
      title: 'Android Platform Limitations',
      content: `
Known Android limitations and platform-specific behaviors:

- **getBrightness**: Returns -1 on Android (iOS-only)
- **isDisplayZoomed**: Returns false on Android (iOS-only)
- **getHasNotch**: Complex detection not fully implemented for all Android devices
- **getHasDynamicIsland**: Returns false on Android (iPhone-only feature)
- **serialNumber**: Requires READ_PHONE_STATE permission on Android 8.0+
- **androidId**: Unique per device/app/user combination, may reset on factory reset

For Android-specific issues, check that:
1. Required permissions are declared in AndroidManifest.xml
2. Runtime permissions are requested for sensitive APIs
3. Google Play Services is available for GMS-dependent features
4. Minimum API level requirements are met
      `.trim(),
      type: 'troubleshooting',
      headingLevel: 1,
      mentionedApis: [
        'getBrightness',
        'isDisplayZoomed',
        'getHasNotch',
        'getHasDynamicIsland',
        'serialNumber',
        'androidId',
      ],
      platforms: ['android'],
    },
  ];
}
