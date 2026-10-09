# 문서 개발

[English](README.md) | **한국어**

사이트는 `@rspress/core` 2.x를 사용합니다. CI에서 사용하는 버전은 `docs/yarn.lock`으로 고정합니다.

## 로컬 실행

저장소 루트에서 실행하세요.

```bash
cd docs
yarn install --immutable
yarn dev
```

Rspress가 출력하는 URL을 사용하세요. 사이트 base 경로는 `/react-native-nitro-device-info/`이며 한국어 홈은 그 아래 `ko/`입니다.

```bash
# From docs/
yarn build
yarn preview
```

프로덕션 빌드 결과는 저장소 루트 기준 `docs/doc_build/`에 생성됩니다. 빌드 오류를 해결하려고 출력 파일을 편집하거나 lockfile을 삭제하지 마세요.

## 소스 구조

```text
docs/
├── rspress.config.ts         # Site settings, navigation, sidebar, llms output
├── package.json
├── yarn.lock                 # Docs have their own dependency installation
└── docs/                     # Content root
    ├── index.md              # Homepage
    ├── guide/
    ├── api/
    ├── examples/
    ├── contributing/
    ├── ko/                   # Korean counterparts, with the same page paths
    └── public/               # Shared static assets
```

영어 페이지는 콘텐츠 루트에, 한국어 대응 페이지는 `docs/docs/ko/`의 같은 경로에 둡니다. 이미지 등 정적 자산은 공통 `public/`을 사용합니다. [한국어 문서 운영 안내](I18N_PLAN.ko.md)를 참고하세요.

## 편집과 검증

1. `docs/docs/`의 영어 원문과 `docs/docs/ko/`의 대응 페이지를 편집하세요.
2. 새 페이지라면 `rspress.config.ts`에서 두 언어의 상단 메뉴와 사이드바를 갱신하세요.
3. API 예제를 소스 인터페이스와 플랫폼 구현에 대조하세요. 필요하면 영어·한국어 README도 갱신하세요.
4. `yarn build`, `yarn preview`를 실행하세요.
5. 경로, 제목 링크, 언어 전환, 검색 결과, 예제를 확인하세요.

웹사이트는 `main`을 따르며 설치한 릴리스와 다를 수 있습니다. 네이티브 속성·동기 메서드·Promise 메서드와 `/compat`에서 import하는 API를 구별하세요. 전체 TypeScript 인터페이스를 Markdown에 중복 관리하지 마세요.

`llms: true`는 Rspress의 페이지 Markdown, `llms.txt`, `llms-full.txt` 출력을 켭니다. 빌드 후 `doc_build/`와 `doc_build/ko/`에서 언어별 파일을 확인하세요.

## MCP 문서 모음

MCP 패키지는 빌드할 때 API 명세, 영어·한국어 사이트 Markdown, 루트 README를 포함합니다. 문서를 바꿨다면 저장소 루트에서 다시 빌드하세요.

```bash
yarn workspace @react-native-nitro-device-info/mcp-server build
yarn workspace @react-native-nitro-device-info/mcp-server test --runInBand
```

MCP 문서는 릴리스 시점의 스냅샷이며 웹사이트를 실시간으로 가져오지 않습니다. 문서 사이트 배포만으로 기존 MCP 패키지가 갱신되지는 않습니다.

## 배포

워크플로는 `.github/workflows/docs-validation.yml`과 `.github/workflows/docs-deploy.yml`입니다. `yarn install --immutable`로 설치한 뒤 사이트를 빌드하고 `docs/doc_build/`를 사용합니다.

`main`에 문서 변경을 병합하면 배포합니다. 실패하면 의존성을 바꾸거나 로컬 재빌드를 하기 전에 GitHub Actions 로그를 확인하세요.
