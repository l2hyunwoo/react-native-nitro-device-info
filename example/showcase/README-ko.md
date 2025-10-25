# Nitro Device Info 쇼케이스 앱

`react-native-nitro-device-info` 라이브러리를 **간단한 단일 화면**으로 시연하는 예제 앱입니다.

## 목적

이 앱은 다음을 보여줍니다.

- 제공되는 모든 디바이스 정보 속성
- 동기·비동기 메서드 사용 예시
- `react-native-nitro-device-info` 통합 방식
- 내비게이션 없이 깔끔하고 직관적인 구현

## 실행 방법

### iOS

```bash
# 프로젝트 루트에서
yarn showcase ios
```

또는 쇼케이스 디렉토리에서 실행:

```bash
cd example/showcase
yarn ios
```

### Android

```bash
# 프로젝트 루트에서
yarn showcase android
```

또는 쇼케이스 디렉토리에서 실행:

```bash
cd example/showcase
yarn android
```

## 주요 기능

- 다음 항목을 포괄적으로 표시
  - 디바이스 식별
  - 시스템 정보
  - 하드웨어 기능
  - 배터리 상태
  - 네트워크 정보
  - 애플리케이션 메타데이터

## 빌드 방법

### 의존성 설치

```bash
cd example/showcase
yarn install
```

### iOS Pod 설치

```bash
cd example/showcase/ios
pod install
```

## 참고

- **번들 ID(iOS)**: `nitrodeviceinfo.example`
- **패키지 이름(Android)**: `com.nitrodeviceinfoexample`
- **표시 이름**: `NitroDeviceInfoExample`
