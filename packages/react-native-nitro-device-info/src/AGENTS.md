<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-13 -->

# src/ (TypeScript Source)

## Purpose
TypeScript source code for the library. Contains the Nitro interface contract (single source of truth), public API exports, type definitions, and React hooks for runtime monitoring.

## Key Files

| File | Description |
|------|-------------|
| `DeviceInfo.nitro.ts` | **SINGLE SOURCE OF TRUTH** - Defines `DeviceInfo` HybridObject with 80+ properties/methods. Parsed by Nitrogen to generate native bindings. |
| `index.ts` | Public API: `createDeviceInfo` factory, `DeviceInfoModule` singleton, re-exports types and hooks |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `hooks/` | React hooks for runtime device monitoring (see `hooks/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- `DeviceInfo.nitro.ts` defines the complete API contract
- After editing `.nitro.ts`, run `yarn nitrogen` to regenerate native bindings
- Types defined: `PowerState`, `DeviceType`, `BatteryState`, `NavigationMode`
- API categories: Core device info, Capabilities, Display, Resources, Battery, App metadata, Network, Carrier, Audio, Location, Localization, CPU, Android/iOS platform-specific, Integrity
- `index.ts` exports `createDeviceInfo()` factory and `DeviceInfoModule` singleton pattern

### Testing Requirements
- `yarn typecheck` must pass after any changes
- Verify new types/interfaces are properly exported from `index.ts`
- All property/method signatures must match native implementations exactly

### Common Patterns
- Sync property: `readonly propertyName: string`
- Async method: `methodName(): Promise<string>`
- Platform-specific: annotated with `@platform ios` or `@platform android` JSDoc
- Enums: `export enum BatteryState { UNKNOWN, UNPLUGGED, CHARGING, FULL }`
- Objects: `export interface PowerState { batteryLevel: number; ... }`

## Dependencies

### Internal
- Consumed by `nitrogen/` (code generation input)
- Consumed by `ios/DeviceInfo.swift` and `android/.../DeviceInfo.kt` (implementation contract)

### External
- `react-native-nitro-modules` - Provides `HybridObject` type

<!-- MANUAL: -->
