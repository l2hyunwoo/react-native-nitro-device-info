# Nitro Device Info 벤치마크 앱

`react-native-nitro-device-info` 라이브러리의 **성능을 측정하기 위한 테스트용 애플리케이션**입니다.

## 목적

이 앱은 다음을 위해 설계되었습니다.

- Nitro 모듈 기반 디바이스 정보 조회 성능 측정
- 다른 구현체와의 성능 비교
- 실행 시간 및 메모리 사용량 분석
- 다양한 조건에서의 스트레스 테스트 수행

## 실행 방법

### iOS

```bash
# 프로젝트 루트에서
yarn benchmark ios
```

또는 벤치마크 디렉토리에서 실행:

```bash
cd example/benchmark
yarn ios
```

### Android

```bash
# 프로젝트 루트에서
yarn benchmark android
```

또는 벤치마크 디렉토리에서 실행:

```bash
cd example/benchmark
yarn android
```

## 빌드 방법

벤치마크 앱은 쇼케이스 앱과 완전히 독립적으로 구성되어 있습니다.
따라서 한쪽을 수정하더라도 다른 쪽에 영향을 주지 않습니다.

### 종속성 설치

```bash
cd example/benchmark
yarn install
```

### iOS Pod 설치

```bash
cd example/benchmark/ios
pod install
```

## 참고

- **번들 ID (iOS)**: `com.nitrodeviceinfobenchmark`
- **패키지 이름 (Android)**: `com.nitrodeviceinfobenchmark`
- **표시 이름**: `Nitro Device Info Benchmark`
