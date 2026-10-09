# @react-native-nitro-device-info/mcp-server

[English](README.md) | **한국어**

Claude, Cursor, Copilot 같은 AI 도구가 react-native-nitro-device-info 문서와 API 정보를 조회할 수 있게 하는 MCP(Model Context Protocol) 서버입니다.

## 사전 요구 사항

| 항목 | 버전 | 참고 |
| --- | --- | --- |
| Node.js | ≥20.0.0 | LTS 권장. `node --version`으로 확인 |
| npm | ≥10.0.0 | Node.js 20 이상에 포함 |

## 설치

### 방법 1: npx(권장)

설치 없이 AI 도구가 직접 실행하도록 설정하세요.

```bash
npx @react-native-nitro-device-info/mcp-server
```

**특징**:

- 전역 설치 불필요
- npm 레지스트리에 접근하면 실행 가능
- 실행 버전은 npx의 버전 해석과 캐시에 따름

### 방법 2: 전역 설치

```bash
npm install -g @react-native-nitro-device-info/mcp-server
```

설치 후 실행하세요.

```bash
nitro-device-info-mcp
```

## 빠른 설정(권장)

React Native 프로젝트에서 `init`을 실행하면 Cursor와 Claude Code의 MCP 설정을 자동 생성합니다.

```bash
cd your-react-native-project
npx @react-native-nitro-device-info/mcp-server init
```

다음 파일을 만듭니다.

- `.cursor/mcp.json`: Cursor IDE 설정
- `.mcp.json`: Claude Code 프로젝트 설정

IDE를 재시작한 뒤 질문하세요.

## 수동 설정

### Claude Desktop(macOS)

**설정 파일**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows 경로**: `%APPDATA%\Claude\claude_desktop_config.json`

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

**절차**:

1. 설정 파일을 여세요. 없으면 생성하세요.
2. 위 `mcpServers` 항목을 추가하세요.
3. Claude Desktop을 완전히 종료하고(Cmd+Q) 다시 실행하세요.
4. "react-native-nitro-device-info의 배터리 API에는 무엇이 있나요?"로 동작을 확인하세요.

### Cursor IDE

**설정 파일**: 프로젝트 루트의 `.cursor/mcp.json`

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

### 일반 MCP 클라이언트

stdio 전송을 사용하는 MCP 클라이언트는 다음과 같이 설정하세요.

```json
{
  "command": "npx",
  "args": ["@react-native-nitro-device-info/mcp-server"],
  "transport": "stdio"
}
```

## 동작 확인

### 1단계: 서버 로드 확인

Claude Desktop 또는 AI 도구에 질문하세요.

> "nitro-device-info MCP 서버는 어떤 도구를 제공하나요?"

응답에 `search_docs`, `get_api`, `list_apis`가 있어야 합니다.

### 2단계: API 조회

> "react-native-nitro-device-info의 getBatteryLevel API를 보여 주세요"

### 3단계: 검색

> "헤드폰 연결 여부를 어떻게 확인하나요?"

### 4단계: 목록

> "배터리 관련 API를 모두 보여 주세요"

## 제공 도구

| 도구 | 용도 | 질문 예시 |
| --- | --- | --- |
| `search_docs` | 자연어 문서 검색 | "기기 모델을 어떻게 읽나요?" |
| `get_api` | 특정 API의 상세 정보 | "getBatteryLevel을 보여 주세요" |
| `list_apis` | 범주·플랫폼·타입별 API 목록 | "네트워크 API를 모두 보여 주세요" |

## 사용 예제

### 기본 질문

> "기기의 배터리 잔량을 어떻게 읽나요?"

AI가 MCP 서버를 조회하고 API 정보를 제시할 수 있습니다.

