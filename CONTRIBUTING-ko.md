# 기여 안내

[English](CONTRIBUTING.md) | **한국어**

작고 큰 기여를 모두 환영합니다. 프로젝트에 참여할 때 서로 존중해 주세요. 기여 전에 [행동 강령](CODE_OF_CONDUCT-ko.md)을 읽어 주세요.

## 개발 절차

이 프로젝트는 [Yarn workspaces](https://yarnpkg.com/features/workspaces)로 관리하는 모노레포입니다.

- `packages/`: 핵심 라이브러리, 선택적으로 설치하는 device attestation 라이브러리(서버 검증용 토큰 발급), MCP 서버
- `example/`: Showcase, Benchmark, Integrity Demo 앱
- `docs/`: 의존성을 별도로 설치하는 문서 사이트

[`.nvmrc`](.nvmrc)에 지정한 Node.js 버전을 설치하세요. 루트에서 의존성을 설치합니다.

```sh
yarn
```

> Yarn workspaces에 의존하므로 별도로 마이그레이션하지 않고 npm으로 개발할 수는 없습니다.

프로젝트는 Nitro Modules를 사용합니다. 구조가 익숙하지 않다면 [Nitro Modules 문서](https://nitro.margelo.com/)를 먼저 읽으세요.

예제 앱을 빌드하려면 [Nitrogen](https://nitro.margelo.com/docs/nitrogen)으로 네이티브 바인딩을 생성해야 합니다. 다음 경우에 실행하세요.

- `*.nitro.ts` 파일을 바꿨을 때
- 처음 실행할 때(생성 파일은 레포지터리에 커밋하지 않음)

핵심 라이브러리 바인딩은 다음 명령으로 생성합니다.

```sh
yarn nitrogen
```

device attestation 패키지를 바꿨다면 `yarn nitrogen:integrity`를 사용하세요.

[Showcase](example/showcase/README-ko.md)와 [Benchmark](example/benchmark/README-ko.md) 앱에서 라이브러리 변경을 테스트하세요. 두 앱은 로컬 라이브러리를 사용합니다. JavaScript 변경은 다시 빌드하지 않아도 반영되지만 네이티브 변경은 재빌드가 필요합니다. device attestation은 [Integrity Demo](example/integrity-demo/README-ko.md)에서 확인하세요.

네이티브 코드를 편집하려면 다음 프로젝트를 여세요.

- **iOS**: Xcode에서 `example/showcase/ios/NitroDeviceInfoExample.xcworkspace` 또는 `example/benchmark/ios/NitroDeviceInfoBenchmark.xcworkspace`를 엽니다. 라이브러리 소스는 `Pods > Development Pods > react-native-nitro-device-info`에 있습니다.
- **Android**: Android Studio에서 `example/showcase/android` 또는 `example/benchmark/android`를 엽니다. `Android` 아래의 `react-native-nitro-device-info`에서 소스를 찾을 수 있습니다.

아래 명령은 레포지터리 루트에서 실행합니다.

### Showcase 앱 실행

Metro와 앱을 실행하세요.

```sh
# Start Metro bundler
yarn showcase start

# Run on Android
yarn showcase android

# Run on iOS
yarn showcase ios
```

### Benchmark 앱 실행

Metro와 앱을 실행하세요.

```sh
# Start Metro bundler
yarn benchmark start

# Run on Android
yarn benchmark android

# Run on iOS
yarn benchmark ios
```

New Architecture 실행 여부는 Metro 로그에서 확인할 수 있습니다.

```sh
Running "NitroDeviceInfoShowcase" with {"fabric":true,"initialProps":{"concurrentRoot":true},"rootTag":1}
```

`"fabric":true`와 `"concurrentRoot":true`를 확인하세요.

TypeScript와 oxlint 검사를 실행하세요.

```sh
yarn typecheck
yarn lint
```

지원하는 린트 자동 수정을 적용할 수 있습니다.

```sh
yarn lint --fix
```

변경에 필요한 테스트를 추가하고 단위 테스트를 실행하세요.

```sh
yarn test
```

라이브러리, 의존성, CI/Jest 설정 변경 시 CI가 핵심 라이브러리 Jest를 실행합니다. 단독 실행은 `yarn workspace react-native-nitro-device-info test --runInBand`입니다. 루트 `yarn test`는 MCP 테스트도 실행합니다. 기기 하네스 테스트에는 전용 실행기가 필요합니다.

device attestation 패키지나 예제를 바꿨다면 린트, `yarn workspace react-native-nitro-device-integrity typecheck`, `yarn workspace react-native-nitro-device-integrity prepare`를 실행한 뒤 iOS·Android 예제를 빌드합니다. 루트 `yarn prepare`는 핵심 라이브러리만 빌드합니다. 의존성이나 CI 워크플로를 바꿨다면 두 라이브러리를 모두 검사합니다. `actionlint .github/workflows/ci.yml`로 문법을 검사하고 경로 필터가 바꾼 패키지와 설정을 포함하는지 확인하세요.

### Integrity 테스트

workspace 의존성을 설치한 뒤 레포지터리 루트에서 integrity 패키지를 빌드하세요.

```sh
yarn workspace react-native-nitro-device-integrity prepare
```

로컬에서 사용할 수 있는 플랫폼의 검사를 실행하세요.

| 명령 | 검사 범위 | 필요 환경 |
| --- | --- | --- |
| `yarn test:integrity` | Android 런타임 의존성, Expo plugin 반복 적용, 데모 SHA-256 벡터 | workspace 의존성 |
| `yarn test:integrity:android` | provider 갱신 경쟁 조건, 재시도 횟수 제한, 잘못된 프로젝트 번호 | JDK 17과 데모의 Android SDK 설정 |
| `yarn test:integrity:ios` | base64 해독과 32바이트 해시 검증 | macOS와 Foundation을 제공하는 Xcode의 `swiftc` |

Android 테스트는 `android/src/test`에 있으며 데모의 Gradle 프로젝트에서 JUnit과 Google SDK mock으로 실행합니다. Kotlin은 Gradle이 제공합니다. iOS 검사는 실제 Swift 구현을 작은 플랫폼 대역과 함께 컴파일합니다. CI는 각 네이티브 검사를 해당 플랫폼 job에서 실행합니다. 이 검사들은 Google·Apple 서버를 호출하지 않습니다.

네이티브 오류가 JavaScript로 전달되는지 확인하는 검사와 기기 선택은 [Integrity Demo 하네스 안내](example/integrity-demo/README-ko.md#기기-테스트)를 참고하세요.

### 커밋 메시지 규칙

[Conventional Commits](https://www.conventionalcommits.org/en)를 따릅니다.

- `fix`: 버그 수정
- `feat`: 새 기능
- `refactor`: 코드 구조 개선
- `docs`: 문서 변경
- `test`: 테스트 추가·수정
- `chore`: 도구와 CI 설정 변경

제목 한 줄로 작성하고 명시적으로 요청하지 않은 본문은 비우세요. 커밋 훅이 형식을 검사합니다.

### 린트와 테스트

[TypeScript](https://www.typescriptlang.org/)로 타입을, oxlint로 린트 통과 여부를 검사합니다. [Prettier](https://prettier.io/)로 형식을 맞추고 [Jest](https://jestjs.io/)로 단위 테스트를 실행합니다. 보조 명령 `yarn lint:eslint`의 알려진 설정 제한은 `AGENTS.md`를 참고하세요.

pre-commit 훅은 stage한 JavaScript·TypeScript를 린트하고 commit-msg 훅은 커밋 제목을 검사합니다. 변경을 제출하기 전에 필요한 테스트를 별도로 실행하세요.

### npm 배포

공개 패키지 3개는 [Changesets](.changeset/config.json)로 버전을 독립적으로 관리합니다. 예제와 private 루트는 배포 대상에서 제외합니다.

배포된 패키지를 변경할 때 `yarn changeset`을 실행하세요. 영향을 받는 패키지와 SemVer 변경 수준을 선택하고 사용자가 확인할 수 있는 변경 내용을 작성합니다.

| 패키지 | changeset을 추가하는 경우 |
| --- | --- |
| `react-native-nitro-device-info` | API·구현·패키지 내용 변경 |
| `react-native-nitro-device-integrity` | 최초 배포 이후 API·구현·패키지 내용 변경 |
| `@react-native-nitro-device-info/mcp-server` | MCP 코드 또는 포함된 명세·문서 변경 |

MCP는 빌드할 때 두 라이브러리의 `.nitro.ts` 명세, `docs/docs/`, 영어 루트 README를 포함합니다. 이 입력이 바뀌면 MCP changeset도 추가하세요. 빌드 시점에 필요한 관계이므로 런타임 의존성을 추가하거나 버전을 맞출 필요는 없습니다.

Release workflow가 `main`에서 버전 PR을 만들면 관리자가 검토하고 배포를 명시적으로 실행합니다. 설정, dry run, integrity 최초 배포, 실패 복구는 [관리자 릴리스 안내](.github/RELEASING-ko.md)를 참고하세요.

### 스크립트

- `yarn`: 의존성 설치
- `yarn typecheck`: TypeScript 타입 검사
- `yarn lint`: oxlint 검사
- `yarn lint:eslint`: 보조 ESLint 검사
- `yarn test`: Jest 단위 테스트
- `yarn nitrogen`: 핵심 `.nitro.ts` 네이티브 바인딩 생성
- `yarn prepare`: 핵심 라이브러리 빌드
- `yarn workspace react-native-nitro-device-integrity prepare`: device attestation 라이브러리 빌드
- `yarn test:integrity`: integrity 소스 회귀 검사
- `yarn test:integrity:android`: Gradle로 Android JUnit 회귀 검사
- `yarn test:integrity:ios`: Swift 해시 검증 회귀 검사
- `yarn test:release`: 패키지 3개 빌드 후 릴리스 로직과 패킹 결과 검사(npm 11.5.1 이상 필요)
- `yarn changeset`: 영향받는 패키지와 버전 변경 수준 기록
- `yarn version-packages`: 대기 중인 changeset을 로컬에 적용해 검토
- `yarn release:prepare` / `yarn release:verify`: 배포 없이 로컬 릴리스 archive 준비·검사
- `yarn integrity-demo <command>`: device attestation 예제 실행(start/ios/android)
- `yarn showcase <command>`: Showcase 실행(start/ios/android)
- `yarn benchmark <command>`: Benchmark 실행(start/ios/android)

### PR 제출

> 처음 PR을 제출한다면 무료 강좌 [How to Contribute to an Open Source Project on GitHub](https://app.egghead.io/playlists/how-to-contribute-to-an-open-source-project-on-github)를 참고하세요.

- 하나의 변경에 집중한 작은 PR을 권장합니다.
- 린트와 테스트 통과 여부를 확인하세요.
- 문서 표시를 검토하세요.
- PR 템플릿을 따르세요.
- API나 구현을 바꾸는 PR은 먼저 이슈로 관리자와 논의하세요.

## 문서와 번역

`docs/docs/`의 영어 페이지는 `docs/docs/ko/`에 한국어 대응 페이지를 둡니다. 동작을 바꾸면 API 이름, 단위, 권한, 예외를 유지하며 두 언어를 함께 갱신하세요. `translationOf`, `sourceCommit`, 명시적 제목 ID도 갱신하세요. 새 페이지는 `docs/rspress.config.ts`의 두 언어 메뉴에 추가하세요. [문서 개발](docs/README-ko.md)과 [한국어 번역 관리](docs/I18N_PLAN.ko.md)를 참고하세요.
