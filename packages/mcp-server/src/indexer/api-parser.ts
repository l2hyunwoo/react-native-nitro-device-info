/**
 * API Parser for DeviceInfo.nitro.ts
 *
 * Extracts method signatures, JSDoc comments, and platform tags
 * from the TypeScript interface definition.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { ApiDefinition, ApiCategory, Platform, Parameter } from '../types/index.js';

/**
 * Category keywords mapping for automatic categorization
 */
const CATEGORY_KEYWORDS: Record<string, ApiCategory> = {
  // Battery & Power
  battery: 'battery',
  power: 'battery',
  charging: 'battery',
  lowpower: 'battery',

  // Memory
  memory: 'memory',
  ram: 'memory',

  // Storage
  disk: 'storage',
  storage: 'storage',

  // Network
  ip: 'network',
  mac: 'network',
  carrier: 'network',
  network: 'network',

  // Capabilities
  notch: 'capabilities',
  dynamicisland: 'capabilities',
  emulator: 'capabilities',
  simulator: 'capabilities',
  tablet: 'capabilities',
  camera: 'capabilities',
  fingerprint: 'capabilities',
  gms: 'capabilities',
  hms: 'capabilities',
  feature: 'capabilities',
  landscape: 'capabilities',

  // Application
  version: 'application',
  build: 'application',
  bundle: 'application',
  application: 'application',
  install: 'application',
  referrer: 'application',
  useragent: 'application',

  // Platform-specific
  android: 'platform-specific',
  serial: 'platform-specific',
  security: 'platform-specific',
  bootloader: 'platform-specific',
  codename: 'platform-specific',
  hardware: 'platform-specific',
  incremental: 'platform-specific',
  navigation: 'platform-specific',

  // Display
  brightness: 'display',
  fontscale: 'display',
  display: 'display',
  zoom: 'display',

  // Audio
  headphone: 'audio',
  bluetooth: 'audio',
  audio: 'audio',

  // Location
  location: 'location',
  airplane: 'location',

  // Identification
  unique: 'identification',
  devicetoken: 'identification',
  idfv: 'identification',
};

/**
 * Parse JSDoc comment block
 */
function parseJsDoc(comment: string): {
  description: string;
  platform: Platform;
  examples: string[];
  params: Parameter[];
  returns: string;
  async: boolean;
} {
  const lines = comment.split('\n').map((l) => l.trim().replace(/^\*\s?/, ''));

  let description = '';
  let platform: Platform = { type: 'both' };
  const examples: string[] = [];
  const params: Parameter[] = [];
  let returns = '';
  let isAsync = false;

  let currentSection = 'description';
  let currentExample = '';

  for (const line of lines) {
    // Check for @tags
    if (line.startsWith('@platform')) {
      const platformText = line.replace('@platform', '').trim().toLowerCase();
      if (platformText.includes('android') && platformText.includes('ios')) {
        platform = { type: 'both' };
      } else if (platformText.includes('android only') || platformText === 'android') {
        const apiMatch = platformText.match(/api\s*(\d+)/i);
        platform = {
          type: 'android-only',
          minApiLevel: apiMatch ? parseInt(apiMatch[1]) : undefined,
        };
      } else if (platformText.includes('ios only') || platformText === 'ios') {
        const versionMatch = platformText.match(/ios\s*([\d.]+)/i);
        platform = {
          type: 'ios-only',
          minVersion: versionMatch ? versionMatch[1] : undefined,
        };
      } else if (platformText.includes('android')) {
        const apiMatch = platformText.match(/api\s*(\d+)/i);
        platform = {
          type: 'android',
          minApiLevel: apiMatch ? parseInt(apiMatch[1]) : undefined,
        };
      } else if (platformText.includes('ios')) {
        const versionMatch = platformText.match(/([\d.]+)/);
        platform = {
          type: 'ios',
          minVersion: versionMatch ? versionMatch[1] : undefined,
        };
      }
      continue;
    }

    if (line.startsWith('@example')) {
      currentSection = 'example';
      currentExample = '';
      continue;
    }

    if (line.startsWith('@param')) {
      currentSection = 'param';
      const paramMatch = line.match(/@param\s+(\w+)\s*(.*)/);
      if (paramMatch) {
        params.push({
          name: paramMatch[1],
          type: 'unknown', // Will be extracted from signature
          description: paramMatch[2] || '',
          optional: false,
        });
      }
      continue;
    }

    if (line.startsWith('@returns') || line.startsWith('@return')) {
      currentSection = 'returns';
      returns = line.replace(/@returns?\s*/, '');
      continue;
    }

    if (line.startsWith('@async')) {
      isAsync = true;
      continue;
    }

    if (line.startsWith('@')) {
      // Skip other tags
      currentSection = 'other';
      continue;
    }

    // Accumulate content based on current section
    if (currentSection === 'description' && line && !line.startsWith('```')) {
      description += (description ? ' ' : '') + line;
    } else if (currentSection === 'example') {
      currentExample += line + '\n';
    } else if (currentSection === 'returns' && line) {
      returns += ' ' + line;
    }
  }

  if (currentExample.trim()) {
    examples.push(currentExample.trim());
  }

  return {
    description: description.trim(),
    platform,
    examples,
    params,
    returns: returns.trim(),
    async: isAsync,
  };
}

