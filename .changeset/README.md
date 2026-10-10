# Changesets

Run `yarn changeset` for changes to a published package. Select only affected packages and describe the user-visible change.

The three public packages use independent versions. Examples and the private root are excluded from releases.
MCP embeds the core specifications, `docs/docs/`, and root README at build time. Include an MCP changeset when those packaged contents change.

The initial integrity release keeps its existing `0.1.0` baseline. Fixes before that first publication are included without another version bump.
After publication, integrity follows the same changeset policy as the other packages.

See [the release procedure](../CONTRIBUTING.md#publishing-to-npm) and [한국어 배포 절차](../CONTRIBUTING-ko.md#npm-배포).
