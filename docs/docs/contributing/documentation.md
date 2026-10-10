# Contributing to Documentation

The documentation site uses Rspress. Source pages are in `docs/docs/`; the configuration is `docs/rspress.config.ts`.

## Run the site

From the repository root:

```bash
cd docs
yarn install --immutable
yarn dev
```

Open the URL printed by Rspress, including the `/react-native-nitro-device-info/` base path.

From the same directory, build and preview the production site:

```bash
yarn build
yarn preview
```

Build output is `doc_build/` inside this directory.

## Choose the right page

| Content | Location | Purpose |
| --- | --- | --- |
| Installation and configuration | `guide/getting-started.md`, `guide/expo-setup.md` | Requirements, commands, and verification |
| First working example | `guide/quick-start.md` | A short path from installation to use |
| Reactive usage | `guide/react-hooks.md` | Polling intervals, initial values, and component patterns |
| Exact API contracts | `api/` | Signatures, units, platform behavior, and errors |
| Migration | `api/migration.md` | Entry points, mappings, and compatibility exceptions |
| Task-specific code | `examples/` | Examples that build on the guides |

These paths are relative to `docs/docs/`. Static assets belong in `docs/docs/public/`.

## Write examples readers can use

- Identify the import path. Root APIs and `/compat` APIs have different names and return types.
- Use `tsx` for code containing JSX.
- Include imports in standalone examples. Label fragments that depend on earlier code.
- Explain unavailable values, units, platform restrictions, and Promise rejection.
- Keep required setup before the code that needs it.
- Label intentional type errors. Do not present nonexistent members as autocomplete examples.
- State measured performance with the test conditions. A synchronous return type is not a timing guarantee.

Use the exported TypeScript types. The signature source is [`DeviceInfo.nitro.ts`](https://github.com/l2hyunwoo/react-native-nitro-device-info/blob/main/packages/react-native-nitro-device-info/src/DeviceInfo.nitro.ts); Swift, Kotlin, and web implementations determine platform behavior.

## Maintain availability badges

Add introduction and platform badges to every new API section or grouped property row. Use the existing `rp-badge` spans from the Rspress theme. Keep the text inside each span so Markdown exports and MCP searches retain it.

Check the [badge definitions and version evidence](/api/#availability-badges). Confirm a published npm version and its source before replacing `Unreleased` with `Since v…`. A manifest version or declaration alone does not prove a released platform implementation.

When a platform replaces a constant fallback with a real implementation, update its badge and explain the first functional release. Preserve the original API introduction version. Check the Swift, Kotlin, and web implementations separately.

## Add or change a page

1. Create or edit a Markdown file under the appropriate content directory.
2. Add new pages to both `themeConfig.nav` and `themeConfig.sidebar` in `docs/rspress.config.ts`.
3. Use content-root links such as `/guide/quick-start`, or relative Markdown links. Do not repeat the deployment base in internal links.
4. Preserve existing routes and heading anchors when possible.
5. Update related examples and both READMEs if the change affects them.
6. Build and preview the site. Check changed links and search results.

English is the source language. Keep a Korean counterpart for every page under `docs/docs/ko/`, and update both locale menus when adding a page. Record `translationOf` and `sourceCommit` in Korean frontmatter. Preserve API names, commands, types, numbers, units, return values, permissions, requirements, exceptions, and explicit heading IDs. The language selector changes the path without checking for a translation; missing counterparts cause 404s. See [Korean translation maintenance](https://github.com/l2hyunwoo/react-native-nitro-device-info/blob/main/docs/I18N_PLAN.ko.md).

## AI-readable documentation

Rspress generates page Markdown, `llms.txt`, and `llms-full.txt` during the site build.

The MCP server bundles a separate documentation snapshot during its build. Website deployment alone does not refresh a published MCP package. Rebuild and test that package when updating its documentation corpus.

Keep API names, import paths, platform fallbacks, and compatibility caveats explicit in each relevant section. Search results may contain a single section without the rest of the page.

## Deployment

Pull requests that change `docs/**` run the documentation validation workflow. It builds the site and uploads an artifact for review.

Changes merged to `main` trigger the deployment workflow. If publication fails, check the [Actions logs](https://github.com/l2hyunwoo/react-native-nitro-device-info/actions) and GitHub Pages settings.