/**
 * Determine API category based on name and description
 */
function determineCategory(name: string, description: string): ApiCategory {
  const searchText = (name + ' ' + description).toLowerCase();

  for (const [keyword, category] of Object.entries(CATEGORY_KEYWORDS)) {
    if (searchText.includes(keyword)) {
      return category;
    }
  }

  return 'device-info'; // Default category
}

/**
 * Parse a single API member (method or property)
 */
function parseApiMember(
  memberText: string,
  jsDocComment: string
): ApiDefinition | null {
  const jsDoc = parseJsDoc(jsDocComment);

  // Check if it's a readonly property
  const propertyMatch = memberText.match(
    /readonly\s+(\w+):\s*([^;]+)/
  );
  if (propertyMatch) {
    const [, name, returnType] = propertyMatch;
    return {
      name,
      description: jsDoc.description,
      kind: 'property',
      signature: `readonly ${name}: ${returnType.trim()}`,
      returnType: returnType.trim(),
      parameters: [],
      platform: jsDoc.platform,
      isAsync: false,
      examples: jsDoc.examples,
      relatedApis: findRelatedApis(name),
      category: determineCategory(name, jsDoc.description),
    };
  }

  // Check if it's a method
  const methodMatch = memberText.match(
    /(\w+)\s*\(([^)]*)\)\s*:\s*([^;]+)/
  );
  if (methodMatch) {
    const [, name, paramsStr, returnType] = methodMatch;

    // Parse parameters
    const parameters: Parameter[] = [];
    if (paramsStr.trim()) {
      const paramParts = paramsStr.split(',');
      for (const param of paramParts) {
        const paramMatch = param.trim().match(/(\w+)(\?)?:\s*(.+)/);
        if (paramMatch) {
          const [, paramName, optional, paramType] = paramMatch;
          const jsDocParam = jsDoc.params.find((p) => p.name === paramName);
          parameters.push({
            name: paramName,
            type: paramType.trim(),
            description: jsDocParam?.description || '',
            optional: !!optional,
          });
        }
      }
    }

    const isAsync =
      jsDoc.async || returnType.trim().startsWith('Promise<');
    const cleanReturnType = returnType.trim();

    return {
      name,
      description: jsDoc.description,
      kind: 'method',
      signature: `${name}(${paramsStr.trim()}): ${cleanReturnType}`,
      returnType: cleanReturnType,
      parameters,
      platform: jsDoc.platform,
      isAsync,
      examples: jsDoc.examples,
      relatedApis: findRelatedApis(name),
      category: determineCategory(name, jsDoc.description),
    };
  }

  return null;
}

