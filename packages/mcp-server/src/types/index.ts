/**
 * MCP Server Types for react-native-nitro-device-info
 *
 * These types define the data structures used by the MCP server
 * for indexing and serving documentation.
 */

/**
 * Parameter definition for API methods
 */
export interface Parameter {
  name: string;
  type: string;
  description: string;
  optional: boolean;
}

/**
 * Platform availability information
 */
export type Platform =
  | { type: 'both' }
  | { type: 'ios'; minVersion?: string }
  | { type: 'android'; minApiLevel?: number }
  | { type: 'ios-only'; minVersion?: string }
  | { type: 'android-only'; minApiLevel?: number };

/**
 * API categories for grouping (16-category structure)
 */
export type ApiCategory =
  | 'core-device-info'
  | 'device-capabilities'
  | 'display-screen'
  | 'system-resources'
  | 'battery-power'
  | 'application-metadata'
  | 'network'
  | 'carrier-info'
  | 'audio-accessories'
  | 'location-services'
  | 'localization'
  | 'cpu-architecture'
  | 'android-platform'
  | 'ios-platform'
  | 'installation-distribution'
  | 'legacy-compatibility'
  | 'device-integrity';

/**
 * Represents a single API method or property from the DeviceInfo interface
 */
export interface ApiDefinition {
  /** Unique identifier (method/property name) */
  name: string;

  /** Human-readable description from JSDoc */
  description: string;

  /** Whether this is a method or readonly property */
  kind: 'method' | 'property';

  /** TypeScript signature */
  signature: string;

  /** Return type */
  returnType: string;

  /** Method parameters (empty for properties) */
  parameters: Parameter[];

  /** Platform availability */
  platform: Platform;

  /** Whether method is async (returns Promise) */
  isAsync: boolean;

  /** Code examples from JSDoc @example tags */
  examples: string[];

  /** Related API names for cross-reference */
  relatedApis: string[];

  /** Category for grouping */
  category: ApiCategory;
}

/**
 * Document type for search results
 */
export type DocumentType = 'api' | 'guide' | 'example' | 'troubleshooting';

/**
 * Represents a searchable section of documentation
 */
export interface DocumentationChunk {
  /** Unique identifier */
  id: string;

  /** Source file path relative to repo root */
  source: string;

  /** Heading/title of this chunk */
  title: string;

  /** Full text content for search */
  content: string;

  /** Document type */
  type: DocumentType;

  /** Heading level (1-6) */
  headingLevel: number;

  /** Parent chunk ID for hierarchy */
  parentId?: string;

  /** API names mentioned in this chunk */
  mentionedApis: string[];

  /** Platform tags if applicable */
  platforms: ('ios' | 'android')[];
}

/**
 * Highlight information for search results
 */
export interface Highlight {
  /** Field that matched */
  field: string;

  /** Text excerpt with match markers */
  excerpt: string;
}

/**
 * Represents a ranked search result
 */
export interface SearchResult {
  /** The matched item */
  item: ApiDefinition | DocumentationChunk;

  /** BM25 relevance score (0-100 normalized) */
  score: number;

  /** Type discriminator */
  type: 'api' | 'documentation';

  /** Matching excerpts with highlights */
  highlights: Highlight[];
}

/**
 * In-memory search index structure
 */
export interface SearchIndex {
  /** All indexed API definitions */
  apis: Map<string, ApiDefinition>;

  /** All documentation chunks */
  chunks: DocumentationChunk[];

  /** BM25 inverted index: term -> document IDs */
  invertedIndex: Map<string, Set<string>>;

  /** Document lengths for BM25 */
  documentLengths: Map<string, number>;

  /** Average document length */
  averageDocumentLength: number;

  /** Total document count */
  documentCount: number;

  /** Term document frequencies for IDF calculation */
  termDocumentFrequencies: Map<string, number>;
}

/**
 * Search filter options
 */
export interface SearchFilters {
  /** Filter by content type */
  type?: 'all' | 'api' | 'guide';

  /** Filter by platform */
  platform?: 'all' | 'ios' | 'android' | 'both';

  /** Filter by API category */
  category?: ApiCategory | 'all';

  /** Filter by API kind */
  kind?: 'all' | 'method' | 'property';
}

/**
 * Device types from the library
 */
export type DeviceType =
  | 'Handset'
  | 'Tablet'
  | 'Tv'
  | 'Desktop'
  | 'GamingConsole'
  | 'unknown';

/**
 * Battery charging states
 */
export type BatteryState = 'unknown' | 'unplugged' | 'charging' | 'full';

/**
 * Android navigation mode types
 */
export type NavigationMode = 'gesture' | 'buttons' | 'twobuttons' | 'unknown';

/**
 * Power state information
 */
export interface PowerState {
  batteryLevel: number;
  batteryState: BatteryState;
  lowPowerMode: boolean;
}
