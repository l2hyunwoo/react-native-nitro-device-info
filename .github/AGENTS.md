<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-13 -->

# GitHub Configuration

## Purpose
GitHub-specific configuration: CI/CD workflows, issue templates, and repository settings.

## Key Files

| File | Description |
|------|-------------|
| `workflows/ci.yml` | Main CI: lint, typecheck, build, build-ios, build-android, validate-package, mcp-server (path-based change detection) |
| `workflows/publish.yml` | Library publish: version bump -> tag -> NPM publish with provenance -> GitHub Release (`workflow_dispatch`) |
| `workflows/publish-mcp.yml` | MCP server publish: validate -> version bump -> tag -> NPM publish -> GitHub Release (`workflow_dispatch`) |
| `workflows/docs-deploy.yml` | Docs deployment to GitHub Pages on push to main (`docs/**` path filter) |
| `workflows/docs-validation.yml` | Docs build validation on PRs (`docs/**` path filter) |
| `CODEOWNERS` | Default reviewer: @l2hyunwoo (all files) |
| `ISSUE_TEMPLATE/bug_report.yml` | Bug report template (library version, environment info, repro steps, repro repo required) |
| `ISSUE_TEMPLATE/config.yml` | Disables blank issues; routes feature requests and questions to GitHub Discussions |

## For AI Agents

### Working In This Directory
- CI uses `dorny/paths-filter@v3` for change detection with 4 filters: `library`, `mcp-server`, `docs`, `deps`
- All workflows use Node.js 20 and `yarn install --immutable`
- CI jobs (triggered on push to main/develop and PRs):
  - **lint**: oxlint + TypeScript typecheck (runs when library, mcp-server, or deps change)
  - **build**: TypeScript build via `yarn prepare`, verifies `lib/module`, `lib/typescript`, `nitrogen/generated` outputs
  - **build-ios**: CocoaPods install + xcodebuild on `macos-15` (showcase app, Release config, iphonesimulator)
  - **build-android**: ktlint check + Gradle assembleDebug on `ubuntu-latest` (Java 17 temurin)
  - **validate-package**: `npm pack` + verifies tarball contains required files (lib, src, ios, android)
  - **mcp-server**: typecheck + build + test (only when `packages/mcp-server/**` changes)
- Publish workflows are `workflow_dispatch` only, require `version` input (X.Y.Z format) and support `dry_run`
- Library tags: `v{VERSION}`, MCP server tags: `mcp-server-v{VERSION}`

### Testing Requirements
- Verify workflow syntax with `act` or manual trigger
- Test path filters match actual monorepo directory structure (`packages/react-native-nitro-device-info/`, `packages/mcp-server/`, `docs/`, `example/`)
- Ensure `NPM_TOKEN` and `GITHUB_TOKEN` secrets are configured for publish workflows
- Publish workflows use NPM provenance (`--provenance --access public`)

### Common Patterns
- Path-based filtering via `dorny/paths-filter@v3` to skip unnecessary CI jobs
- CI workflow exposes `workflow_call` for reuse from other workflows
- Caching strategies: Yarn (built-in `actions/setup-node` cache), Gradle (`~/.gradle/caches`), CocoaPods (`~/Library/Caches/CocoaPods`), Xcode DerivedData
- Publish workflows: version commit -> tag -> NPM publish -> GitHub Release with auto-generated release notes
- Concurrency groups on publish workflows to prevent parallel releases

## Dependencies

### Internal
- Workflows reference package scripts from root `package.json` (`yarn prepare`, `yarn lint`, `yarn typecheck`, `yarn test`)
- Build jobs depend on monorepo workspace structure (`packages/`, `example/`)

### External
- `actions/checkout@v4`, `actions/setup-node@v4`, `actions/cache@v4`
- `actions/setup-java@v4` (Android build, temurin JDK 17)
- `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4` (docs)
- `actions/upload-artifact@v4` (docs validation)
- `dorny/paths-filter@v3` - Change detection
- `softprops/action-gh-release@v1` - GitHub Release creation (publish workflows)

<!-- MANUAL: -->
