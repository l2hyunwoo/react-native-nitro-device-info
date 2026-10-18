/**
 * TypeScript Type Contracts for Enhanced Example Apps
 *
 * These types serve as the contract between UI components, data fetching logic,
 * and benchmark runners. To avoid code duplication, import these types from this
 * file wherever they are needed (e.g., in example/showcase/src/types/ and
 * example/benchmark/src/types/).
 */

// Property Types (Showcase App)

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
  DEVICE_INTEGRITY = 'Device Integrity',
}

export enum PropertyType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  OBJECT = 'object',
  ARRAY = 'array',
  BYTES = 'bytes',        // For memory/storage (needs GB formatting)
  TIMESTAMP = 'timestamp', // For milliseconds since epoch
}

export enum PlatformAvailability {
  ALL = 'all',
  IOS_ONLY = 'ios',
  ANDROID_ONLY = 'android',
  UNKNOWN = 'unknown',
}

export interface DeviceProperty {
  /** Unique identifier (e.g., "deviceId", "batteryLevel") */
  key: string;

  /** Display label (e.g., "Device ID", "Battery Level") */
  label: string;

  /** The actual property value (can be null in error states) */
  value: string | number | boolean | object | null;

  category: PropertyCategory;

  type: PropertyType;

  platform: PlatformAvailability;

  isSync: boolean;

  errorState?: string;
}

export interface ShowcaseState {
  properties: DeviceProperty[];

  /** Loading async properties */
  loading: boolean;

  expandedCategories: Set<PropertyCategory>;

  error?: string;
}

// Benchmark Types

export enum LibraryType {
  NITRO = 'nitro',
  DEVICE_INFO = 'device-info',
}

export interface BenchmarkResult {
  /** Method being benchmarked (e.g., "getUniqueId()") */
  methodName: string;

  library: LibraryType;

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

  passed: boolean;

  error?: string;
}

export enum ComparisonStatus {
  BOTH_PASSED = 'both-passed',
  NITRO_ONLY_PASSED = 'nitro-only-passed',
  DEVICE_INFO_ONLY_PASSED = 'device-info-only-passed',
  BOTH_FAILED = 'both-failed',
  ERROR = 'error',
}

export interface ComparisonResult {
  methodName: string;

  nitroBenchmark: BenchmarkResult;

  /** react-native-device-info benchmark result */
  deviceInfoBenchmark: BenchmarkResult;

  /** Performance multiplier (deviceInfoAvgTime / nitroAvgTime) */
  speedupMultiplier: number;

  /** true if multiplier >= 2.0 */
  isSignificant: boolean;

  status: ComparisonStatus;
}

export interface PerformanceMetrics {
  comparisons: ComparisonResult[];

  totalMethods: number;

  /** Number of successful comparisons (no errors) */
  successfulComparisons: number;

  /** Average speedup across significant comparisons */
  avgSpeedupMultiplier: number;

  maxSpeedupMultiplier: number;

  /** Percentage of Nitro methods passing targets (0-100) */
  nitroPassRate: number;

  /** Percentage of DeviceInfo methods passing targets (0-100) */
  deviceInfoPassRate: number;

  marketingCatchphrase: string;

  /** When benchmark was run (milliseconds since epoch) */
  timestamp: number;
}

export enum BenchmarkStatus {
  NOT_STARTED = 'not-started',
  WARMING_UP = 'warming-up',
  RUNNING = 'running',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export interface BenchmarkState {
  benchmarks: {
    nitro: Map<string, BenchmarkResult>;
    deviceInfo: Map<string, BenchmarkResult>;
  };

  comparisons: ComparisonResult[];

  /** Aggregate metrics (undefined until benchmarks complete) */
  metrics?: PerformanceMetrics;

  status: BenchmarkStatus;

  currentMethod?: string;

  /** Progress percentage (0-100) */
  progress: number;
}

// Utility Types

export interface BenchmarkMethodConfig {
  name: string;

  nitroFn: () => any | Promise<any>;

  deviceInfoFn: () => any | Promise<any>;

  isAsync: boolean;

  /** Number of iterations (1000 for sync, 10 for async) */
  iterations: number;

  /** Performance target in ms */
  target: number;
}

export type ShowcaseStackParamList = {
  Home: undefined;
  DeviceInfo: undefined;
  CategoryDetail: {
    category: PropertyCategory;
  };
};

export type PropertyFormatter = (value: any, type: PropertyType) => string;

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
