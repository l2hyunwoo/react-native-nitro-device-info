# Contributing

[English](CONTRIBUTING.md) | [한국어](CONTRIBUTING-ko.md)

Contributions are always welcome, no matter how large or small!

We want this community to be friendly and respectful to each other. Please follow it in all your interactions with the project. Before contributing, please read the [code of conduct](./CODE_OF_CONDUCT.md).

## Development workflow

This project is a monorepo managed using [Yarn workspaces](https://yarnpkg.com/features/workspaces). It contains the following packages:

- Core library, optional attestation library, and MCP server in `packages/`.
- Showcase, benchmark, and integrity demo apps in `example/`.
- The documentation site in `docs/`, with its own dependency installation.

To get started with the project, make sure you have the correct version of [Node.js](https://nodejs.org/) installed. See the [`.nvmrc`](./.nvmrc) file for the version used in this project.

Run `yarn` in the root directory to install the required dependencies for each package:

```sh
yarn
```

> Since the project relies on Yarn workspaces, you cannot use [`npm`](https://github.com/npm/cli) for development without manually migrating.

This project uses Nitro Modules. If you're not familiar with how Nitro works, make sure to check the [Nitro Modules Docs](https://nitro.margelo.com/).

You need to run [Nitrogen](https://nitro.margelo.com/docs/nitrogen) to generate the boilerplate code required for this project. The example app will not build without this step.

Run **Nitrogen** in following cases:

- When you make changes to any `*.nitro.ts` files.
- When running the project for the first time (since the generated files are not committed to the repository).

To invoke **Nitrogen**, use the following command:

```sh
yarn nitrogen
```

For integrity bindings, use `yarn nitrogen:integrity`.

The example apps ([showcase](example/showcase/README.md) and [benchmark](example/benchmark/README.md)) demonstrate usage of the library. You need to run one of them to test any changes you make.

For attestation changes, use the [Integrity Demo](example/integrity-demo/README.md).

Both apps are configured to use the local version of the library, so any changes you make to the library's source code will be reflected in the example apps. Changes to the library's JavaScript code will be reflected in the example apps without a rebuild, but native code changes will require a rebuild.

If you want to use Android Studio or Xcode to edit the native code:

- **iOS**: Open `example/showcase/ios/NitroDeviceInfoExample.xcworkspace` or `example/benchmark/ios/NitroDeviceInfoBenchmark.xcworkspace` in Xcode
  - Find library source files at `Pods > Development Pods > react-native-nitro-device-info`
- **Android**: Open `example/showcase/android` or `example/benchmark/android` in Android Studio
  - Find library source files at `react-native-nitro-device-info` under `Android`

You can use various commands from the root directory to work with the project.

### Running the Showcase App

To start the Metro bundler and run the showcase app:

```sh
# Start Metro bundler
yarn showcase start

# Run on Android
yarn showcase android

# Run on iOS
yarn showcase ios
```

### Running the Benchmark App

To start the Metro bundler and run the benchmark app:

```sh
# Start Metro bundler
yarn benchmark start

# Run on Android
yarn benchmark android

# Run on iOS
yarn benchmark ios
```

To confirm that the apps are running with the new architecture, you can check the Metro logs for a message like this:

```sh
Running "NitroDeviceInfoShowcase" with {"fabric":true,"initialProps":{"concurrentRoot":true},"rootTag":1}
```

Note the `"fabric":true` and `"concurrentRoot":true` properties.

Make sure your code passes TypeScript and oxlint. Run the following to verify:

```sh
yarn typecheck
yarn lint
```

To apply supported lint fixes, run the following:

```sh
yarn lint --fix
```

Remember to add tests for your change if possible. Run the unit tests by:

```sh
yarn test
```

CI runs the core library Jest suite for library, dependency, and CI/Jest configuration changes. Run it alone with `yarn workspace react-native-nitro-device-info test --runInBand`. Root `yarn test` also runs the MCP server suite; device harness suites require their own runner.

After `yarn prepare`, run `npm pack` in `packages/react-native-nitro-device-info`, then run `yarn test:web` from the repository root. This checks hooks, compat, browser/source conditions, and SSR fallbacks against the packed artifact using the showcase toolchain's installed esbuild. CI runs it in Validate NPM Package.

Integrity package or demo changes run lint, `yarn workspace react-native-nitro-device-integrity typecheck`, and `yarn workspace react-native-nitro-device-integrity prepare`, followed by iOS and Android demo builds. Root `yarn prepare` builds only the core library. Dependency and CI workflow changes run both libraries' checks. Validate workflow syntax with `actionlint .github/workflows/ci.yml` and check that path filters cover the affected packages and configuration.

### Integrity tests

After installing workspace dependencies, build the integrity package from the repository root:

```sh
yarn workspace react-native-nitro-device-integrity prepare
```

Run the suites for the platforms available on your machine:

| Command | Coverage | Requirements |
| --- | --- | --- |
| `yarn test:integrity` | Android runtime dependency, Expo plugin idempotence, demo SHA-256 vectors | Workspace dependencies |
| `yarn test:integrity:android` | Provider refresh races, retry limits, invalid project numbers | JDK 17 and the demo's Android SDK setup |
| `yarn test:integrity:ios` | Base64 decoding and 32-byte hash validation | macOS and Xcode's `swiftc` with Foundation |

Android tests live in `android/src/test` and run with JUnit and Google SDK mocks through the demo's Gradle project. Gradle supplies Kotlin. The iOS suite compiles production Swift with small platform doubles. CI runs each native suite in its platform job. These suites do not call Google or Apple servers.

For native-to-JavaScript rejection tests and device selection, follow the [Integrity Demo harness instructions](example/integrity-demo/README.md#device-tests).

### Commit message convention

We follow the [conventional commits specification](https://www.conventionalcommits.org/en) for our commit messages:

- `fix`: bug fixes, e.g. fix crash due to deprecated method.
- `feat`: new features, e.g. add new method to the module.
- `refactor`: code refactor, e.g. migrate from class components to hooks.
- `docs`: changes into documentation, e.g. add usage example for the module.
- `test`: adding or updating tests, e.g. add integration tests using detox.
- `chore`: tooling changes, e.g. change CI config.

Our pre-commit hooks verify that your commit message matches this format when committing.

### Linting and tests

[ESLint](https://eslint.org/), [Prettier](https://prettier.io/), [TypeScript](https://www.typescriptlang.org/)

We use TypeScript for type checking, oxlint for the lint gate, Prettier for formatting, and Jest for unit tests. `yarn lint:eslint` is an auxiliary command; see `AGENTS.md` for its known configuration limitations.

The pre-commit hook lints staged JavaScript and TypeScript files. The commit-msg hook checks the commit subject. Run the relevant tests separately before submitting a change.

### Publishing to npm

The three public packages use independent versions through [Changesets](.changeset/config.json). Examples and the private root are excluded.

Run `yarn changeset` with a change to a published package. Select affected packages, choose the SemVer bump, and describe the user-visible change.

| Package | When to add a changeset |
| --- | --- |
| `react-native-nitro-device-info` | API, implementation, or packaged content changes |
| `react-native-nitro-device-integrity` | API, implementation, or packaged content changes after its first publication |
| `@react-native-nitro-device-info/mcp-server` | MCP code or embedded specifications/documentation changes |

MCP embeds both libraries' `.nitro.ts` specifications, `docs/docs/`, and the English root README during its build. Include an MCP changeset when these inputs change. This build dependency does not require a runtime dependency or matching versions.

The Release workflow creates a version PR on `main`. Maintainers review it and explicitly run publication. See the [maintainer release guide](.github/RELEASING.md) for setup, dry runs, first integrity publication, and recovery.

### Scripts

The `package.json` file contains various scripts for common tasks:

- `yarn`: setup project by installing dependencies.
- `yarn typecheck`: type-check files with TypeScript.
- `yarn lint`: lint files with oxlint (fast Rust-based linter).
- `yarn lint:eslint`: lint files with ESLint (alternative linter).
- `yarn test`: run unit tests with Jest.
- `yarn nitrogen`: generate native bindings from `.nitro.ts` files.
- `yarn prepare`: build the core library.
- `yarn workspace react-native-nitro-device-integrity prepare`: build the attestation library.
- `yarn test:integrity`: run integrity source regressions.
- `yarn test:integrity:android`: run Android JUnit regressions through Gradle.
- `yarn test:integrity:ios`: run Swift hash validation regressions.
- `yarn test:release`: test release logic and packed artifacts after all three package builds (npm 11.5.1+ required).
- `yarn changeset`: describe the affected packages and version bumps.
- `yarn version-packages`: apply pending changesets locally for review.
- `yarn release:prepare` / `yarn release:verify`: prepare and check local release archives without publishing.
- `yarn integrity-demo <command>`: run integrity demo commands (start/ios/android).
- `yarn showcase <command>`: run showcase app commands (start/ios/android).
- `yarn benchmark <command>`: run benchmark app commands (start/ios/android).

### Sending a pull request

> **Working on your first pull request?** You can learn how from this _free_ series: [How to Contribute to an Open Source Project on GitHub](https://app.egghead.io/playlists/how-to-contribute-to-an-open-source-project-on-github).

When you're sending a pull request:

- Prefer small pull requests focused on one change.
- Verify that linters and tests are passing.
- Review the documentation to make sure it looks good.
- Follow the pull request template when opening a pull request.
- For pull requests that change the API or implementation, discuss with maintainers first by opening an issue.

## Documentation and translations

English site pages in `docs/docs/` have Korean counterparts under `docs/docs/ko/`. Update both when behavior changes, preserving API names, units, permissions, and exceptions. Keep `translationOf`, `sourceCommit`, and explicit heading IDs current. For new pages, update both locale menus in `docs/rspress.config.ts`. See [documentation development](docs/README.md) and [Korean translation maintenance](docs/I18N_PLAN.ko.md).
