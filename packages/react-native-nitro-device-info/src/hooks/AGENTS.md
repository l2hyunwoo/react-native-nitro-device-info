<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-13 -->

# hooks/ (React Hooks)

## Purpose
React hooks for polling-based runtime device monitoring. Provides reactive state updates for battery, audio, brightness, and power properties at 5-second intervals.

## Key Files

| File | Description |
|------|-------------|
| `index.ts` | Barrel export for all hooks |
| `useBatteryLevel.ts` | Hook returning current battery level (0.0-1.0) |
| `useBatteryLevelIsLow.ts` | Hook returning boolean for low battery (Android: 0.15, iOS: 0.2) |
| `useBrightness.ts` | Hook returning screen brightness level |
| `useIsHeadphonesConnected.ts` | Hook for any headphones connected |
| `useIsWiredHeadphonesConnected.ts` | Hook for wired headphones |
| `useIsBluetoothHeadphonesConnected.ts` | Hook for Bluetooth headphones |
| `usePowerState.ts` | Hook returning PowerState object |
| `utils.ts` | Shared utilities: `LOW_BATTERY_THRESHOLD` (Android: 0.15, iOS: 0.2) |

## For AI Agents

### Working In This Directory
- All hooks follow the same pattern: `useState` + `useEffect` + `setInterval(5000ms)`
- Each hook calls the corresponding sync getter from `DeviceInfoModule`
- Hooks are re-exported from the main `src/index.ts`

### Testing Requirements
- Verify hooks update state at 5-second intervals
- Test cleanup (clearInterval) on unmount
- Verify platform-specific thresholds in utils.ts

### Common Patterns
```typescript
export function useXxx(): Type {
  const [value, setValue] = useState<Type>(DeviceInfoModule.getXxx());
  useEffect(() => {
    const interval = setInterval(() => {
      setValue(DeviceInfoModule.getXxx());
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  return value;
}
```

## Dependencies

### Internal
- `DeviceInfoModule` singleton from `../index.ts`
- `PowerState`, `BatteryState` types from `../DeviceInfo.nitro.ts`

### External
- `react` - useState, useEffect hooks

<!-- MANUAL: -->
