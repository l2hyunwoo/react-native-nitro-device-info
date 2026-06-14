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
 * Category keywords mapping for automatic categorization (16-category structure)
 */
const CATEGORY_KEYWORDS: Record<string, ApiCategory> = {
  // Core Device Information
  deviceid: 'core-device-info',
  brand: 'core-device-info',
  model: 'core-device-info',
  systemname: 'core-device-info',
  systemversion: 'core-device-info',
  devicetype: 'core-device-info',
  manufacturer: 'core-device-info',
  devicename: 'core-device-info',

  // Device Capabilities
  tablet: 'device-capabilities',
  emulator: 'device-capabilities',
  simulator: 'device-capabilities',
  yearclass: 'device-capabilities',
  camera: 'device-capabilities',
  fingerprint: 'device-capabilities',
  pinorfingerprint: 'device-capabilities',
  hardwarekeystore: 'device-capabilities',
  lowram: 'device-capabilities',

  // Display & Screen
  notch: 'display-screen',
  dynamicisland: 'display-screen',
  displayzoom: 'display-screen',
  landscape: 'display-screen',
  brightness: 'display-screen',
  fontscale: 'display-screen',
  liquidglass: 'display-screen',

  // System Resources
  memory: 'system-resources',
  ram: 'system-resources',
  disk: 'system-resources',
  storage: 'system-resources',
  uptime: 'system-resources',
  startup: 'system-resources',

  // Battery & Power
  battery: 'battery-power',
  power: 'battery-power',
  charging: 'battery-power',
  lowpower: 'battery-power',

  // Application Metadata
  version: 'application-metadata',
  buildnumber: 'application-metadata',
  bundleid: 'application-metadata',
  applicationname: 'application-metadata',
  readableversion: 'application-metadata',
  firstinstall: 'application-metadata',
  lastupdate: 'application-metadata',

  // Network
  ipaddress: 'network',
  macaddress: 'network',
  useragent: 'network',
  airplane: 'network',

  // Carrier Information
  carrier: 'carrier-info',
  voip: 'carrier-info',
  carrierisocode: 'carrier-info',
  mobilecountrycode: 'carrier-info',
  mobilenetworkcode: 'carrier-info',
  mobilenetworkoperator: 'carrier-info',

  // Audio Accessories
  headphone: 'audio-accessories',
  wiredheadphone: 'audio-accessories',
  bluetoothheadphone: 'audio-accessories',

  // Location Services
  location: 'location-services',
  locationprovider: 'location-services',

  // Localization
  systemlanguage: 'localization',

  // CPU & Architecture
  supportedabi: 'cpu-architecture',
  supported32bit: 'cpu-architecture',
  supported64bit: 'cpu-architecture',

  // Android Platform
  apilevel: 'android-platform',
  navigationmode: 'android-platform',
  gms: 'android-platform',
  hms: 'android-platform',
  hasfeature: 'android-platform',
  systemfeature: 'android-platform',
  mediatype: 'android-platform',
  bootloader: 'android-platform',
  codename: 'android-platform',
  hardware: 'android-platform',
  incremental: 'android-platform',
  serial: 'android-platform',
  securitypatch: 'android-platform',
  buildfingerprint: 'android-platform',

  // iOS Platform
  devicetoken: 'ios-platform',
  syncuniqueid: 'ios-platform',

  // Installation & Distribution
  installerpackage: 'installation-distribution',
  installreferrer: 'installation-distribution',
  sideload: 'installation-distribution',

  // Legacy Compatibility
  totaldiskcapacityold: 'legacy-compatibility',
  freediskstorageold: 'legacy-compatibility',

  // Device Integrity & Attestation
  integrity: 'device-integrity',
  jailbreak: 'device-integrity',
  root: 'device-integrity',
  rooted: 'device-integrity',
  attest: 'device-integrity',
  attestation: 'device-integrity',
  attestkey: 'device-integrity',
  assertion: 'device-integrity',
  generatekey: 'device-integrity',
  devicecheck: 'device-integrity',
  devicechecktoken: 'device-integrity',
  playintegrity: 'device-integrity',
  integritytoken: 'device-integrity',
  provider: 'device-integrity',
  supported: 'device-integrity',
  providertype: 'device-integrity',
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

  return 'core-device-info'; // Default category
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
 * Parse a `.nitro.ts` file and extract all API definitions from the named
 * HybridObject interface (defaults to `DeviceInfo`).
 */
export function parseDeviceInfoFile(
  filePath: string,
  interfaceName: string = 'DeviceInfo'
): ApiDefinition[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  return parseDeviceInfoContent(content, interfaceName);
}

/**
 * Parse a `.nitro.ts` content string and extract all API definitions from the
 * named HybridObject interface (defaults to `DeviceInfo`).
 */
export function parseDeviceInfoContent(
  content: string,
  interfaceName: string = 'DeviceInfo'
): ApiDefinition[] {
  const apis: ApiDefinition[] = [];

  // Find the target interface (e.g. DeviceInfo or DeviceIntegrity)
  const interfaceMatch = content.match(
    new RegExp(
      `export\\s+interface\\s+${interfaceName}[\\s\\S]*?\\{([\\s\\S]*?)\\n\\}`
    )
  );

  if (!interfaceMatch) {
    console.warn(`Could not find ${interfaceName} interface in file`);
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
 * Resolve a `.nitro.ts` spec path within the monorepo.
 *
 * The server runs from `packages/mcp-server/dist` (built) or
 * `packages/mcp-server/src` (dev). Specs live under
 * `packages/<pkg>/src/<File>.nitro.ts`. We search up the tree so both layouts
 * and the legacy repo-root `src/` layout resolve.
 */
function resolveNitroPath(
  packageRoot: string,
  pkgDir: string,
  fileName: string
): string {
  const possiblePaths = [
    // From packages/mcp-server/{dist,src} -> packages/<pkg>/src/<File>
    path.join(packageRoot, '..', '..', pkgDir, 'src', fileName),
    // From packages/mcp-server -> packages/<pkg>/src/<File>
    path.join(packageRoot, '..', pkgDir, 'src', fileName),
    // Legacy: repo-root src/ layout
    path.join(packageRoot, '..', '..', '..', 'src', fileName),
    path.join(packageRoot, '..', '..', 'src', fileName),
    path.join(packageRoot, '..', 'src', fileName),
    path.join(packageRoot, 'src', fileName),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  throw new Error(
    `Could not find ${fileName}. Searched: ${possiblePaths.join(', ')}`
  );
}

/**
 * Get the path to the core `DeviceInfo.nitro.ts`.
 */
export function getDeviceInfoPath(packageRoot: string): string {
  return resolveNitroPath(
    packageRoot,
    'react-native-nitro-device-info',
    'DeviceInfo.nitro.ts'
  );
}

/**
 * Get the path to the opt-in `DeviceIntegrity.nitro.ts` (attestation package).
 */
export function getDeviceIntegrityPath(packageRoot: string): string {
  return resolveNitroPath(
    packageRoot,
    'react-native-nitro-device-integrity',
    'DeviceIntegrity.nitro.ts'
  );
}
