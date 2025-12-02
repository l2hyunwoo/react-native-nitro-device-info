# @react-native-nitro-device-info/mcp-server

MCP (Model Context Protocol) server for react-native-nitro-device-info that enables AI tools like Claude, Cursor, and Copilot to accurately access library documentation and API information.

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | ≥20.0.0 | LTS recommended. Check with `node --version` |
| npm | ≥10.0.0 | Bundled with Node.js 20+ |

## Installation

### Option 1: npx (Recommended)

No installation required. Configure your AI tool to run directly:

```bash
npx @react-native-nitro-device-info/mcp-server
```

**Advantages**:
- Always uses latest version
- No global installation needed
- Works immediately after npm registry access

### Option 2: Global Install

```bash
npm install -g @react-native-nitro-device-info/mcp-server
```

Then run:

```bash
nitro-device-info-mcp
```

## Configuration

### Claude Desktop (macOS)

**Configuration file**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows path**: `%APPDATA%\Claude\claude_desktop_config.json`

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

**Steps**:
1. Open the configuration file (create if doesn't exist)
2. Add the `mcpServers` entry above
3. Restart Claude Desktop completely (Cmd+Q, then reopen)
4. Verify: Ask "What battery APIs does react-native-nitro-device-info have?"

### Cursor IDE

**Configuration file**: `.cursor/mcp.json` (in your project root)

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

### Generic MCP Client

For any MCP-compatible client using stdio transport:

```json
{
  "command": "npx",
  "args": ["@react-native-nitro-device-info/mcp-server"],
  "transport": "stdio"
}
```

## Verification

### Step 1: Check Server Loading

In Claude Desktop or your AI tool, ask:

> "What tools does the nitro-device-info MCP server provide?"

**Expected response**: Should mention `search_docs`, `get_api`, and `list_apis`.

### Step 2: Test API Lookup

> "Show me the getBatteryLevel API from react-native-nitro-device-info"

### Step 3: Test Search

> "How do I check if headphones are connected?"

### Step 4: Test List

> "List all battery-related APIs"

## Available Tools

| Tool | Purpose | Example Query |
|------|---------|---------------|
| `search_docs` | Search documentation with natural language | "how to get device model" |
| `get_api` | Get detailed info about a specific API | "show me getBatteryLevel" |
| `list_apis` | List APIs by category, platform, or type | "list all network APIs" |

## Usage Examples

### Basic Questions

> "How do I get the device's battery level?"

The AI will query the MCP server and provide accurate API information:

```typescript
import { NitroModules } from 'react-native-nitro-modules';
import type { DeviceInfo } from 'react-native-nitro-device-info';

const deviceInfo = NitroModules.createHybridObject<DeviceInfo>('DeviceInfo');

// Get battery level (0.0 to 1.0)
const batteryLevel = deviceInfo.getBatteryLevel();
console.log(`Battery: ${Math.round(batteryLevel * 100)}%`);
```

### API Discovery

> "What APIs are available for network information?"

### Troubleshooting Questions

> "Why does getIpAddress return empty on iOS simulator?"

## Troubleshooting

### Server Not Loading

**Symptom**: AI doesn't recognize react-native-nitro-device-info questions

**Diagnostic steps**:

1. **Check Node.js version**:
   ```bash
   node --version  # Must be v20.0.0 or higher
   ```

2. **Verify npx works**:
   ```bash
   npx --version
   ```

3. **Test server directly**:
   ```bash
   npx @react-native-nitro-device-info/mcp-server --help
   ```

4. **Check Claude Desktop logs** (macOS):
   ```bash
   tail -f ~/Library/Logs/Claude/mcp*.log
   ```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "command not found" | Node.js not in PATH | Reinstall Node.js or add to PATH |
| "npm ERR! 404" | Package not published | Wait for npm publish or build from source |
| JSON parse error | Invalid config syntax | Check for trailing commas, quotes |
| Server timeout | Slow network/registry | Use global install for offline use |

## Development

### Run from Source

```bash
git clone https://github.com/mj-studio-library/react-native-nitro-device-info.git
cd react-native-nitro-device-info
yarn install
yarn workspace @react-native-nitro-device-info/mcp-server build
yarn workspace @react-native-nitro-device-info/mcp-server start
```

### Run Tests

```bash
yarn workspace @react-native-nitro-device-info/mcp-server test
```

## License

MIT
