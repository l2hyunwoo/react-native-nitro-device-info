# Device Integrity API

**Local-only** device integrity detection APIs for detecting rooted (Android) or jailbroken (iOS) devices.

## Overview

These APIs perform **local detection only** (file system checks, package detection, etc.) without any server-side verification. They're commonly used as one layer of defense in:

- Financial/banking apps
- Healthcare apps with sensitive data
- Enterprise MDM solutions
- Apps with DRM requirements

:::warning Limitations
**All detection methods are local-only and can be bypassed** by sophisticated tools (Magisk + Shamiko, RootHide, PlayIntegrityFix, etc.).

- **"Not detected" does NOT guarantee a secure device**
- These APIs do NOT use Play Integrity API or iOS App Attest
- Use as one layer of defense-in-depth, not as sole security measure
:::

## API Reference

### `isDeviceCompromised()`

Synchronously checks if the device is rooted (Android) or jailbroken (iOS).

```typescript
isDeviceCompromised(): boolean
```

**Returns:** `true` if device is compromised, `false` otherwise

**Performance:** <50ms

**Emulator Policy:** Returns `false` on emulators/simulators for development convenience.

---

### `verifyDeviceIntegrity()`

Asynchronous wrapper for device integrity verification.

```typescript
verifyDeviceIntegrity(): Promise<boolean>
```

**Returns:** Promise resolving to `true` if device is rooted/jailbroken

**Performance:**
- iOS: up to 200ms (includes SSH port scanning)
- Android: <50ms (async wrapper for `isDeviceCompromised()`)

**Platform Differences:**
- **iOS:** Includes SSH port scanning (ports 22, 44) in addition to all checks performed by `isDeviceCompromised()`. This additional check can detect OpenSSH installed by jailbreak tools.
- **Android:** Same as `isDeviceCompromised()`, provided as async wrapper for API consistency.

**Emulator Policy:** Returns `false` on emulators/simulators.

## Detection Methods

### Android

| Method | Priority | Description |
|--------|----------|-------------|
| su binaries | High | `/system/xbin/su`, `/system/bin/su`, `/sbin/su`, etc. |
| Magisk | High | `/data/adb/magisk`, Magisk Manager package |
| KernelSU | High | `/data/adb/ksu`, KernelSU Manager package |
| APatch | High | `/data/adb/apatch`, APatch Manager package |
| Busybox | Medium | `/system/xbin/busybox` |
| Build props | Medium | `ro.debuggable=1`, `ro.secure=0`, test-keys |
| Superuser apps | Low | Legacy SuperSU, Superuser.apk |

### iOS

| Method | Description |
|--------|-------------|
| Jailbreak apps | Cydia, Sileo, Zebra, Installer 5 |
| URL schemes | `cydia://`, `sileo://`, `zbra://`, `filza://` |
| System file write | `/private/jailbreak.txt` write test |
| DYLD injection | MobileSubstrate, libhooker, TweakInject |
| Symbolic links | `/Applications`, `/Library/Ringtones` |
| SSH ports | Port 22 (OpenSSH), Port 44 (checkra1n) |

## Usage Examples

### Basic Check

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

function SecurityCheck() {
  const isCompromised = DeviceInfoModule.isDeviceCompromised();

  if (isCompromised) {
    return <SecurityWarning />;
  }

  return <SecureContent />;
}
```

### Financial App Protection

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

async function performTransaction(amount: number) {
  // Use async API for enhanced verification
  const isCompromised = await DeviceInfoModule.verifyDeviceIntegrity();

  if (isCompromised) {
    throw new Error('Transaction blocked: Device integrity check failed');
  }

  // Proceed with transaction
  return processPayment(amount);
}
```

### Conditional Feature Access

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

function BiometricLogin() {
  const isSecure = !DeviceInfoModule.isDeviceCompromised();
  const hasBiometric = DeviceInfoModule.isPinOrFingerprintSet;

  if (!isSecure) {
    // Fall back to password-only login on compromised devices
    return <PasswordLogin />;
  }

  if (hasBiometric) {
    return <BiometricPrompt />;
  }

  return <PasswordLogin />;
}
```

## Platform Support

| API | iOS | Android |
|-----|-----|---------|
| `isDeviceCompromised()` | ✅ | ✅ |
| `verifyDeviceIntegrity()` | ✅ (+ SSH scan) | ✅ (async wrapper) |

## Best Practices

1. **Don't rely solely on detection** - Use as one layer of defense-in-depth
2. **Handle gracefully** - Don't crash, provide alternative flows
3. **Log for analytics** - Track detection rates for security insights
4. **Test on real devices** - Emulators always return `false`
5. **Update regularly** - New rooting tools emerge frequently

## See Also

- [Security Features](/guide/security)
- [isEmulator](/api/device-info#isemulator)
- [isPinOrFingerprintSet](/api/device-info#ispinorfingerprintset)
