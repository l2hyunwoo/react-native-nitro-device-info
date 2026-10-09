---
translationOf: api/device-integrity.md
sourceCommit: 3d53f125a194764ed27ccee3131d5dbc8abaf0ec
---

# 기기 무결성 API {#device-integrity-api}

Android 루팅 또는 iOS 탈옥 기기를 탐지하는 **로컬 전용** 무결성 검사 API입니다.

:::tip 서버에서 검증할 수 있는 기기 증명이 필요한 경우
이 검사는 로컬에서 수행하며 우회할 수 있습니다. 하드웨어를 기반으로 서버에서 검증하는 증명(Play Integrity / App Attest)은 [기기 증명 API](./device-attestation)를 참고하세요. 별도 선택 패키지로 로컬 검사를 보완합니다. 로컬 검사는 빠른 오프라인 사전 필터로, 증명은 서버가 신뢰 여부를 판단하는 기준으로 사용하세요.
:::

## 개요 {#overview}

이 API는 서버 검증 없이 파일 시스템 검사, 패키지 감지 같은 **로컬 탐지만** 수행합니다. 다음과 같은 앱에서 다층 방어의 한 수단으로 사용합니다.

- 금융·은행 앱
- 민감한 데이터를 다루는 의료 앱
- 기업용 MDM 솔루션
- DRM이 필요한 앱

:::warning 제한 사항
**모든 탐지 방식은 로컬 전용이며** Magisk + Shamiko, RootHide, PlayIntegrityFix 같은 도구로 **우회할 수 있습니다**.

- **탐지하지 못했다고 기기가 안전하다는 뜻은 아닙니다.**
- Play Integrity API나 iOS App Attest를 사용하지 않습니다.
- 유일한 보안 수단이 아니라 다층 방어의 한 수단으로 사용하세요.
:::

[지원 여부 배지의 정의](/api/#availability-badges)를 읽으세요. 두 API는 핵심 패키지에 속하며 웹에서는 대체 값만 반환합니다.

## API 레퍼런스 {#api-reference}

### `isDeviceCompromised()` {#isdevicecompromised}

<span class="rp-badge rp-badge--tip">v1.4.2부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: 대체 값</span>

루팅(Android) 또는 탈옥(iOS) 여부를 동기로 검사합니다.

```typescript
isDeviceCompromised(): boolean
```

**반환값:** 기기 손상을 탐지하면 `true`, 그 외 `false`

**성능:** <50ms

**에뮬레이터 정책:** 개발 편의를 위해 에뮬레이터·시뮬레이터에서는 `false`를 반환합니다.

---

### `verifyDeviceIntegrity()` {#verifydeviceintegrity}

<span class="rp-badge rp-badge--tip">v1.4.2부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: 대체 값</span>

기기 무결성 검사의 비동기 래퍼입니다.

```typescript
verifyDeviceIntegrity(): Promise<boolean>
```

**반환값:** 루팅·탈옥을 탐지하면 `true`로 이행하는 Promise

**성능:**

- iOS: 최대 200ms(SSH 포트 검사 포함)
- Android: <50ms(`isDeviceCompromised()`의 비동기 래퍼)

**플랫폼 차이:**

- **iOS:** `isDeviceCompromised()`의 모든 검사에 SSH 포트 검사(22, 44)를 추가합니다. 탈옥 도구가 설치한 OpenSSH를 탐지할 수 있습니다.
- **Android:** API 형태를 맞추기 위해 비동기 래퍼로 제공하며 검사는 `isDeviceCompromised()`와 같습니다.

**에뮬레이터 정책:** 에뮬레이터·시뮬레이터에서는 `false`를 반환합니다.

## 탐지 방식 {#detection-methods}

### Android {#android}

| 방식 | 우선순위 | 설명 |
| --- | --- | --- |
| su 바이너리 | 높음 | `/system/xbin/su`, `/system/bin/su`, `/sbin/su` 등 |
| Magisk | 높음 | `/data/adb/magisk`, Magisk Manager 패키지 |
| KernelSU | 높음 | `/data/adb/ksu`, KernelSU Manager 패키지 |
| APatch | 높음 | `/data/adb/apatch`, APatch Manager 패키지 |
| Busybox | 중간 | `/system/xbin/busybox` |
| 빌드 속성 | 중간 | `ro.debuggable=1`, `ro.secure=0`, test-keys |
| Superuser 앱 | 낮음 | 기존 SuperSU, Superuser.apk |

### iOS {#ios}

| 방식 | 설명 |
| --- | --- |
| 탈옥 앱 | Cydia, Sileo, Zebra, Installer 5 |
| URL 스킴 | `cydia://`, `sileo://`, `zbra://`, `filza://` |
| 시스템 파일 쓰기 | `/private/jailbreak.txt` 쓰기 검사 |
| DYLD 주입 | MobileSubstrate, libhooker, TweakInject |
| 심볼릭 링크 | `/Applications`, `/Library/Ringtones` |
| SSH 포트 | 포트 22(OpenSSH), 포트 44(checkra1n) |

## 사용 예제 {#usage-examples}

### 기본 검사 {#basic-check}

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

### 금융 앱 보호 {#financial-app-protection}

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

### 조건에 따른 기능 접근 {#conditional-feature-access}

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

function DeviceAuthenticationLogin() {
  const isSecure = !DeviceInfoModule.isDeviceCompromised();
  const hasDeviceAuthentication = DeviceInfoModule.isPinOrFingerprintSet;

  if (!isSecure) {
    // Fall back to password-only login on compromised devices
    return <PasswordLogin />;
  }

  if (hasDeviceAuthentication) {
    return <DeviceAuthenticationPrompt />;
  }

  return <PasswordLogin />;
}
```

## 플랫폼 지원 {#platform-support}

| API | iOS | Android |
| --- | --- | --- |
| `isDeviceCompromised()` | ✅ | ✅ |
| `verifyDeviceIntegrity()` | ✅ (SSH 검사 추가) | ✅ (비동기 래퍼) |

## 권장 사용법 {#best-practices}

1. **탐지에만 의존하지 마세요.** 다층 방어의 한 수단으로 사용하세요.
2. **실패를 처리하세요.** 앱을 강제 종료하지 말고 대체 흐름을 제공하세요.
3. **분석용으로 기록하세요.** 보안 분석을 위해 탐지율을 확인하세요.
4. **실제 기기에서 테스트하세요.** 에뮬레이터는 항상 `false`를 반환합니다.
5. **정기적으로 갱신하세요.** 새로운 루팅 도구가 계속 등장합니다.

## 관련 문서 {#see-also}

- [기기 증명](/api/device-attestation)
- [isEmulator](/api/device-info#isemulator-boolean)
- [isPinOrFingerprintSet](/api/device-info#ispinorfingerprintset-boolean)
