## 코드 작성 규칙

### Comments
- Comments should be written in English as much as possible.
- Avoid adding unnecessary comments, only use KDoc format.

### Kotlin
- `companion object`를 추가할 시 클래스 최하단 영역에 추가한다.
- `try-catch` 문은 최대한 지양하고 `runCatching` 문을 사용하자.
- Closable 리소스는 `use` 확장함수를 사용해보자.

### Git Commit
- Git commit 시에는 message의 body는 비운채로 커밋해야한다.

## 기능 구현 체크리스트 (Feature Implementation Checklist)

- 모든 기능 구현 Spec에 대해 다음 문서들의 최신화 작업을 포함해야 합니다:
  - `@docs/**` (API 문서, 가이드 등)
  - `@README.md`
  - 한국어 문서 (`README-ko.md` 등)
- 기능 구현 작업 시 `@example/showcase/**` 앱에도 해당 기능을 시연할 수 있도록 업데이트해야 합니다.

---

<!-- Generated: 2026-02-13 -->

# React Native Nitro Device Info - Monorepo Guide

## Purpose

Monorepo for `react-native-nitro-device-info` (v1.5.1), a high-performance React Native library providing 80+ device information properties through Nitro's zero-overhead JSI bindings. Implements native code in Swift (iOS) and Kotlin (Android).

## Key Files

| File | Description |
|------|-------------|
| `package.json` | Monorepo root with workspace definitions and shared scripts |
| `turbo.json` | Turborepo configuration for build caching and task orchestration |
| `.nvmrc` | Node.js version (22) |
| `.yarnrc.yml` | Yarn 3.6.1 configuration (`nodeLinker: node-modules`, not PnP) |
| `tsconfig.json` | Root TypeScript configuration |
| `README.md` | Main project documentation |
| `CONTRIBUTING.md` | Development workflow and guidelines |
| `CLAUDE.md` | Project-specific AI assistant instructions |
| `API-REFERENCE.md` | Complete API documentation for all 100+ methods |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `packages/react-native-nitro-device-info/` | Main library (see `packages/react-native-nitro-device-info/AGENTS.md`) |
| `packages/mcp-server/` | MCP server for AI tools (see `packages/mcp-server/AGENTS.md`) |
| `example/showcase/` | Demo app displaying all properties (see `example/showcase/AGENTS.md`) |
| `example/benchmark/` | Performance benchmark app (see `example/benchmark/AGENTS.md`) |
| `docs/` | Rspress documentation site (see `docs/AGENTS.md`) |
| `.github/` | CI/CD workflows (see `.github/AGENTS.md`) |

## For AI Agents

### Agent Safety & Tooling Pitfalls (read first)

These are non-obvious traps that have bitten automated runs. Follow them before touching the repo.

**Package manager — Yarn 3.6.1 (Berry), `nodeLinker: node-modules`.** Not PnP. Deps are hoisted into `node_modules`, but `ts-jest` (mcp-server) and `react-native-harness` (showcase/integrity-demo) live in their *workspace* `node_modules`, not the root. Lockfile-only refresh: `yarn install --mode update-lockfile`.

**Worktree isolation when the main checkout is dirty.** If the working tree has unrelated in-progress work (e.g. a feature branch with uncommitted changes), do NOT stash-juggle it to do an independent task. Cut a worktree off the base branch instead so the dirty checkout is never disturbed:
```bash
git worktree add ../<repo>-wt-<topic> <base-branch>   # e.g. main
# worktrees have NO node_modules — run `yarn install` inside if you need to lint/test/build there
git -C ../<repo>-wt-<topic> ... ; git push
git worktree remove ../<repo>-wt-<topic>              # clean up when done
```
A fresh worktree needs its own `yarn install` (node-modules linker) before `yarn lint`/`test`/`typecheck` run there.

**Linting: `yarn lint` (oxlint) is the gate — `yarn lint:eslint` is pre-existing broken.** The real lint script is `oxlint .`. The auxiliary `yarn lint:eslint` uses `@react-native` eslint config (a Babel parser) which throws `No Babel config file detected` on every root-level `.js` file because there is **no root `babel.config.js`** (each workspace has its own). It already fails with thousands of errors on `main` — a new root-level `.js` file (e.g. a config) adds more of the same parse errors but does NOT indicate a real defect. Validate with `yarn lint` (oxlint), not `lint:eslint`. CodeRabbit's "ESLint install failed" warning stems from the same root-eslint fragility and is not a blocker.