/**
 * Find related APIs based on naming patterns
 */
function findRelatedApis(name: string): string[] {
  const related: string[] = [];
  const nameLower = name.toLowerCase();

  // Battery-related
  if (nameLower.includes('battery') || nameLower.includes('power') || nameLower.includes('charging')) {
    if (!nameLower.includes('getbatterylevel')) related.push('getBatteryLevel');
    if (!nameLower.includes('getpowerstate')) related.push('getPowerState');
    if (!nameLower.includes('getisbatterycharging')) related.push('getIsBatteryCharging');
    if (!nameLower.includes('islowbatterylevel')) related.push('isLowBatteryLevel');
  }

  // Memory-related
  if (nameLower.includes('memory')) {
    if (!nameLower.includes('totalmemory')) related.push('totalMemory');
    if (!nameLower.includes('getusedmemory')) related.push('getUsedMemory');
    if (!nameLower.includes('maxmemory')) related.push('maxMemory');
  }

  // Storage-related
  if (nameLower.includes('disk') || nameLower.includes('storage')) {
    if (!nameLower.includes('totaldiskcapacity')) related.push('totalDiskCapacity');
    if (!nameLower.includes('getfreediskstorage')) related.push('getFreeDiskStorage');
  }

  // Headphones-related
  if (nameLower.includes('headphone')) {
    if (!nameLower.includes('isheadphonesconnected')) related.push('isHeadphonesConnected');
    if (!nameLower.includes('iswiredheadphones')) related.push('getIsWiredHeadphonesConnected');
    if (!nameLower.includes('isbluetoothheadphones')) related.push('getIsBluetoothHeadphonesConnected');
  }

  // Limit to 3 related APIs
  return related.filter((r) => r.toLowerCase() !== nameLower).slice(0, 3);
}

/**
 * Parse DeviceInfo.nitro.ts file and extract all API definitions
 */
export function parseDeviceInfoFile(filePath: string): ApiDefinition[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  return parseDeviceInfoContent(content);
}

/**
 * Parse DeviceInfo content string and extract all API definitions
 */
export function parseDeviceInfoContent(content: string): ApiDefinition[] {
  const apis: ApiDefinition[] = [];

  // Find the DeviceInfo interface
  const interfaceMatch = content.match(
    /export\s+interface\s+DeviceInfo[\s\S]*?\{([\s\S]*?)\n\}/
  );

  if (!interfaceMatch) {
    console.warn('Could not find DeviceInfo interface in file');
    return apis;
  }

  const interfaceBody = interfaceMatch[1];

  // Split by JSDoc comments and member declarations
  const memberRegex = /\/\*\*[\s\S]*?\*\/\s*(?:readonly\s+\w+:[^;]+;|\w+\s*\([^)]*\)\s*:[^;]+;)/g;
  const matches = interfaceBody.match(memberRegex);

  if (!matches) {
    return apis;
  }

  for (const match of matches) {
    // Split into JSDoc and member
    const jsDocMatch = match.match(/\/\*\*([\s\S]*?)\*\//);
    const memberMatch = match.match(/\*\/\s*([\s\S]+)/);

    if (jsDocMatch && memberMatch) {
      const jsDoc = jsDocMatch[1];
      const member = memberMatch[1].trim();

      const api = parseApiMember(member, jsDoc);
      if (api) {
        apis.push(api);
      }
    }
  }

  return apis;
}

/**
 * Get the path to DeviceInfo.nitro.ts relative to package
 */
export function getDeviceInfoPath(packageRoot: string): string {
  // Try common locations
  const possiblePaths = [
    path.join(packageRoot, '..', '..', 'src', 'DeviceInfo.nitro.ts'),
    path.join(packageRoot, 'src', 'DeviceInfo.nitro.ts'),
    path.join(packageRoot, '..', 'src', 'DeviceInfo.nitro.ts'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  throw new Error(
    `Could not find DeviceInfo.nitro.ts. Searched: ${possiblePaths.join(', ')}`
  );
}
