# Changelog

## 1.0.3

### Patch Changes

- [#57](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/57) [`8c28998`](https://github.com/l2hyunwoo/react-native-nitro-device-info/commit/8c28998f743822ef6440b44508e7d4524e4b599f) Thanks [@l2hyunwoo](https://github.com/l2hyunwoo)! - refactor: reorganize api-lists by document change

- [#53](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/53) [`2766f17`](https://github.com/l2hyunwoo/react-native-nitro-device-info/commit/2766f178e519173e8dbf0bfd5696a268ff8f2237) Thanks [@l2hyunwoo](https://github.com/l2hyunwoo)! - architecture: apply monorepo

All notable changes to `@react-native-nitro-device-info/mcp-server` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-12-03

### Fixed

- **npm publish workspace protocol error**: Added `.npmrc` with `workspaces=false` to fix npm publish failing due to yarn workspace protocol in dependencies

### Changed

- **@modelcontextprotocol/sdk**: Bumped from 1.23.0 to 1.24.0

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

- **CLI Commands**:
  - `init`: Automatically create MCP configuration files in your project
    - Creates `.cursor/mcp.json` for Cursor IDE
    - Creates `.mcp.json` for Claude Code
    - Safely merges with existing configurations
  - `--help`: Show usage information

- **AI Tool Configuration**:
  - Claude Desktop (macOS/Windows)
  - Cursor IDE (auto-configured via `init`)
  - Claude Code (auto-configured via `init`)
  - Any MCP-compatible client with stdio transport

[1.0.1]: https://github.com/l2hyunwoo/react-native-nitro-device-info/releases/tag/mcp-server-v1.0.1
[1.0.0]: https://github.com/l2hyunwoo/react-native-nitro-device-info/releases/tag/mcp-server-v1.0.0
