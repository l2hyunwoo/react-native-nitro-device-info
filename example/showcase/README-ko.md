# 쇼케이스 앱

react-native-nitro-device-info의 간단한 데모 앱입니다.

## 앱 실행 방법

### 저장소 루트에서

```bash
yarn showcase ios      # iOS
yarn showcase android  # Android
```

### 쇼케이스 디렉토리에서

```bash
cd example/showcase
yarn ios      # iOS
yarn android  # Android
```

iOS에서는 `pod install` 후 빌드한 앱에 라이브러리의 `NitroDeviceInfo_privacy.bundle/PrivacyInfo.xcprivacy`가 포함됩니다. 쇼케이스 앱 자체의 Privacy Manifest는 별도로 유지됩니다. 선언한 사유와 사용 제한은 [iOS Privacy Manifest 가이드](../../docs/docs/guide/getting-started.md#ios-privacy-manifest)를 참고하세요.

iOS 속성 목록에서는 기기 가동 시간을 표시하지 않습니다. 이 값은 앱 이벤트의 시간 계산 용도로만 지원합니다. [경과 시간 예제](../../docs/docs/api/device-info.md#getuptime-number)를 참고하세요.

웹 fallback에서는 최초 요청이 완료된 뒤 배터리 getter가 현재 BatteryManager 값을 읽습니다. 배터리 잔량이나 충전 상태가 바뀌면 표시된 속성을 새로고침하세요. API 미지원 또는 접근 거부 시 기본값을 유지합니다.

배터리 잔량을 확인할 수 없으면 `-1`, `useBatteryLevel()`은 `null`을 반환하며 낮은 배터리로 판정하지 않습니다.

웹 fallback에서 `getIsAirplaneMode()`는 오프라인 상태에서도 항상 `false`를 반환합니다. 브라우저에서는 비행기 모드를 확인할 수 없습니다.
