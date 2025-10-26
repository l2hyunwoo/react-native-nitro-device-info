# 문서

`react-native-nitro-device-info` 문서에 기여하는 방법에 대한 가이드입니다.

## 로컬 개발

### 전제 조건

- Node.js 20 이상
- Yarn 패키지 관리자

### 로컬 실행

1. docs 디렉토리로 이동:

```bash
cd docs
```

2. 의존성 설치:

```bash
yarn install
```

3. 개발 서버 시작:

```bash
yarn dev
```

문서 사이트는 `http://localhost:5173`에서 사용할 수 있습니다.

### 프로덕션 빌드

프로덕션용 문서를 빌드하려면:

```bash
cd docs
yarn build
```

빌드된 파일은 `docs/doc_build`에 출력됩니다.

## 문서 구조

```
docs/
├── docs/                     # 문서 콘텐츠 (Markdown 파일)
│   ├── index.md             # 홈페이지
│   ├── guide/               # 시작 가이드
│   ├── api/                 # API 문서
│   ├── examples/            # 사용 예제
│   └── contributing/        # 기여 가이드
├── .rspress/                # RSPress 구성
│   └── config.ts           # 메인 구성 파일
└── public/                  # 정적 자산 (로고, 이미지 등)
```

## 배포

문서는 변경 사항이 `main` 브랜치에 병합되면 자동으로 GitHub Pages에 배포됩니다.

- 워크플로: `.github/workflows/docs-deploy.yml`
- 라이브 사이트: https://l2hyunwoo.github.io/react-native-nitro-device-info/

## 기여

자세한 배포 문서는 영문 버전을 참조하세요.
