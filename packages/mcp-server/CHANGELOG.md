# Changelog

All notable changes to `@react-native-nitro-device-info/mcp-server` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-02

### Added

- **Initial Release**: MCP (Model Context Protocol) server for AI tool integration
  - Enables Claude, Cursor, Copilot, and other MCP-compatible AI tools to access accurate react-native-nitro-device-info documentation

- **MCP Tools**:
  - `search_docs`: Natural language documentation search with BM25 ranking algorithm
    - Supports type filtering (api, guide, tutorial, troubleshooting)
    - Returns relevance-scored results with platform information
  - `get_api`: Detailed API lookup with fuzzy matching (Levenshtein distance ≤3)
    - Returns full TypeScript signatures, parameters, examples
    - Includes import path suggestions and related APIs
  - `list_apis`: Filter and list APIs by category, platform, or kind
    - Supports 10+ categories (battery, memory, network, device-info, etc.)
    - Platform filtering (ios, android, both)
    - Kind filtering (method, property)

- **Documentation Indexing**:
  - Indexes 80+ APIs from DeviceInfo.nitro.ts
  - Parses JSDoc comments for descriptions, examples, and platform tags
  - Chunks markdown documentation by headings
  - Extracts platform-specific notes and limitations

- **Installation Methods**:
  - npx: `npx @react-native-nitro-device-info/mcp-server` (recommended)
  - Global: `npm install -g @react-native-nitro-device-info/mcp-server`
  - CLI command: `nitro-device-info-mcp`

- **AI Tool Configuration**:
  - Claude Desktop (macOS/Windows)
  - Cursor IDE
  - Any MCP-compatible client with stdio transport

[1.0.0]: https://github.com/mj-studio-library/react-native-nitro-device-info/releases/tag/mcp-server-v1.0.0
