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
