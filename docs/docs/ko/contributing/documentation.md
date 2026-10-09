---
translationOf: contributing/documentation.md
sourceCommit: 3d53f125a194764ed27ccee3131d5dbc8abaf0ec
---

# 문서 기여 {#contributing-to-documentation}

문서 사이트는 Rspress를 사용합니다. 원문 페이지는 `docs/docs/`에, 설정은 `docs/rspress.config.ts`에 있습니다.

## 사이트 실행 {#run-the-site}

저장소 루트에서 실행하세요.

```bash
cd docs
yarn install --immutable
yarn dev
```

Rspress가 출력하는 URL을 여세요. `/react-native-nitro-device-info/` base 경로를 포함해야 합니다.

같은 디렉터리에서 프로덕션 사이트를 빌드하고 미리 볼 수 있습니다.

```bash
yarn build
yarn preview
```

빌드 결과는 이 디렉터리의 `doc_build/`입니다.

## 문서 위치 선택 {#choose-the-right-page}

| 내용 | 위치 | 목적 |
| --- | --- | --- |
| 설치와 설정 | `guide/getting-started.md`, `guide/expo-setup.md` | 요구 사항, 명령, 동작 확인 |
| 첫 사용 예제 | `guide/quick-start.md` | 설치부터 사용까지의 짧은 절차 |
| 상태 변화에 반응하는 사용법 | `guide/react-hooks.md` | 폴링 간격, 초기값, 컴포넌트 패턴 |
| 정확한 API 계약 | `api/` | 시그니처, 단위, 플랫폼 동작, 오류 |
| 마이그레이션 | `api/migration.md` | 진입점, 대응 관계, 호환성 예외 |
| 작업별 코드 | `examples/` | 가이드에 이어 사용할 예제 |

영어 경로는 `docs/docs/` 기준입니다. 한국어 대응 페이지는 `docs/docs/ko/` 아래의 같은 경로에 둡니다. 정적 자산은 공통 `docs/docs/public/`에 둡니다.

## 독자가 사용할 수 있는 예제 작성 {#write-examples-readers-can-use}

- 가져오기 경로를 명시하세요. 루트와 `/compat` API는 이름과 반환 타입이 다릅니다.
- JSX를 포함하는 코드에는 `tsx`를 사용하세요.
- 독립 예제에는 가져오기 문을 포함하세요. 앞선 코드에 의존하는 조각은 표시하세요.
- 조회 불가 값, 단위, 플랫폼 제한, Promise 거부를 설명하세요.
- 필요한 설정은 해당 코드보다 먼저 안내하세요.
- 의도한 타입 오류를 표시하세요. 존재하지 않는 멤버를 자동 완성 예제로 제시하지 마세요.
- 성능 수치는 측정 조건과 함께 적으세요. 동기 반환 타입은 실행 시간 보장이 아닙니다.

내보낸 TypeScript 타입을 사용하세요. 시그니처 원본은 [`DeviceInfo.nitro.ts`](https://github.com/l2hyunwoo/react-native-nitro-device-info/blob/main/packages/react-native-nitro-device-info/src/DeviceInfo.nitro.ts)이며, 플랫폼 동작은 Swift, Kotlin, 웹 구현이 결정합니다.

## 지원 여부 배지 관리 {#maintain-availability-badges}

새 API 절이나 묶음 속성 표의 행마다 도입 버전과 플랫폼 배지를 추가하세요. 기존 Rspress 테마의 `rp-badge` span을 사용하세요. Markdown 출력과 MCP 검색에 텍스트가 남도록 span 안에 문구를 쓰세요.

[배지 정의와 버전 근거](/api/#availability-badges)를 확인하세요. `Unreleased`를 `Since v…`로 바꾸기 전에 실제 npm 배포 버전과 소스를 확인하세요. 매니페스트 버전이나 선언만으로 플랫폼 구현의 배포를 입증할 수는 없습니다.

플랫폼이 고정 대체 값에서 실제 구현으로 바뀌면 배지를 수정하고 첫 동작 릴리스를 설명하세요. API 자체의 최초 도입 버전은 유지하세요. Swift, Kotlin, 웹 구현을 각각 확인하세요.

## 페이지 추가 또는 수정 {#add-or-change-a-page}

1. 알맞은 콘텐츠 디렉터리에서 Markdown 파일을 만들거나 수정하세요.
2. 새 페이지는 `docs/rspress.config.ts`의 `themeConfig.nav`와 `themeConfig.sidebar`, 한국어 locale 메뉴에 모두 추가하세요.
3. `/guide/quick-start` 같은 콘텐츠 루트 링크 또는 상대 Markdown 링크를 사용하세요. 내부 링크에 배포 base를 반복하지 마세요.
4. 기존 경로와 제목 앵커를 가능한 한 유지하세요.
5. 관련 예제와 README가 영향을 받으면 함께 수정하세요.
6. 사이트를 빌드하고 미리 보세요. 바꾼 링크와 검색 결과를 확인하세요.

영어를 기준 문서로 유지합니다. 모든 영어 페이지에는 `ko/`의 한국어 대응 페이지가 있어야 합니다. 한국어 frontmatter의 `translationOf`와 `sourceCommit`으로 원문과 번역 기준 커밋을 기록하세요. API 이름, 명령, 타입, 수치, 단위, 반환값, 권한, 필수 조건과 예외를 원문과 대조하세요. 한국어 페이지의 명시적 제목 ID도 유지하세요. 언어 선택기는 같은 경로로 이동하므로 대응 페이지를 빠뜨리면 404가 발생합니다. [한국어 문서 운영 안내](https://github.com/l2hyunwoo/react-native-nitro-device-info/blob/main/docs/I18N_PLAN.ko.md)를 참고하세요.

## AI가 읽는 문서 {#ai-readable-documentation}

Rspress는 사이트 빌드 중 페이지 Markdown, `llms.txt`, `llms-full.txt`를 언어별로 생성합니다.

MCP 서버는 빌드 중 별도의 문서 스냅샷을 포함합니다. 사이트 배포만으로 이미 배포한 MCP 패키지가 갱신되지는 않습니다. 문서 모음을 바꾸면 패키지를 다시 빌드하고 테스트하세요.

각 절에 API 이름, 가져오기 경로, 플랫폼 대체 값, 호환성 주의 사항을 명확하게 적으세요. 검색 결과에는 나머지 페이지 없이 절 하나만 포함될 수 있습니다.

## 배포 {#deployment}

`docs/**`를 바꾸는 PR에서는 문서 검증 워크플로가 실행됩니다. 사이트를 빌드하고 검토용 산출물을 업로드합니다.

`main`에 병합하면 배포 워크플로가 실행됩니다. 배포에 실패하면 [Actions 로그](https://github.com/l2hyunwoo/react-native-nitro-device-info/actions)와 GitHub Pages 설정을 확인하세요.
