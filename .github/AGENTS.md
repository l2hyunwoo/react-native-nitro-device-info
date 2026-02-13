<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-13 -->

# GitHub Configuration

## Purpose
GitHub-specific configuration: CI/CD workflows, issue templates, PR templates, and repository settings.

## Key Files

| File | Description |
|------|-------------|
| `workflows/ci.yml` | Main CI: lint, build, typecheck, validate-package (path-based change detection) |
| `workflows/publish.yml` | NPM publish workflow for library |
| `workflows/publish-mcp.yml` | MCP server publish workflow |
| `workflows/docs-deploy.yml` | Documentation deployment to GitHub Pages |
| `workflows/docs-validation.yml` | Documentation validation checks |
| `workflows/e2e-tests.yml` | End-to-end tests |
| `CODEOWNERS` | Default reviewer: @l2hyunwoo |

## For AI Agents

### Working In This Directory
- CI uses `dorny/paths-filter@v3` for change detection (library, mcp-server, docs, deps)
- All workflows use Node.js 20 and Yarn 3.6.1
- CI jobs: lint (oxlint), build (bob), build-ios, build-android, validate-package, mcp-server
- Workflows triggered on push to main/develop and PRs

### Testing Requirements
- Verify workflow syntax: `act` or manual trigger
- Test path filters match actual directory structure
- Ensure secrets are properly configured for publish workflows

### Common Patterns
- Path-based filtering to skip unnecessary CI jobs
- Reusable workflows via `workflow_call`
- Caching: Yarn PnP, Gradle, CocoaPods

## Dependencies

### Internal
- Workflows reference package scripts from root `package.json`
- Build jobs depend on workspace structure

### External
- `actions/checkout@v4`, `actions/setup-node@v4`
- `dorny/paths-filter@v3` - Change detection

<!-- MANUAL: -->
