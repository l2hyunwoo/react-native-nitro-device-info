# Releasing packages

[English](RELEASING.md) | [한국어](RELEASING-ko.md)

This guide is for maintainers publishing the three public packages. For changeset authoring, see [CONTRIBUTING](../CONTRIBUTING.md#publishing-to-npm).

## Configure publication

- Allow GitHub Actions to create pull requests in repository settings. The [Release workflow](workflows/release.yml) uses Changesets to manage a version PR.
- Configure the `npm` GitHub environment and any required reviewers.
- For each existing npm package, configure a [trusted publisher](https://docs.npmjs.com/trusted-publishers/) with owner `l2hyunwoo`, repository `react-native-nitro-device-info`, workflow `release.yml`, and environment `npm`. Allow direct `npm publish`, which this workflow uses. Activate the publisher within npm's configuration expiry period.
- Use a GitHub-hosted runner with Node 22.14+ and npm 11.5.1+. The publish job has `id-token: write`; it uses OIDC without a long-lived `NPM_TOKEN`.
- A package that has never been published needs the [first-publication procedure](#first-integrity-publication) before configuring its publisher.

## Release sequence

1. Merge changes with changesets for the affected packages. A push to `main` opens or updates **chore(release): version packages**. Push events do not publish.
2. Review the version PR's package versions, changelogs, lockfile, and validation results, then merge it.
3. Dispatch **Release** on `main` with `publish: false`, the default. Review full CI results, the registry plan, and the checked tarball artifacts for the selected commit.
4. When publication is authorized, dispatch **Release** on the same commit with `publish: true`. This run builds and checks its own archives. Approve the `npm` environment if required, after reviewing that run's validation and artifacts.
5. Check npm versions and the package-specific tags and GitHub Releases.

After full CI, release preparation builds and packs packages whose exact versions are not yet on npm. It packs the actual workspaces with lifecycle scripts disabled, validates metadata, entry points, native bindings, Expo plugins, and bundled MCP data, then uploads archives with SHA-512 hashes. The publish job validates the downloaded files again and publishes those exact archives with npm provenance.

Publication requires `main`, no pending changesets, and an artifact from a clean checkout. Tags and GitHub Releases are created after npm confirms the matching archive. Tags use `<package-name>@<version>`, including the scoped MCP name. Existing historical tags remain valid. Release concurrency never cancels a run already in progress.

## Recover a partial release

Use **Re-run failed jobs** on the original workflow run. This retains the original commit and archives. Recovery checks the registry archive hash before creating a missing tag or GitHub Release; it does not republish an existing exact version.

Do not dispatch a new workflow to recover release metadata for an already published version. New release plans skip published exact versions. Registry lookup failures stop the run.

## First integrity publication

The initial integrity release uses the manifest's `0.1.0` baseline. Fixes before its first publication do not need another bump. After publication, it follows the same changeset policy as the other packages.

Before authorizing this release, confirm attestation on supported physical devices and token verification on your backend. Builds, platform doubles, and simulator tests do not establish these results.

1. Complete the version PR and release validation above. Once publication is authorized, dispatch **Release** with `publish: true` on `main` and retain that run's checked integrity archive. Its publish job cannot publish integrity until the package has a trusted publisher.
2. An authenticated npm maintainer publishes the reviewed integrity archive once:

   ```sh
   npm publish <checked-integrity-tarball.tgz> --access public --ignore-scripts
   ```

3. Configure the package's trusted publisher.
4. Re-run the original publish job to check the registry archive hash and complete release metadata.

Do not use the monorepo-wide `changeset pre enter` command for an integrity-only beta release.

## Validate locally without publication

Install workspace dependencies and use Node 22.14+ with npm 11.5.1+. From the repository root:

```sh
yarn release:prepare
yarn release:verify
```

These commands read the public registry and write archives under ignored `.release/`. They do not publish, create tags, or create GitHub Releases. Uncommitted changes produce a draft artifact that cannot be published. `release:publish` is restricted to the manual Actions publish job.
