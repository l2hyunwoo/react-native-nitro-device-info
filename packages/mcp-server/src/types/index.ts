export interface Parameter {
  name: string;
  type: string;
  description: string;
  optional: boolean;
}

export type Platform =
  | { type: 'both' }
  | { type: 'ios'; minVersion?: string }
  | { type: 'android'; minApiLevel?: number }
  | { type: 'ios-only'; minVersion?: string }
  | { type: 'android-only'; minApiLevel?: number };

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

export interface ApiDefinition {
  /** HybridObject interface that owns this API */
  module?: string;

  name: string;

  /** Human-readable description from JSDoc */
  description: string;

  kind: 'method' | 'property';

  signature: string;

  returnType: string;

  /** Method parameters (empty for properties) */
  parameters: Parameter[];

  platform: Platform;

  /** Whether method is async (returns Promise) */
  isAsync: boolean;

  /** Code examples from JSDoc @example tags */
  examples: string[];

  /** Related API names for cross-reference */
  relatedApis: string[];

  category: ApiCategory;
}

export type DocumentType = 'api' | 'guide' | 'example' | 'troubleshooting';

export interface DocumentationChunk {
  id: string;

  /** Source file path relative to repo root */
  source: string;

  title: string;

  content: string;

  type: DocumentType;

  /** Heading level (1-6) */
  headingLevel: number;

  /** Parent chunk ID for hierarchy */
  parentId?: string;

  /** API names mentioned in this chunk */
  mentionedApis: string[];

  platforms: ('ios' | 'android')[];
}

export interface Highlight {
  field: string;

  /** Text excerpt with match markers */
  excerpt: string;
}

export interface SearchResult {
  item: ApiDefinition | DocumentationChunk;

  /** BM25 relevance score (0-100 normalized) */
  score: number;

  type: 'api' | 'documentation';

  highlights: Highlight[];
}

export interface SearchIndex {
  apis: Map<string, ApiDefinition>;

  chunks: DocumentationChunk[];

  /** BM25 inverted index: term -> document IDs */
  invertedIndex: Map<string, Set<string>>;

  /** Document lengths for BM25 */
  documentLengths: Map<string, number>;

  averageDocumentLength: number;

  documentCount: number;

  /** Term document frequencies for IDF calculation */
  termDocumentFrequencies: Map<string, number>;
}

export interface SearchFilters {
  type?: 'all' | 'api' | 'guide';

  platform?: 'all' | 'ios' | 'android' | 'both';

  category?: ApiCategory | 'all';

  kind?: 'all' | 'method' | 'property';
}

export type DeviceType =
  | 'Handset'
  | 'Tablet'
  | 'Tv'
  | 'Desktop'
  | 'GamingConsole'
  | 'unknown';

export type BatteryState = 'unknown' | 'unplugged' | 'charging' | 'full';

export type NavigationMode = 'gesture' | 'buttons' | 'twobuttons' | 'unknown';

export interface PowerState {
  batteryLevel: number;
  batteryState: BatteryState;
  lowPowerMode: boolean;
}