**Commit hooks fail headless.** lefthook `commit-msg` runs commitlint which needs a TTY; in a non-interactive shell it errors. Validate the message with `echo "msg" | yarn commitlint`, then commit with `git commit --no-verify`.

**Commits & pushes.** Subject-only messages, empty body unless explicitly asked (enforced by commitlint config-conventional). No AI-authorship trailers (`Co-Authored-By`, `🤖`, etc.). Split changes into feature-sized commits. **Never `git push` or open a PR unless explicitly asked.** Big changes go on a feature branch → PR, never committed straight to `main`.

### Working In This Directory

**Architecture Overview**:
1. This is a **Nitro Module** - uses JSI for zero-overhead native communication
2. API surface defined in `packages/react-native-nitro-device-info/src/DeviceInfo.nitro.ts`
3. Native: `ios/DeviceInfo.swift` (iOS) and `android/.../DeviceInfo.kt` (Android)
4. **Nitrogen codegen**: Always run `yarn nitrogen` after modifying `.nitro.ts` files

**Development Workflow**:
1. Modify API in `DeviceInfo.nitro.ts`
2. Run `yarn nitrogen` (generates C++/Java/Swift boilerplate)
3. Implement native code in Swift (iOS) and Kotlin (Android)
4. Run `yarn prepare` to build library
5. Test in showcase/benchmark apps
6. Update docs (`API-REFERENCE.md`, `docs/`, `README.md`, showcase app)
7. Verify: `yarn typecheck`, `yarn lint`, `yarn test`

**File Rules**:
- **Never** edit files in `nitrogen/generated/` or `lib/` (auto-generated)

### Testing Requirements

1. `yarn typecheck` - TypeScript validation
2. `yarn lint` - oxlint validation
3. `yarn test` - Jest unit tests
4. Test in both showcase and benchmark apps
5. Verify on both iOS and Android if native code changed

### Common Patterns

**Adding a New Property**:
```typescript
// 1. DeviceInfo.nitro.ts
readonly newProperty: string

// 2. yarn nitrogen

// 3. iOS (DeviceInfo.swift)
public var newProperty: String { return "value" }

// 4. Android (DeviceInfo.kt)
override val newProperty: String get() = "value"
```

**Adding an Async Method**:
```typescript
// 1. DeviceInfo.nitro.ts
getNewInfo(): Promise<string>

// 2. yarn nitrogen

// 3. iOS
public func getNewInfo() -> Promise<String> {
  return Promise.async { return "value" }
}

// 4. Android
override fun getNewInfo(): Promise<String> = Promise.async { "value" }
```

### Dependencies

**Runtime**: `react-native-nitro-modules >=0.35.0 <1.0.0` (peer dependency)

**Development**: `yarn@3.6.1`, `node@22`, `typescript@5.9.3`, `nitrogen@0.35.9`, `turbo@2.9.18`, `oxlint@1.57.0`, `jest@29.7.0`, `commitlint@21.0.2`

**Native**: iOS Swift 5.9+ (UIKit, Foundation, Combine), Android Kotlin 1.9+ (kotlinx-coroutines 1.7.3)

### Common Commands

```bash
yarn                  # Install dependencies
yarn nitrogen         # Generate native bindings
yarn prepare          # Build library
yarn typecheck        # TypeScript validation
yarn lint             # Linting
yarn test             # Jest tests
yarn showcase ios     # Run showcase on iOS
yarn showcase android # Run showcase on Android
yarn benchmark ios    # Run benchmark on iOS
yarn clean            # Clean build artifacts
```

### Important Notes

1. **Nitro Codegen**: After any `.nitro.ts` change, run `yarn nitrogen` or build fails
2. **Documentation is Mandatory**: All features must update API-REFERENCE.md, docs/, README.md, and showcase app
3. **Platform Support**: iOS 13.4+, Android API 24+
4. **Commit Conventions**: Conventional commits with empty body (enforced by commitlint)

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
