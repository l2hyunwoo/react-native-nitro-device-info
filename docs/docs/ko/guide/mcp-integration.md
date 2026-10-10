---
translationOf: guide/mcp-integration.md
sourceCommit: 3d53f125a194764ed27ccee3131d5dbc8abaf0ec
---

# AI 연동용 MCP 서버 {#mcp-server-for-ai-integration}

MCP(Model Context Protocol) 서버를 사용하면 Claude, Cursor, Copilot 같은 AI 코딩 도우미가 react-native-nitro-device-info 문서를 조회할 수 있습니다.

## 문서 버전과 import 경로 확인 {#check-the-documentation-version-and-entry-point}

MCP 패키지에는 빌드 시점의 API 명세와 Markdown이 포함됩니다. 실행 중에 최신 웹사이트를 읽어 오지는 않습니다. 설치한 라이브러리 버전의 API를 설명하는 서버 릴리스를 사용하고, 설치된 TypeScript 선언과 대조하세요.

AI와 함께 코드를 바꿀 때 다음 정보를 지정하세요.

- 설치한 라이브러리 버전과 대상 플랫폼
- 패키지 루트의 네이티브 API를 import할지, `/compat` API를 import할지
- Expo 개발 빌드, 일반 React Native, 웹/SSR 중 사용 환경
- 값을 읽을 수 없는 경우와 Promise가 reject될 가능성

정확한 시그니처는 `get_api`, 설정과 플랫폼 주의 사항은 `search_docs`로 조회하세요. 검색 결과에는 페이지 일부만 포함될 수 있습니다.

웹사이트는 [llms.txt](https://l2hyunwoo.github.io/react-native-nitro-device-info/ko/llms.txt)와 [llms-full.txt](https://l2hyunwoo.github.io/react-native-nitro-device-info/ko/llms-full.txt)도 제공합니다. 이 파일은 설치한 npm 릴리스가 아닌 웹사이트 빌드를 기준으로 합니다.

## MCP란? {#what-is-mcp}

[MCP(Model Context Protocol)](https://modelcontextprotocol.io/)는 Anthropic의 공개 프로토콜로, AI 도구가 외부 데이터와 도구에 접근할 수 있게 합니다. react-native-nitro-device-info용 MCP 서버는 다음 작업을 지원합니다.

- API 선언과 문서 섹션 조회
- 올바른 타입을 사용하는 TypeScript 코드 작성
- 플랫폼별 질문에 답변(iOS와 Android)
- 자주 생기는 문제 해결

## 빠른 설정(권장) {#quick-setup-recommended}

React Native 프로젝트에서 `init`을 실행하면 Cursor와 Claude Code의 MCP 설정을 자동으로 생성합니다.

```bash
cd your-react-native-project
npx @react-native-nitro-device-info/mcp-server init
```

다음 파일을 만듭니다.

- `.cursor/mcp.json`: Cursor IDE 설정
- `.mcp.json`: Claude Code 프로젝트 설정

IDE를 재시작한 뒤 질문하세요.

## 수동 설치 {#manual-installation}

### npx 사용 {#using-npx}

설치 없이 AI 도구가 다음 명령을 실행하도록 설정하세요.

```bash
npx @react-native-nitro-device-info/mcp-server
```

### 전역 설치 {#global-installation}

```bash
npm install -g @react-native-nitro-device-info/mcp-server
```

설치 후 실행하세요.

```bash
nitro-device-info-mcp
```

## 수동 설정 {#manual-configuration}

### Claude Desktop {#claude-desktop}

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "nitro-device-info": {
      "command": "npx",
      "args": ["@react-native-nitro-device-info/mcp-server"]
    }
  }
}
```

저장 후 Claude Desktop을 완전히 종료하고(Cmd+Q) 다시 실행하세요.

### Cursor IDE {#cursor-ide}

프로젝트 루트에 `.cursor/mcp.json`을 만드세요.

```json
{
  "mcpServers": {
    "nitro-device-info": {
      "command": "npx",
      "args": ["@react-native-nitro-device-info/mcp-server"]
    }
  }
}
```

### 다른 MCP 클라이언트 {#other-mcp-clients}

stdio 전송을 지원하는 MCP 클라이언트는 다음과 같이 설정하세요.

```json
{
  "command": "npx",
  "args": ["@react-native-nitro-device-info/mcp-server"],
  "transport": "stdio"
}
```

## 제공 도구 {#available-tools}

서버는 세 도구를 제공합니다.

| 도구 | 용도 | 질문 예시 |
| --- | --- | --- |
| `search_docs` | 자연어로 문서 검색 | "기기 모델을 어떻게 읽나요?" |
| `get_api` | 특정 API의 상세 정보 | "getBatteryLevel을 보여 주세요" |
| `list_apis` | 범주·플랫폼·타입별 API 목록 | "네트워크 API를 모두 보여 주세요" |

## 사용 예제 {#usage-examples}

### 기본 API 질문 {#basic-api-questions}

> "기기의 배터리 잔량을 어떻게 읽나요?"

AI가 MCP 서버를 조회하고 다음 코드를 제시할 수 있습니다.

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

// Get battery level (0.0 to 1.0)
const batteryLevel = DeviceInfoModule.getBatteryLevel();
console.log(batteryLevel < 0
  ? 'Battery: unavailable'
  : `Battery: ${Math.round(batteryLevel * 100)}%`);
```

### API 찾기 {#api-discovery}

> "네트워크 정보를 읽는 API에는 무엇이 있나요?"

### 플랫폼별 질문 {#platform-specific-questions}

> "iOS 시뮬레이터에서 getIpAddress가 빈 값을 반환하는 이유는 무엇인가요?"

### 코드 생성 {#code-generation}

> "모든 기기 정보를 화면에 표시하는 코드를 만들어 주세요"

## 동작 확인 {#verification}

설정 후 서버가 동작하는지 확인하세요.

1. AI 도구에 "nitro-device-info MCP 서버는 어떤 도구를 제공하나요?"라고 질문합니다.
2. 응답에 `search_docs`, `get_api`, `list_apis`가 있는지 확인합니다.

## 문제 해결 {#troubleshooting}

### 서버가 로드되지 않는 경우 {#server-not-loading}

1. Node.js 버전을 확인하세요(v20.0.0 이상 필요).
   ```bash
   node --version
   ```

2. npx 동작을 확인하세요.
   ```bash
   npx --version
   ```

3. 서버를 직접 테스트하세요.
   ```bash
   npx @react-native-nitro-device-info/mcp-server --help
   ```

4. Claude Desktop 로그를 확인하세요(macOS).
   ```bash
   tail -f ~/Library/Logs/Claude/mcp*.log
   ```

### 자주 생기는 문제 {#common-issues}

| 문제 | 원인 | 해결 방법 |
| --- | --- | --- |
| "command not found" | PATH에 Node.js가 없음 | Node.js 재설치 또는 PATH에 추가 |
| "npm ERR! 404" | 패키지가 배포되지 않음 | npm 배포를 기다리거나 소스에서 빌드 |
| JSON 구문 오류 | 잘못된 설정 문법 | 후행 쉼표와 따옴표 확인 |
| 서버 시간 초과 | 느린 네트워크 또는 레지스트리 | 오프라인 사용을 위해 전역 설치 |

## 요구 사항 {#requirements}

- Node.js 20.0.0 이상
- npm 10.0.0 이상
- MCP를 지원하는 AI 도구(Claude Desktop, Cursor 등)
