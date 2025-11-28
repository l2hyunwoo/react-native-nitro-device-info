/**
 * TypeScript Type Contracts for Enhanced Example Apps
 *
 * These types serve as the contract between UI components, data fetching logic,
 * and benchmark runners. To avoid code duplication, import these types from this
 * file wherever they are needed (e.g., in example/showcase/src/types/ and
 * example/benchmark/src/types/).
 */

// ============================================================================
// Property Types (Showcase App)
// ============================================================================

/**
 * Logical grouping categories for device properties
 */
export enum PropertyCategory {
  DEVICE_IDENTITY = 'Device Identity',
  DEVICE_CAPABILITIES = 'Device Capabilities',
  DEVICE_IDENTIFICATION = 'Device Identification',
  BATTERY_POWER = 'Battery & Power',
  SYSTEM_RESOURCES = 'System Resources',
  APP_METADATA = 'Application Metadata',
  NETWORK_CONNECTIVITY = 'Network & Connectivity',
  LOCALIZATION_NAVIGATION = 'Localization & Navigation',
  PLATFORM_CAPABILITIES = 'Platform Capabilities',
  ANDROID_BUILD_INFO = 'Android Build Information',
  ADVANCED_FEATURES = 'Advanced Features',
}

/**
 * Data type classification for value formatting
 */
export enum PropertyType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  OBJECT = 'object',      // For PowerState, etc.
  ARRAY = 'array',        // For getSupportedAbis(), etc.
  BYTES = 'bytes',        // For memory/storage (needs GB formatting)
  TIMESTAMP = 'timestamp', // For milliseconds since epoch
}

/**
 * Platform support indication
 */
export enum PlatformAvailability {
  ALL = 'all',           // Available on iOS and Android
  IOS_ONLY = 'ios',      // iOS exclusive
  ANDROID_ONLY = 'android', // Android exclusive
  UNKNOWN = 'unknown',   // Platform support unclear
}

/**
 * Single device information property
 */
export interface DeviceProperty {
  /** Unique identifier (e.g., "deviceId", "batteryLevel") */
  key: string;

  /** Display label (e.g., "Device ID", "Battery Level") */
  label: string;

  /** The actual property value (can be null in error states) */
  value: string | number | boolean | object | null;

  /** Which category this property belongs to */
  category: PropertyCategory;

  /** Data type for formatting */
  type: PropertyType;

  /** Platform support */
  platform: PlatformAvailability;

  /** true if synchronous, false if async */
  isSync: boolean;

  /** Error message if property fetch failed */
  errorState?: string;
}

/**
 * State management for showcase app
 */
export interface ShowcaseState {
  /** All device properties */
  properties: DeviceProperty[];

  /** Loading async properties */
  loading: boolean;

  /** Which categories are expanded */
  expandedCategories: Set<PropertyCategory>;

  /** Global error state */
  error?: string;
}

// ============================================================================
// Benchmark Types
// ============================================================================

/**
 * Library being benchmarked
 */
export enum LibraryType {
  NITRO = 'nitro',
  DEVICE_INFO = 'device-info',
}

/**
 * Performance measurement result for a single method
 */
export interface BenchmarkResult {
  /** Method being benchmarked (e.g., "getUniqueId()") */
  methodName: string;

  /** Which library this result is for */
  library: LibraryType;

  /** Number of iterations run */
  iterations: number;

  /** Average execution time (ms) */
  avgTime: number;

  /** Minimum execution time (ms) */
  minTime: number;

  /** Maximum execution time (ms) */
  maxTime: number;

  /** Standard deviation (ms) */
  stdDev: number;

  /** Performance target (<1ms or <100ms) */
  target: number;

  /** Whether result meets target */
  passed: boolean;

  /** Error message if benchmark failed */
  error?: string;
}

/**
 * Status of a comparison between two benchmarks
 */
export enum ComparisonStatus {
  BOTH_PASSED = 'both-passed',
  NITRO_ONLY_PASSED = 'nitro-only-passed',
  DEVICE_INFO_ONLY_PASSED = 'device-info-only-passed',
  BOTH_FAILED = 'both-failed',
  ERROR = 'error',
}

/**
 * Side-by-side comparison between nitro and device-info for one method
 */
export interface ComparisonResult {
  /** Method name being compared */
  methodName: string;

  /** Nitro benchmark result */
  nitroBenchmark: BenchmarkResult;

  /** react-native-device-info benchmark result */
  deviceInfoBenchmark: BenchmarkResult;

  /** Performance multiplier (deviceInfoAvgTime / nitroAvgTime) */
  speedupMultiplier: number;

  /** true if multiplier >= 2.0 */
  isSignificant: boolean;

  /** Overall comparison status */
  status: ComparisonStatus;
}

/**
 * Aggregate statistics and marketing data
 */
export interface PerformanceMetrics {
  /** All method comparisons */
  comparisons: ComparisonResult[];

  /** Total number of methods benchmarked */
  totalMethods: number;

  /** Number of successful comparisons (no errors) */
  successfulComparisons: number;

  /** Average speedup across significant comparisons */
  avgSpeedupMultiplier: number;

  /** Highest multiplier across all methods */
  maxSpeedupMultiplier: number;

  /** Percentage of Nitro methods passing targets (0-100) */
  nitroPassRate: number;

  /** Percentage of DeviceInfo methods passing targets (0-100) */
  deviceInfoPassRate: number;

  /** Generated marketing headline */
  marketingCatchphrase: string;

  /** When benchmark was run (milliseconds since epoch) */
  timestamp: number;
}

/**
 * Benchmark execution status
 */
export enum BenchmarkStatus {
  NOT_STARTED = 'not-started',
  WARMING_UP = 'warming-up',
  RUNNING = 'running',
  COMPLETED = 'completed',
  ERROR = 'error',
}

/**
 * State management for benchmark app
 */
export interface BenchmarkState {
  /** Benchmark results organized by library */
  benchmarks: {
    nitro: Map<string, BenchmarkResult>;
    deviceInfo: Map<string, BenchmarkResult>;
  };

  /** Comparison results */
  comparisons: ComparisonResult[];

  /** Aggregate metrics (undefined until benchmarks complete) */
  metrics?: PerformanceMetrics;

  /** Current execution status */
  status: BenchmarkStatus;

  /** Method currently being benchmarked */
  currentMethod?: string;

  /** Progress percentage (0-100) */
  progress: number;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Configuration for a benchmark method
 */
export interface BenchmarkMethodConfig {
  /** Method name */
  name: string;

  /** Method to execute for Nitro */
  nitroFn: () => any | Promise<any>;

  /** Method to execute for DeviceInfo */
  deviceInfoFn: () => any | Promise<any>;

  /** Whether method is asynchronous */
  isAsync: boolean;

  /** Number of iterations (1000 for sync, 10 for async) */
  iterations: number;

  /** Performance target in ms */
  target: number;
}

/**
 * Navigation params for showcase app
 */
export type ShowcaseStackParamList = {
  Home: undefined;
  DeviceInfo: undefined;
  CategoryDetail: {
    category: PropertyCategory;
  };
};

/**
 * Helper type for property value formatters
 */
export type PropertyFormatter = (value: any, type: PropertyType) => string;

/**
 * Helper type for benchmark runner functions
 */
export type BenchmarkRunner = (
  fn: () => any | Promise<any>,
  iterations: number,
  isAsync: boolean
) => Promise<{
  avgTime: number;
  minTime: number;
  maxTime: number;
  stdDev: number;
}>;
