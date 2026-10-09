# 한국어 문서 운영 안내

문서 사이트는 영어와 한국어를 제공합니다. 영어를 기준 문서로 유지하며 모든 영어 페이지에 한국어 본문을 제공합니다. 적용 버전은 `docs/yarn.lock`의 `@rspress/core@2.0.23`입니다.

## 파일과 URL

영어는 `docs/docs/`에, 한국어는 `docs/docs/ko/` 아래의 같은 경로에 둡니다. 정적 자산은 `docs/docs/public/`을 공유합니다. 영어 URL과 배포 `base`는 유지합니다.

| 항목 | 영어 | 한국어 |
| --- | --- | --- |
| 홈 | `/react-native-nitro-device-info/` | `/react-native-nitro-device-info/ko/` |
| 설치 | `/react-native-nitro-device-info/guide/getting-started.html` | `/react-native-nitro-device-info/ko/guide/getting-started.html` |
| AI 문서 목록 | `/react-native-nitro-device-info/llms.txt` | `/react-native-nitro-device-info/ko/llms.txt` |
| 전체 AI 문서 | `/react-native-nitro-device-info/llms-full.txt` | `/react-native-nitro-device-info/ko/llms-full.txt` |

기본 언어는 `en`입니다. `route.localeRedirect: 'never'`로 브라우저 언어에 따른 자동 이동을 막습니다. 언어는 기본 선택기로 바꿉니다.

Rspress 2.0.23의 기본 언어 선택기는 키보드 포커스를 받지 못합니다. `docs/theme/index.tsx`는 상단 메뉴에 대응 페이지로 이동하는 일반 언어 링크를 추가합니다. 키보드로 이 링크에 포커스를 옮겨 Enter로 전환할 수 있습니다.

## 추가와 갱신

1. 영어 페이지와 `ko/`의 같은 경로에 대응 페이지를 작성합니다.
2. `rspress.config.ts`의 두 언어 상단 메뉴와 사이드바를 갱신합니다.
3. 한국어 frontmatter에 원문과 번역 기준 커밋을 기록합니다.

```yaml
translationOf: guide/getting-started.md
sourceCommit: <번역에 사용한 영어 원문의 커밋 SHA>
```

`translationOf`는 `docs/docs/` 기준 경로입니다. `sourceCommit`은 원문 확인용 기록이며 자동 최신화 기능이 아닙니다. 같은 PR에서 원문과 번역을 바꾸면 PR diff도 함께 대조합니다.

API 이름, 가져오기 경로, 명령, 타입, 수치, 단위, 반환값, 권한 이름은 유지합니다. 필수 조건, 금지 사항, 예외, 미배포 상태도 보존합니다. 실행할 코드는 영어 예제와 같게 유지하며 코드 주석은 영어를 사용합니다.

한국어 제목에는 대응 영어 제목의 ID를 `{#original-heading-id}`로 지정합니다. 링크의 `#...` 부분은 두 언어에서 같게 유지합니다. 제목을 번역하면서 명시적 ID를 삭제하지 마세요.

언어 선택기는 대응 파일 존재 여부를 확인하지 않습니다. 메뉴에서 제외한 페이지도 한국어 파일이 필요합니다. 빠뜨리면 언어 전환 시 404가 발생합니다. [언어 전환 구현](https://github.com/web-infra-dev/rspress/blob/v2.0.23/packages/core/src/theme/components/Nav/hooks.tsx#L11)

## 링크와 검색

- 한국어 메뉴의 `link: '/guide/...'`에는 `/ko`가 자동으로 붙습니다.
- 홈 frontmatter의 `hero.actions` 링크에는 `/ko/guide/getting-started`처럼 언어 접두사를 직접 넣습니다.
- 사이드바 키에는 `/ko/guide/`, `/ko/api/`처럼 접두사를 직접 넣습니다. 키는 자동 변환되지 않습니다.
- 본문은 `/guide/quick-start` 같은 콘텐츠 루트 링크 또는 상대 Markdown 링크를 사용합니다. 배포 base를 반복하지 않습니다.
- 영어 원문을 명시적으로 연결할 때는 영어 페이지의 완전한 `https://...` URL을 사용합니다.

[언어별 메뉴 정규화](https://github.com/web-infra-dev/rspress/blob/v2.0.23/packages/core/src/node/runtimeModule/siteData/normalizeThemeConfig.ts#L37)

사이트 검색은 언어별입니다. 한국어 검색에 영어 페이지가 자동으로 포함되지는 않습니다. 설명에 원래 API 이름도 남겨 한국어 용도와 API 이름으로 찾을 수 있게 합니다.

`llms: true`는 언어별 페이지 Markdown, `llms.txt`, `llms-full.txt`를 생성합니다. Rspress에서 experimental로 안내하므로 버전을 올리면 결과를 다시 확인합니다. [언어별 AI 출력 구현](https://github.com/web-infra-dev/rspress/blob/v2.0.23/packages/core/src/node/ssg-md/llms/emitLlmsTxt.ts#L131)

MCP의 기존 복사·색인 과정은 `ko/`를 포함한 사이트 Markdown을 재귀적으로 처리합니다. 한국어 검색어를 유지하지만 질의 번역이나 조사·띄어쓰기 변형의 형태소 분석은 제공하지 않습니다. 문서를 바꾸면 MCP도 다시 빌드하고, 설치한 클라이언트에 전달하려면 새 릴리스를 배포해야 합니다. 사이트 배포만으로 기존 MCP 패키지가 바뀌지 않습니다.

## 검증

`docs/`에서 `yarn install --immutable`, `yarn build`, `yarn preview`를 실행합니다.

- 모든 영어·한국어 경로와 제목 링크를 확인합니다.
- 언어를 양방향으로 바꿔 같은 페이지에 도달하는지 확인합니다.
- 기존 영어 URL, 로고, 모바일 메뉴, 키보드 언어 선택을 확인합니다.
- 설치·배터리·호환 API·Expo의 한국어 검색을 확인합니다.
- `doc_build/`와 `doc_build/ko/`의 AI 문서 출력을 확인합니다.
- MCP를 빌드하고 npm tarball만 설치한 환경에서도 한국어 문서 검색을 확인합니다.

브라우저 검증에는 Aside CLI/REPL을 사용합니다.
