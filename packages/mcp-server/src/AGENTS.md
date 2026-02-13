<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-13 -->

# MCP Server Source

## Purpose
Source code for the MCP server: entry point, documentation indexer, tool implementations, and type definitions.

## Key Files

| File | Description |
|------|-------------|
| `index.ts` | MCP server entry point, tool registration, stdio transport setup, BM25 index initialization |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `cli/` | CLI commands (init.ts for mcp init command) |
| `indexer/` | Documentation indexer (api-parser.ts, doc-parser.ts, search.ts) |
| `tools/` | MCP tool implementations (search-docs.ts, get-api.ts, list-apis.ts) |
| `types/` | TypeScript type definitions (SearchIndex, ApiEntry, tool schemas) |

## For AI Agents

### Working In This Directory
- `index.ts` is the main server entry point using stdio transport
- BM25 search index is built at startup from TypeScript source files
- Tool handlers route to implementations in `tools/`
- All tool inputs validated with zod schemas

### Testing Requirements
- Test indexer parsing on actual TypeScript source files
- Validate BM25 search quality and relevance ranking
- Test tool handlers with valid and invalid inputs
- Integration tests: full server lifecycle with stdio transport

### Common Patterns
- Indexer: parse TypeScript AST → extract JSDoc → build BM25 index
- Tool: validate input → query index → format response → return
- Error handling: catch exceptions → wrap in MCP error format

## Dependencies

### Internal
- Imports types from `types/`
- Uses indexer for building documentation index

### External
- `@modelcontextprotocol/sdk` - Server, StdioServerTransport, tool registration
- `zod` - Schema validation

<!-- MANUAL: -->
