# 기본 사용법

이 페이지는 `react-native-nitro-device-info`의 일반적인 사용 패턴을 보여줍니다.

## 기기 정보 표시

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { DeviceInfoModule } from 'react-native-nitro-device-info';

export function DeviceInfoCard() {
  return (
    <View>
      <Text>브랜드: {DeviceInfoModule.brand}</Text>
      <Text>모델: {DeviceInfoModule.model}</Text>
      <Text>OS: {DeviceInfoModule.systemVersion}</Text>
    </View>
  );
}
```

## 조건부 UI 렌더링

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

// 태블릿 vs 폰
const Layout = DeviceInfoModule.isTablet() ? TabletLayout : PhoneLayout;

// 플랫폼별 UI
const isIOS = DeviceInfoModule.brand === 'Apple';
```

## 배터리 모니터링

```typescript
import { useEffect, useState } from 'react';
import { DeviceInfoModule } from 'react-native-nitro-device-info';

export function useBatteryLevel() {
  const [level, setLevel] = useState(DeviceInfoModule.getBatteryLevel());

  useEffect(() => {
    const interval = setInterval(() => {
      setLevel(DeviceInfoModule.getBatteryLevel());
    }, 60000); // 1분마다 업데이트

    return () => clearInterval(interval);
  }, []);

  return level;
}
```

## 더 많은 예제

고급 패턴 및 사용 사례는 [고급 사용법](/examples/advanced-usage)을 참조하세요.
