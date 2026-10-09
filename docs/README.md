# Documentation Development

[English](README.md) | [한국어](README-ko.md)

The site uses `@rspress/core` 2.x. `docs/yarn.lock` pins the version used by CI.

## Run locally

From the repository root:

```bash
cd docs
yarn install --immutable
yarn dev
```

Use the URL printed by Rspress. The site base path is `/react-native-nitro-device-info/`.

```bash
# From docs/
yarn build
yarn preview
```

Production output is `docs/doc_build/`, relative to the repository root. Do not edit build output or remove the lockfile to resolve build errors.

## Source layout

```text
docs/
├── rspress.config.ts         # Site settings, navigation, sidebar, llms output
├── package.json
├── yarn.lock                 # Docs have their own dependency installation
└── docs/                     # Content root
    ├── index.md              # Homepage
    ├── guide/
    ├── api/
    ├── examples/
    ├── contributing/
    ├── ko/                   # Korean counterparts, with the same page paths
    └── public/               # Shared static assets
```

English pages keep their existing URLs. Korean pages use `/ko/` and the built-in language selector. See [Korean translation maintenance](I18N_PLAN.ko.md) for metadata and review requirements.

## Edit and verify

1. Edit the English Markdown page in `docs/docs/` and its Korean counterpart in `docs/docs/ko/`.
2. For a new page, update navigation and sidebar for both locales in `rspress.config.ts`.
3. Match API examples against the source interface and platform implementations. Update the English and Korean READMEs when relevant.
4. Run `yarn build`, then `yarn preview`.
5. Check changed routes, heading links, both directions of language switching, search results, and examples.

The website follows `main`; installed releases can differ. Keep property access, synchronous methods, Promise methods, and `/compat` imports distinct. Do not maintain a second copy of the full TypeScript interface in Markdown.

`llms: true` enables Rspress's built-in page Markdown, `llms.txt`, and `llms-full.txt` output. Verify the English files under `doc_build/` and Korean files under `doc_build/ko/` after building.

## MCP corpus

The MCP package bundles the API specs, site Markdown, and root README at build time. After changing source documentation, rebuild it from the repository root:

```bash
yarn workspace @react-native-nitro-device-info/mcp-server build
yarn workspace @react-native-nitro-device-info/mcp-server test --runInBand
```

Its documentation is a release snapshot, not a live fetch from this website. A documentation deployment does not update an already published MCP package.

## Deployment

The workflows are `.github/workflows/docs-validation.yml` and `.github/workflows/docs-deploy.yml`. They install with `yarn install --immutable`, build the site, and use `docs/doc_build/`.

Merging documentation changes to `main` triggers deployment. For a failed deployment, inspect the GitHub Actions logs before changing dependencies or rebuilding locally.
