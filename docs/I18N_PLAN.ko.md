# 한국어 문서 도입 계획

2026-10-10 기준 조사입니다. 적용 대상은 `docs/yarn.lock`에 고정된 `@rspress/core@2.0.23`입니다. 이 문서는 도입 제안이며, 현재 사이트에 한국어 언어 선택기를 추가한 상태는 아닙니다.

## 권장안

기존 영어 페이지와 URL을 유지하고, 콘텐츠 루트인 `docs/docs/` 아래에 `ko/`를 추가합니다. Rspress의 기본 언어 선택기를 사용합니다. 별도의 문서 도구나 번역 플러그인은 필요하지 않습니다.

먼저 홈, 설치, Expo 설정, 빠른 시작, React Hooks, 마이그레이션을 번역합니다. API 전체를 번역하기 전에는 나머지 경로에 짧은 한국어 안내 페이지와 정확한 영어 원문 링크를 제공합니다.

기본 언어 선택기는 현재 경로의 언어 부분을 바꾸며 대응 문서의 존재 여부를 검사하지 않습니다. 따라서 **한국어 메뉴에 번역된 페이지만 넣어도 영어 페이지에서 언어를 바꾸면 404가 생길 수 있습니다.** 언어 선택기를 공개할 때는 모든 영어 경로에 한국어 번역 또는 안내 페이지가 있어야 합니다. [언어 전환 구현](https://github.com/web-infra-dev/rspress/blob/v2.0.23/packages/core/src/theme/components/Nav/hooks.tsx#L11)

## 파일 배치와 URL

```text
docs/
├── rspress.config.ts
└── docs/
    ├── index.md                 # 영어 홈: 기존 파일 유지
    ├── guide/
    ├── api/
    ├── examples/
    ├── contributing/
    ├── public/                  # 공통 이미지
    └── ko/
        ├── index.md
        ├── guide/
        ├── api/
        ├── examples/
        └── contributing/
```

| 콘텐츠 | 배포 경로 |
| --- | --- |
| 기존 영어 설치 문서 | `/react-native-nitro-device-info/guide/getting-started.html` |
| 한국어 설치 문서 | `/react-native-nitro-device-info/ko/guide/getting-started.html` |
| 영어 AI 문서 목록 | `/react-native-nitro-device-info/llms.txt` |
| 한국어 AI 문서 목록 | `/react-native-nitro-device-info/ko/llms.txt` |

기존 `base`와 `route.cleanUrls` 설정을 유지합니다. 내부 링크에 배포 base를 중복해서 넣지 않습니다.

공식 가이드는 언어별 `en/`, `ko/` 구조를 설명합니다. 현재처럼 탐색을 설정 파일에서 직접 정의하면 기존 영어 루트와 `ko/`를 함께 쓸 수 있습니다. 영어 페이지가 기본 언어로 판정되는 동작을 2.0.23 소스에서 확인했습니다. 향후 자동 메뉴 생성이나 `languageParity` 검사를 도입한다면 공식 언어별 디렉터리 구조를 다시 검토해야 합니다. [경로 정규화](https://github.com/web-infra-dev/rspress/blob/v2.0.23/packages/core/src/node/route/normalizeRoutePath.ts#L47), [자동 탐색 생략 조건](https://github.com/web-infra-dev/rspress/blob/v2.0.23/packages/core/src/node/auto-nav-sidebar/index.ts#L65)

## 설정 초안

다음은 기존 설정에 병합할 최소 예시입니다. 한국어 전체 메뉴와 대응 페이지를 준비한 뒤 적용합니다.

```typescript
lang: 'en',
locales: [
  { lang: 'en', label: 'English' },
  { lang: 'ko', label: '한국어' },
],
route: {
  localeRedirect: 'never',
},
themeConfig: {
  // Keep the existing English nav, sidebar, and shared settings.
  locales: [
    {
      lang: 'ko',
      label: '한국어',
      nav: [
        { text: '시작하기', link: '/guide/getting-started' },
        { text: '빠른 시작', link: '/guide/quick-start' },
      ],
      sidebar: {
        '/ko/guide/': [
          {
            text: '가이드',
            items: [
              { text: '시작하기', link: '/guide/getting-started' },
              { text: '빠른 시작', link: '/guide/quick-start' },
            ],
          },
        ],
      },
    },
  ],
},
```

- `lang: 'en'`은 영어 URL의 `/en/` 접두사를 생략하게 합니다.
- 최상위 `locales`는 지원 언어를, `themeConfig.locales`는 언어별 메뉴를 정의합니다.
- 한국어 메뉴의 `link: '/guide/...'`에는 `/ko`가 자동으로 붙습니다.
- **sidebar 객체의 키는 자동 변환되지 않습니다.** `'/ko/guide/'`처럼 한국어 경로를 명시합니다.
- `route.localeRedirect: 'never'`는 브라우저 언어에 따른 첫 방문 자동 이동을 막습니다. 부분 번역 단계에서 영어 링크가 미번역 한국어 경로로 이동하지 않게 합니다.

[언어별 테마와 링크 처리](https://github.com/web-infra-dev/rspress/blob/v2.0.23/packages/core/src/node/runtimeModule/siteData/normalizeThemeConfig.ts#L37), [언어 이동 설정](https://github.com/web-infra-dev/rspress/blob/v2.0.23/packages/core/src/node/constants.ts#L50)

## 번역되지 않은 페이지

Rspress의 영어 대체 처리는 UI 문구에 적용됩니다. **본문을 영어로 자동 대체하지는 않습니다.** 한국어 기본 UI 문구는 내장돼 있습니다. [UI 번역 처리](https://github.com/web-infra-dev/rspress/blob/v2.0.23/packages/core/src/node/runtimeModule/i18n.ts#L88)

미번역 경로의 안내 페이지에는 다음 세 가지를 표시합니다.

1. 아직 한국어 본문을 제공하지 않는다는 설명
2. 같은 API를 다루는 정확한 영어 페이지 링크
3. 한국어 설치·빠른 시작 문서 링크

영어 페이지를 한국어 메뉴나 안내 페이지에서 연결할 때는 배포 사이트의 완전한 `https://...` URL을 사용합니다. 내부 경로 `/api/device-info`는 한국어 접두사가 붙으므로 영어 원문 링크로 사용할 수 없습니다. 기본 테마는 완전한 외부 URL을 새 탭으로 엽니다. [링크 정규화](https://github.com/web-infra-dev/rspress/blob/v2.0.23/packages/core/src/node/runtimeModule/siteData/normalizeThemeConfig.ts#L37)

안내 페이지를 두기 싫다면 대응 번역이 없을 때 한국어 홈으로 보내는 언어 선택기를 직접 구현해야 합니다. 현재 규모에서는 기본 선택기와 안내 페이지 조합이 유지보수하기 쉽습니다.

## 번역 검수와 갱신

영어를 기준 문서로 유지합니다. API 이름, 가져오기 경로, 명령, 타입, 숫자, 단위, 반환값, 권한 이름은 번역하지 않습니다.

각 한국어 페이지의 frontmatter에 `translationOf`와 `sourceCommit`을 기록하는 방식을 제안합니다. 원문 경로와 번역 시점의 커밋을 확인하기 위한 메타데이터이며, 자동 최신화나 Rspress 내장 검사를 뜻하지 않습니다.

API를 수정하는 PR에서는 다음을 함께 확인합니다.

- 영어 본문과 코드가 현재 구현과 일치하는지
- 한국어 대응 페이지의 필수 조건·예외·오류 처리도 갱신했는지
- 아직 검수하지 못한 번역을 오래된 채로 노출하지 않는지

초기에는 PR 검수 항목으로 운영합니다. 번역 규모가 커지고 누락이 반복될 때 원문 변경 감지 스크립트를 검토합니다. 기계 번역은 초안으로 쓰고 코드 예제와 플랫폼 조건을 사람이 대조합니다.

## 검색과 AI 연동

사이트 검색은 언어별로 나뉩니다. 한국어 검색에서 영어 API 문서가 자동으로 나오지 않습니다. 한국어 안내 페이지에도 원래 API 이름과 짧은 한국어 용도를 넣어 검색 진입점을 제공합니다. [검색 인덱스 생성](https://github.com/web-infra-dev/rspress/blob/v2.0.23/packages/core/src/node/runtimeModule/pageData/createPageData.ts#L64)

현재 변경의 `llms: true`는 영어 AI 문서 출력을 활성화합니다. 한국어 locale을 도입하면 언어별 `llms.txt`와 `llms-full.txt`를 생성합니다. 이 기능은 Rspress에서 experimental로 안내하므로 버전을 올릴 때 결과를 다시 확인합니다. [공식 Markdown 출력 안내](https://github.com/web-infra-dev/rspress/blob/v2.0.23/website/docs/en/guide/basic/ssg-md.mdx#L180), [언어별 출력 구현](https://github.com/web-infra-dev/rspress/blob/v2.0.23/packages/core/src/node/ssg-md/llms/emitLlmsTxt.ts#L131)

MCP 서버의 Unicode 검색 수정은 한글 단어를 보존합니다. 영어 문서만 있는 상태에서 한국어 질의를 번역해 주지는 않으며, 한국어 조사·띄어쓰기 변형을 처리하는 형태소 검색도 아닙니다. 한국어 문서 추가 후 대표 질의로 품질을 확인하고 MCP 패키지를 새로 빌드·배포해야 합니다.

## 공개 전 검증

- `yarn build`로 영어·한국어 경로와 AI 문서 파일을 확인합니다.
- 모든 영어 페이지에서 한국어로, 다시 영어로 전환해 대응 페이지를 확인합니다.
- 기존 영어 URL, base 경로, 로고, 내부 링크, 검색을 확인합니다.
- 설치·배터리·호환 API·Expo 관련 한국어 검색을 확인합니다.
- 모바일 메뉴와 키보드 언어 선택을 Aside에서 확인합니다.
- npm tarball만 설치한 MCP 서버에서도 API와 번역 문서를 찾는지 확인합니다.

이번 작업은 한국어 도입 방안 조사까지입니다. 실제 한국어 본문 번역, 언어 선택기 배포, 번역 자동화는 후속 적용 범위입니다.
