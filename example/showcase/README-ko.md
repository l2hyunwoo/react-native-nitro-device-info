# Showcase 앱

[English](README.md) | **한국어**

react-native-nitro-device-info의 80개 이상 기기 속성을 10개 범주로 나누어 보여 주는 예제 앱입니다. 각 범주를 펼치거나 접을 수 있습니다.

## 기능

- **80개 이상의 기기 속성**: DeviceInfo 인터페이스의 정보 표시
- **10개 범주**:
  - 기본 기기 정보(`deviceId`, `brand`, `model`, `systemName`, `systemVersion`, `deviceType`)
  - 기기 기능(`isTablet`, `getHasNotch`, `getHasDynamicIsland`, `isCameraPresent`, `isEmulator`)
  - 식별자(`uniqueId`, `androidId`, `serialNumber`, `manufacturer`)
  - 배터리와 전원(`getBatteryLevel`, `getIsBatteryCharging`, `getPowerState`)
  - 시스템 리소스(`totalMemory`, `getUsedMemory`, `totalDiskCapacity`, `getFreeDiskStorage`)
  - 앱 메타데이터(`version`, `buildNumber`, `bundleId`, `applicationName`)
  - 네트워크 연결(`getIpAddress`, `getMacAddress`, `getCarrier`, `isLocationEnabled`, `isHeadphonesConnected`)
  - 플랫폼 기능(`apiLevel`, `supportedAbis`, `getHasGms`, `getHasHms`)
  - Android 빌드 정보(`bootloader`, `codename`, `device`, `display`, `fingerprint`, `hardware`, `host`, `product`, `tags`, `type`)
  - 고급 기능(`getFirstInstallTime`, `getLastUpdateTime`, `getInstallReferrer`)
- **접기·펼치기**: 모든 범주는 처음에 접혀 있으며 탭하면 펼침
- **플랫폼 배지**: iOS/Android 전용 속성 표시
- **타입별 형식**: 불리언은 ✓/✗, 바이트는 GB/MB, 타임스탬프는 날짜, 객체·배열은 JSON
- **당겨서 새로고침**: 필요할 때 전체 속성 갱신
- **오류 처리**: 읽을 수 없는 속성 표시
- **UI 구성**: React Navigation 없이 React Native 기본 컴포넌트 사용

## 구조

작은 단위의 컴포넌트를 조합합니다.

```
DeviceInfoScreen.tsx (main screen)
└── CategorySection.tsx (collapsible category)
    └── PropertyRow.tsx (key-value row)
        ├── PlatformBadge.tsx (iOS/Android indicator)
        └── PropertyFormatter.tsx (type-aware value display)
```

### 주요 구현

- **동기 속성과 비동기 메서드**: `deviceInfo.deviceId`처럼 직접 읽거나 `await deviceInfo.getIpAddress()`처럼 호출
- **상태**: useState를 사용하는 로컬 컴포넌트 상태
- **애니메이션**: React Native LayoutAnimation으로 접기·펼치기
- **스타일**: shadow/elevation을 포함한 플랫폼별 스타일

## 앱 실행

### 저장소 루트에서

```bash
yarn showcase ios      # iOS
yarn showcase android  # Android
```

### Showcase 디렉터리에서

```bash
cd example/showcase
yarn ios      # iOS
yarn android  # Android
```

iOS의 `pod install`은 빌드한 앱에 `NitroDeviceInfo_privacy.bundle/PrivacyInfo.xcprivacy`를 포함합니다. Showcase의 앱 수준 매니페스트는 별도로 유지합니다. 선언한 사유와 사용 제한은 [iOS 개인정보 보호 매니페스트](../../docs/docs/ko/guide/getting-started.md#ios-privacy-manifest)를 참고하세요.

라이브러리는 앱 이벤트의 시간 측정과 타이머에만 iOS 가동 시간 조회를 지원합니다. 그래서 iOS 속성 목록에서 원시 가동 시간을 제외합니다. [경과 시간 예제](../../docs/docs/ko/api/device-info.md#getuptime-number)를 참고하세요.

## 사용법

1. 기기나 시뮬레이터에서 앱을 실행합니다.
2. 범주 제목을 탭해 속성을 확인합니다.
3. 아래로 당겨 모든 값을 갱신합니다.
4. 타입에 따라 다른 형식을 확인합니다(굵은 불리언, 고정폭 숫자 등).
5. 플랫폼 전용 속성의 iOS / Android 배지를 확인합니다.

## 개발

라이브러리 시연과 테스트에 사용합니다.

- **컴포넌트 테스트**: 80개 이상 속성의 예상값 확인
- **플랫폼 검사**: iOS·Android 전용 속성 테스트
- **타입 검사**: 전체 컴포넌트에 TypeScript 사용
- **오류 격리**: 개별 속성 오류가 앱을 종료하지 않도록 처리

웹 배터리 getter는 첫 요청이 resolve된 뒤 받아 둔 BatteryManager 객체에서 현재 값을 읽습니다. 잔량이나 충전 상태가 바뀌면 표시한 속성을 새로고침하세요. 미지원·접근 거부 시 fallback 값을 유지합니다.

배터리 잔량을 읽을 수 없으면 getter는 `-1`, `useBatteryLevel()`은 `null`을 반환합니다. 조회 불가 값을 배터리 부족으로 판단하지 않습니다.

브라우저는 오프라인에서도 비행기 모드를 판단할 수 없으므로 웹의 `getIsAirplaneMode()`는 항상 `false`입니다.
