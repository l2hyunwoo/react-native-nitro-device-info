<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

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
| `.nvmrc` | Node.js version (20) |
| `.yarnrc.yml` | Yarn 3.6.1 configuration with PnP mode |
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
| `specs/` | Archived feature specifications (see `specs/AGENTS.md`) |
| `openspec/` | OpenSpec change management system (see `openspec/AGENTS.md`) |
| `.github/` | CI/CD workflows (see `.github/AGENTS.md`) |

## For AI Agents

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
- For significant changes, create an OpenSpec proposal first (`openspec/AGENTS.md`)

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

**Runtime**: `react-native-nitro-modules@0.31.2` (peer dependency)

**Development**: `yarn@3.6.1`, `node@20`, `typescript@5.9.2`, `nitrogen@0.31.2`, `turbo@2.6.2`, `oxlint@1.24.0`, `jest@30.0.0`, `commitlint@20.1.0`

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
5. **OpenSpec Proposals**: Required for new capabilities, breaking changes, architecture shifts

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
