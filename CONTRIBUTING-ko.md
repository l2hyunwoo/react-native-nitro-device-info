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

공개 패키지 3개는 [Changesets](.changeset/config.json)로 버전을 독립적으로 관리합니다. 예제와 private 루트 패키지는 배포 대상에서 제외합니다.

| 패키지                                       | 릴리스 기준                                            |
| -------------------------------------------- | ------------------------------------------------------ |
| `react-native-nitro-device-info`             | API·구현·패키지 내용이 바뀌면 changeset 추가           |
| `react-native-nitro-device-integrity`        | 최초 배포는 `0.1.0`, 이후 변경부터 changeset 추가      |
| `@react-native-nitro-device-info/mcp-server` | MCP 코드 또는 포함된 명세·문서가 바뀌면 changeset 추가 |

MCP는 빌드할 때 핵심 라이브러리의 `.nitro.ts` 명세, `docs/docs/`, 루트 README를 복사합니다. 이 내용이 바뀌면 MCP changeset도 추가하세요. 빌드 시점에만 필요한 관계이므로 런타임 의존성을 추가하거나 패키지 버전을 맞출 필요는 없습니다.

1. 구현을 바꿀 때 `yarn changeset`을 실행합니다. 영향을 받는 패키지와 SemVer 변경 수준을 선택합니다.
2. 변경을 병합하면 [Release workflow](.github/workflows/release.yml)가 `main`에서 **chore(release): version packages** PR을 만들거나 갱신합니다.
3. PR에서 생성된 패키지 버전과 패키지별 changelog를 검토하고, 검증 후 병합합니다.
4. `main`에서 **Release**를 기본값인 `publish: false`로 수동 실행합니다. CI 결과, 레지스트리 비교 결과, 검증된 tarball artifact를 확인합니다.
5. 배포가 승인되면 `publish: true`로 수동 실행합니다. `npm` environment에 보호 규칙이 있으면 승인합니다.

push 이벤트는 버전 PR만 관리하며 npm에 배포하지 않습니다. 수동 workflow는 선택한 커밋을 검사하고 각 패키지를 빌드한 뒤 실제 workspace를 패킹합니다. 패킹할 때 lifecycle script는 실행하지 않습니다.
메타데이터, 진입점, 네이티브 바인딩, Expo plugin, MCP 데이터를 검사하고 SHA-512 해시와 함께 archive를 업로드합니다. publish job은 다운로드한 파일을 다시 검사한 뒤 같은 파일을 npm provenance와 함께 배포합니다.
외부 쓰기는 npm 배포와 그 이후의 패키지별 태그·GitHub Release 생성으로 한정합니다. 태그는 scope가 있는 MCP를 포함해 `<package-name>@<version>` 형식입니다. 기존 태그는 유지합니다.

이미 배포된 정확한 버전은 건너뛰고, 레지스트리 조회에 실패하면 작업을 중단합니다. 일부 패키지만 배포된 상태로 실패했다면 같은 실행의 **Re-run failed jobs**를 사용하세요. 원래 artifact와 커밋을 유지하며 레지스트리의 archive 해시가 일치하는지 확인한 뒤 누락된 태그나 GitHub Release를 만듭니다.
이미 배포한 버전의 릴리스 정보를 복구하려고 새 workflow를 실행하지 마세요.

실제 배포를 활성화하기 전에 다음을 설정합니다.

- 저장소 설정에서 GitHub Actions의 PR 생성을 허용합니다. 버전 PR을 병합하기 전에 검증 상태를 확인합니다.
- 각 npm 패키지의 trusted publisher에 owner `l2hyunwoo`, repository `react-native-nitro-device-info`, workflow `release.yml`, environment `npm`을 지정합니다.
- npm이 staged publishing을 기본값으로 설정했다면 이 workflow의 직접 배포를 명시적으로 허용합니다. 새 publisher 설정은 npm의 만료 기간 안에 활성화합니다.
- hosted publish runner는 Node 22.14 이상과 npm 11.5.1 이상을 사용합니다. `id-token: write` 권한이 필요하며 장기 `NPM_TOKEN`은 사용하지 않습니다.
- 미배포 상태인 integrity는 인증된 관리자가 최초 실제 버전을 배포해야 trusted publisher를 설정할 수 있습니다.
  검토한 `0.1.0` tarball을 `npm publish <checked-tarball.tgz> --access public --ignore-scripts`로 한 번 배포한 뒤 publisher를 설정합니다.
  해당 실행의 artifact를 보존하고 publish job을 재실행해 같은 archive인지 확인한 뒤 릴리스 정보를 완성합니다.

이 전환 작업은 버전 PR을 병합하기 전까지 manifest 버전을 바꾸지 않습니다. integrity는 최초 배포를 명시적으로 실행할 때까지 미배포 상태로 유지합니다. 실기기 attestation과 백엔드 검증은 배포 전에 확인해야 합니다.
integrity만 beta로 배포하려고 모노레포 전체에 적용되는 `changeset pre enter`를 사용하지 마세요.

로컬에서 배포 없이 검증하려면 Node 22.14 이상과 npm 11.5.1 이상을 준비한 뒤 다음을 실행합니다.

```sh
yarn release:prepare
yarn release:verify
```

두 명령은 공개 레지스트리를 읽고 git에서 제외한 `.release/`에 검증된 archive를 만듭니다. npm 배포, 태그 생성, GitHub Release 생성은 하지 않습니다. 변경사항이 있는 로컬 checkout에서는 배포할 수 없는 초안 artifact를 만듭니다.
`release:publish`는 수동 Actions publish job, 변경사항 없는 checkout의 artifact, 적용을 마친 changeset을 요구합니다.

### 스크립트

- `yarn`: 의존성 설치
- `yarn typecheck`: TypeScript 타입 검사
- `yarn lint`: oxlint 검사
- `yarn lint:eslint`: 보조 ESLint 검사
- `yarn test`: Jest 단위 테스트
- `yarn nitrogen`: 핵심 `.nitro.ts` 네이티브 바인딩 생성
- `yarn prepare`: 핵심 라이브러리 빌드
- `yarn workspace react-native-nitro-device-integrity prepare`: device attestation 라이브러리 빌드
- `yarn test:integrity`: integrity 빌드 후 해시 벡터·Expo plugin·Android 런타임 의존성 검사
- `yarn test:integrity:native`: Kotlin·Swift 테스트 대역으로 네이티브 입력 검증과 provider 재시도 검사
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
