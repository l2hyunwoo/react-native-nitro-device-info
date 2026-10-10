# Changesets

Run `yarn changeset` for changes to a published package. Select only affected packages and describe the user-visible change.

The three public packages use independent versions. Examples and the private root are excluded from releases.
MCP embeds both libraries' `.nitro.ts` specifications, `docs/docs/`, and the English root README at build time. Include an MCP changeset when those packaged contents change.

See [contribution guidelines](../CONTRIBUTING.md#publishing-to-npm) for package selection and the [maintainer release guide](../.github/RELEASING.md) for publication. [한국어 기여 안내](../CONTRIBUTING-ko.md#npm-배포)와 [릴리스 안내](../.github/RELEASING-ko.md)도 제공합니다.
