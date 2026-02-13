<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-02-13 -->

# MCP Server

## Purpose
Model Context Protocol server published as `@react-native-nitro-device-info/mcp-server@1.0.3`. Provides AI tool integration (Claude, Cursor, etc.) with three tools for searching and querying library documentation.

## Key Files

| File | Description |
|------|-------------|
| `src/index.ts` | MCP server entry point: tool registration, stdio transport, BM25 index initialization |
| `package.json` | Dependencies (@modelcontextprotocol/sdk, zod), scripts |
| `tsconfig.json` | TypeScript configuration |
| `README.md` | Setup and usage guide |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | TypeScript source (see `src/AGENTS.md`) |
| `dist/` | Build output (compiled JavaScript) |
| `tests/` | Jest test suite |

## For AI Agents

### Working In This Directory
- Run `yarn build` to compile TypeScript
- Run `yarn start` to run the MCP server
- Run `yarn test` to execute tests
- Run `yarn inspector` to debug with MCP inspector
- Three tools: `search_docs` (BM25 search), `get_api` (API lookup), `list_apis` (filtered listing)

### Testing Requirements
- All tools must have unit tests in `tests/`
- Verify BM25 search quality for documentation queries
- Validate schema compliance using zod validators

### Common Patterns
- Tool inputs/outputs validated with zod schemas
- Error handling returns MCP-compliant error responses
- Documentation index built at startup from TypeScript source files

## Dependencies

### Internal
- None (standalone package in monorepo)

### External
- `@modelcontextprotocol/sdk@^1.26.0` - MCP protocol implementation
- `zod@^3.25.0` - Schema validation

<!-- MANUAL: -->