```typescript
import { NitroModules } from 'react-native-nitro-modules';
import type { DeviceInfo } from 'react-native-nitro-device-info';

const deviceInfo = NitroModules.createHybridObject<DeviceInfo>('DeviceInfo');

// Get battery level (0.0 to 1.0)
const batteryLevel = deviceInfo.getBatteryLevel();
console.log(batteryLevel < 0
  ? 'Battery: unavailable'
  : `Battery: ${Math.round(batteryLevel * 100)}%`);
```

### API 찾기

> "네트워크 정보를 읽는 API에는 무엇이 있나요?"

### device attestation

기기에서 발급한 토큰을 서버에서 검증하는 device attestation API도 색인합니다. 선택 패키지 [`react-native-nitro-device-integrity`](../react-native-nitro-device-integrity/README-ko.md)(Play Integrity + App Attest / DeviceCheck)가 대상입니다. 이 패키지는 2026-10-10 기준 npm 미배포 상태입니다.

> "Play Integrity 토큰을 어떻게 요청하나요?"
>
> "attestKey와 generateAssertion의 차이는 무엇인가요?"
>
> "device attestation API를 모두 보여 주세요"

### 문서 스냅샷

배포 패키지는 핵심 API와 device attestation API 명세, 영어·한국어 사이트 Markdown, 라이브러리 README를 `data/`에 포함합니다. 서버는 패키지에 포함된 이 스냅샷을 색인하므로 웹사이트를 가져오거나 소스 저장소를 별도로 둘 필요가 없습니다.

원문을 바꾸면 MCP 패키지를 다시 빌드하세요. 설치한 클라이언트에 변경을 전달하려면 새 MCP 릴리스를 배포해야 합니다. 사이트 배포만으로 기존 MCP 패키지가 갱신되지는 않습니다. 설치한 라이브러리와 스냅샷의 내용이 다르면 라이브러리의 선언을 확인하세요.

패키지 루트의 API와 `/compat` API는 다릅니다. API 조회 결과에는 패키지 루트에서 export하는 네이티브 API의 시그니처가 담깁니다. 호환 대응표는 마이그레이션 가이드를 참고하세요. 한국어 검색어는 유지하지만 대응하는 한국어 내용이 문서에 있어야 검색됩니다. 서버는 질의를 번역하지 않습니다. 조사·띄어쓰기를 형태소 단위로 분석하는 기능도 없습니다.

## 문제 해결 질문

> "iOS 시뮬레이터에서 getIpAddress가 빈 값을 반환하는 이유는 무엇인가요?"

## 문제 해결

### 서버가 로드되지 않는 경우

**증상**: AI가 react-native-nitro-device-info 질문을 인식하지 못합니다.

**확인 절차**:

1. **Node.js 버전 확인**:
   ```bash
   node --version  # Must be v20.0.0 or higher
   ```

2. **npx 확인**:
   ```bash
   npx --version
   ```

3. **서버 직접 실행**:
   ```bash
   npx @react-native-nitro-device-info/mcp-server --help
   ```

4. **Claude Desktop 로그 확인(macOS)**:
   ```bash
   tail -f ~/Library/Logs/Claude/mcp*.log
   ```

### 자주 생기는 문제

| 문제 | 원인 | 해결 방법 |
| --- | --- | --- |
| "command not found" | PATH에 Node.js 없음 | Node.js 재설치 또는 PATH에 추가 |
| "npm ERR! 404" | 패키지가 배포되지 않음 | npm 배포를 기다리거나 소스에서 빌드 |
| JSON 구문 오류 | 잘못된 설정 문법 | 후행 쉼표와 따옴표 확인 |
| 서버 시간 초과 | 느린 네트워크·레지스트리 | 오프라인 사용을 위해 전역 설치 |

## 개발

### 소스에서 실행

```bash
git clone https://github.com/l2hyunwoo/react-native-nitro-device-info.git
cd react-native-nitro-device-info
yarn install
yarn workspace @react-native-nitro-device-info/mcp-server build
yarn workspace @react-native-nitro-device-info/mcp-server start
```

### 테스트 실행

```bash
yarn workspace @react-native-nitro-device-info/mcp-server test
```

## 라이선스

MIT
