# MCP Server for AI Integration

Enable AI coding assistants like Claude, Cursor, and Copilot to access accurate react-native-nitro-device-info documentation through the MCP (Model Context Protocol) server.

## What is MCP?

[MCP (Model Context Protocol)](https://modelcontextprotocol.io/) is an open protocol by Anthropic that enables AI tools to access external data sources and tools. The MCP server for react-native-nitro-device-info allows AI assistants to:

- Provide accurate API documentation instead of hallucinating
- Generate correct TypeScript code with proper types
- Answer platform-specific questions (iOS vs Android)
- Help troubleshoot common issues

## Installation

### Using npx (Recommended)

No installation required. Configure your AI tool to run:

```bash
npx @react-native-nitro-device-info/mcp-server
```

### Global Installation

```bash
npm install -g @react-native-nitro-device-info/mcp-server
```

Then run:

```bash
nitro-device-info-mcp
```

## Configuration

### Claude Desktop

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

After saving, restart Claude Desktop completely (Cmd+Q, then reopen).

### Cursor IDE

Create `.cursor/mcp.json` in your project root:

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

### Other MCP Clients

For any MCP-compatible client using stdio transport:

```json
{
  "command": "npx",
  "args": ["@react-native-nitro-device-info/mcp-server"],
  "transport": "stdio"
}
```

## Available Tools

The MCP server provides three tools:

| Tool | Purpose | Example Query |
|------|---------|---------------|
| `search_docs` | Natural language documentation search | "how to get device model" |
| `get_api` | Detailed info about a specific API | "show me getBatteryLevel" |
| `list_apis` | List APIs by category/platform/type | "list all network APIs" |

## Usage Examples

### Basic API Questions

> "How do I get the device's battery level?"

The AI will query the MCP server and provide:

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

// Get battery level (0.0 to 1.0)
const batteryLevel = DeviceInfoModule.getBatteryLevel();
console.log(`Battery: ${Math.round(batteryLevel * 100)}%`);
```

### API Discovery

> "What APIs are available for network information?"

### Platform-Specific Questions

> "Why does getIpAddress return empty on iOS simulator?"

### Code Generation

> "Generate code to display all device info on a screen"

## Verification

After configuration, verify the MCP server is working:

1. Ask your AI tool: "What tools does the nitro-device-info MCP server provide?"
2. Expected response should mention `search_docs`, `get_api`, and `list_apis`

## Troubleshooting

### Server Not Loading

1. Check Node.js version (requires v20.0.0+):
   ```bash
   node --version
   ```

2. Verify npx works:
   ```bash
   npx --version
   ```

3. Test server directly:
   ```bash
   npx @react-native-nitro-device-info/mcp-server --help
   ```

4. Check Claude Desktop logs (macOS):
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

## Requirements

- Node.js 20.0.0 or higher
- npm 10.0.0 or higher
- MCP-compatible AI tool (Claude Desktop, Cursor, etc.)
