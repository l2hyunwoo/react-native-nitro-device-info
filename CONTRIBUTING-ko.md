# 기여하기

크고 작은 모든 기여를 환영합니다 🎉
이 프로젝트가 **서로를 존중하고 배려하는 커뮤니티**로 유지될 수 있도록,
참여 전 [행동 강령](./CODE_OF_CONDUCT.md)을 꼭 읽어주세요.

---

## 개발 워크플로우

이 프로젝트는 [Yarn Workspaces](https://yarnpkg.com/features/workspaces)를 사용하는 **모노레포 구조**로 관리됩니다.
다음과 같은 패키지들이 포함되어 있습니다:

- 루트 디렉토리: 라이브러리 패키지
- `example/` 디렉토리: 두 개의 예제 앱
  - **쇼케이스 앱 (`example/showcase/`)** — API 시연 및 디바이스 정보 표시
  - **벤치마크 앱 (`example/benchmark/`)** — 성능 테스트 및 벤치마킹

시작하기 전 [`.nvmrc`](./.nvmrc) 파일에서 요구하는 **Node.js 버전**을 확인하세요.

### 종속성 설치

```bash
yarn
```

> ⚠️ 이 프로젝트는 Yarn Workspaces를 사용하므로, 별도의 설정 없이 `npm`을 사용할 수 없습니다.

---

## Nitro 및 Nitrogen 설정

이 프로젝트는 **Nitro 모듈**을 기반으로 동작합니다.
아직 Nitro를 잘 모른다면 [공식 문서](https://nitro.margelo.com/)를 먼저 참고하세요.

또한, 필수 보일러플레이트 코드는 [Nitrogen](https://nitro.margelo.com/docs/nitrogen)을 통해 생성됩니다.
이 단계가 없으면 예제 앱을 빌드할 수 없습니다.

**다음 경우에는 반드시 Nitrogen을 실행하세요:**

- `*.nitro.ts` 파일을 수정한 경우
- 프로젝트를 처음 실행하는 경우 (생성된 파일이 저장소에 포함되지 않음)

```bash
yarn nitrogen
```

---

## 예제 앱 실행

예제 앱([쇼케이스](/example/showcase/) / [벤치마크](/example/benchmark/))은
라이브러리의 사용 예시를 포함하고 있습니다.

라이브러리의 JavaScript 변경사항은 즉시 반영되지만,
네이티브 코드 변경 시에는 **재빌드**가 필요합니다.

### iOS / Android 네이티브 코드 편집

- **iOS**:
  Xcode에서 다음 워크스페이스 열기
  - `example/showcase/ios/NitroDeviceInfoExample.xcworkspace`
  - `example/benchmark/ios/NitroDeviceInfoBenchmark.xcworkspace`
  - 경로: `Pods > Development Pods > react-native-nitro-device-info`

- **Android**:
  Android Studio에서 다음 디렉토리 열기
  - `example/showcase/android` 또는 `example/benchmark/android`
  - 경로: `Android > react-native-nitro-device-info`

---

## 실행 명령

### 쇼케이스 앱

```bash
# Metro 번들러 시작
yarn showcase start

# Android 실행
yarn showcase android

# iOS 실행
yarn showcase ios
```

### 벤치마크 앱

```bash
# Metro 번들러 시작
yarn benchmark start

# Android 실행
yarn benchmark android

# iOS 실행
yarn benchmark ios
```

> 앱이 **뉴 아키텍처(Fabric)** 로 실행 중인지 확인하려면 Metro 로그에서 아래 메시지를 찾으세요:
>
> ```bash
> Running "NitroDeviceInfoShowcase" with {"fabric":true,"initialProps":{"concurrentRoot":true},"rootTag":1}
> ```
>
> `"fabric": true` 와 `"concurrentRoot": true"` 속성이 표시되면 성공입니다.

---

## 코드 품질 검사

아래 명령으로 타입 및 린팅 검사를 수행하세요:

```bash
yarn typecheck
yarn lint
```

자동 포맷 수정:

```bash
yarn lint --fix
```

단위 테스트 실행:

```bash
yarn test
```

> 가능하다면, 변경사항에 대한 테스트를 함께 추가해주세요.

---

## 커밋 메시지 규칙

커밋 메시지는 [Conventional Commits](https://www.conventionalcommits.org/en) 규칙을 따릅니다.

| 타입       | 설명                            |
| ---------- | ------------------------------- |
| `fix`      | 버그 수정 (예: 충돌 해결)       |
| `feat`     | 새로운 기능 추가                |
| `refactor` | 코드 리팩토링                   |
| `docs`     | 문서 수정 또는 보강             |
| `test`     | 테스트 추가/수정                |
| `chore`    | 빌드, CI, 설정 등 비기능적 변경 |

> pre-commit 훅이 자동으로 메시지 형식을 검사합니다.

---

## 린팅, 포매팅, 테스트

이 프로젝트는 다음 도구들을 사용합니다:

- **TypeScript** — 타입 검사
- **ESLint + Prettier** — 코드 린팅 및 포매팅
- **Jest** — 단위 테스트

모든 커밋 전에 린터와 테스트가 자동으로 실행됩니다.

---

## npm 배포

버전 배포는 [release-it](https://github.com/release-it/release-it)을 사용합니다.
버전 증가, 태그 생성, GitHub 릴리스 생성 등이 자동 처리됩니다.

```bash
yarn release
```

---

## 주요 스크립트 요약

| 명령                   | 설명                                     |
| ---------------------- | ---------------------------------------- |
| `yarn`                 | 프로젝트 종속성 설치                     |
| `yarn typecheck`       | TypeScript 타입 검사                     |
| `yarn lint`            | oxlint 기반 린팅 (기본)                  |
| `yarn lint:eslint`     | ESLint 기반 린팅                         |
| `yarn test`            | Jest 테스트 실행                         |
| `yarn nitrogen`        | `.nitro.ts` → 네이티브 바인딩 생성       |
| `yarn prepare`         | 라이브러리 빌드 (자동 실행됨)            |
| `yarn showcase <cmd>`  | 쇼케이스 앱 실행 (start / ios / android) |
| `yarn benchmark <cmd>` | 벤치마크 앱 실행 (start / ios / android) |

---

## Pull Request 가이드

> 💡 처음 오픈소스 기여를 하신다면,
> [이 무료 가이드](https://app.egghead.io/playlists/how-to-contribute-to-an-open-source-project-on-github)를 추천드립니다.

Pull Request를 보낼 때는 다음을 지켜주세요.

- 하나의 변경에 집중한 **작고 명확한 PR**을 선호합니다.
- 린터와 테스트가 통과했는지 확인합니다.
- 문서 변경 시 시각적/내용적 오류가 없는지 검토합니다.
- Pull Request 템플릿을 준수합니다.
- **API나 내부 구현을 변경하는 경우**, 반드시 사전에 이슈를 열어 메인테이너와 논의해주세요.
