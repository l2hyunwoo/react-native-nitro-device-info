<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-13 -->

# GitHub Configuration

## Purpose
GitHub-specific configuration: CI/CD workflows, issue templates, and repository settings.

## Key Files

| File | Description |
|------|-------------|
| `workflows/ci.yml` | Main CI: lint, typecheck, build, build-ios, build-android, validate-package, mcp-server (path-based change detection) |
| `workflows/release.yml` | Changesets version PRs on main push; manual dry run or verified archive publication for all public packages |
| `RELEASING.md` / `RELEASING-ko.md` | Maintainer setup, publication, first integrity release, and recovery |
| `workflows/docs-deploy.yml` | Docs deployment to GitHub Pages on push to main (`docs/**` path filter) |
| `workflows/docs-validation.yml` | Docs build validation on PRs (`docs/**` path filter) |
| `CODEOWNERS` | Default reviewer: @l2hyunwoo (all files) |
| `ISSUE_TEMPLATE/bug_report.yml` | Bug report template (library version, environment info, repro steps, repro repo required) |
| `ISSUE_TEMPLATE/config.yml` | Disables blank issues; routes feature requests and questions to GitHub Discussions |

## For AI Agents

### Working In This Directory
- CI uses SHA-pinned `dorny/paths-filter` for change detection: `library`, `integrity`, `mcp-server`, `docs`, `deps`. MCP also tracks both bundled Nitro specs, documentation, and the root README. Shared scripts, Changesets, and release workflow changes trigger dependency checks.
- Reusable CI defaults `full_validation` to true so manual releases run every native and archive check.
- Workflows use Node.js 22 and `yarn install --immutable`. Release jobs follow the Node.js 22 release line and pin npm 11.5.1; the CLI enforces Node.js 22.14.0+ and npm 11.5.1+.
- CI jobs (triggered on push to main/develop and PRs):
  - **lint**: oxlint + TypeScript typecheck (runs when library, mcp-server, or deps change)
  - **build**: TypeScript build via `yarn prepare`, verifies `lib/module`, `lib/typescript`, `nitrogen/generated` outputs
  - **build-ios**: CocoaPods install + xcodebuild on `macos-15` (showcase app, Release config, iphonesimulator)
  - **build-android**: ktlint check + Gradle assembleDebug on `ubuntu-26.04` (Java 17 temurin)
  - **validate-package**: build and pack all three public packages; run release/checker tests, archive validation, isolated Expo/MCP smoke checks, and web package regressions
  - **build-integrity**: native iOS/Android example builds; Swift regressions in the iOS job and Gradle JUnit provider regressions in the Android job. Gradle supplies Kotlin; no standalone compiler installation is needed.
  - **mcp-server**: typecheck + build + test when the server or its bundled source/documentation inputs change
- Main pushes only create or update a Changesets version PR; they never publish. The version command refreshes the Yarn lockfile before the action commits.
- Manual `release.yml` dispatch defaults `publish` to false. It validates CI, selects unpublished exact versions of device-info, device-integrity, and MCP, then uploads verified archives with their commit SHA and SHA512 digests.
- Manual `verify_oidc: true` skips builds and publication. Its protected `npm` environment job checks GitHub OIDC claims and exchanges tokens for all three public packages. It masks credentials and records only results and expiry times. Both inputs set to true fail before token requests.
- Publication requires `publish: true`, `verify_oidc: false`, the main branch, no pending changesets, and the `npm` environment. Only publish and OIDC verification jobs have `id-token: write`. Publication uses npm CLI OIDC to publish the exact downloaded archives after revalidation. No npm token or automatic first-publication bootstrap is used.
- Package tags use `{package-name}@{version}`. Tags and GitHub Releases are created only after the registry confirms the matching archive. Rerun failed jobs to recover partial releases with the original artifact; existing exact versions are not republished.
- Release concurrency is repository-wide and never cancels an in-progress release.

### Testing Requirements
- Verify workflow syntax with `actionlint`; do not trigger a workflow or publish unless explicitly authorized
- Test path filters match actual monorepo directory structure (`packages/react-native-nitro-device-info/`, `packages/mcp-server/`, `docs/`, `example/`)
- `yarn test:release` requires built public packages and covers archive validation and injected release failure/retry cases without publishing.
- npm trusted publishers must authorize `release.yml`, the `npm` environment, and direct `npm publish` for each existing package. See [RELEASING.md](RELEASING.md) for the first integrity publication and recovery procedure.
- Dirty local dry runs are marked as drafts and cannot be published. Release archives use `--ignore-scripts`; actual npm publication also uses `--provenance --access public`.

### Common Patterns
- Path-based filtering via `dorny/paths-filter@v3` to skip unnecessary CI jobs
- CI workflow exposes `workflow_call` for reuse from other workflows
- Caching strategies: Yarn (built-in `actions/setup-node` cache), Gradle (`~/.gradle/caches`), CocoaPods (`~/Library/Caches/CocoaPods`), Xcode DerivedData
- Release workflow: Changesets version PR -> manual full CI -> build/pack/check immutable artifacts -> explicit OIDC publish -> package tag -> GitHub Release with the version changelog entry
- Concurrency groups on publish workflows to prevent parallel releases

## Dependencies

### Internal
- Workflows reference package scripts from root `package.json` (`yarn prepare`, `yarn lint`, `yarn typecheck`, `yarn test`)
- Build jobs depend on monorepo workspace structure (`packages/`, `example/`)

### External
- `actions/checkout@v7`, `actions/setup-node@v7`, `actions/cache@v4`
- `actions/setup-java@v4` (Android build, temurin JDK 17)
- `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4` (docs)
- `actions/upload-artifact@v4` (docs validation)
- `dorny/paths-filter@v3` - Change detection
- SHA-pinned `changesets/action` v2 - version PR automation with Changesets CLI v3
- `actions/download-artifact` v4 - exact artifact download; GitHub CLI creates post-publication tags and releases

<!-- MANUAL: -->
