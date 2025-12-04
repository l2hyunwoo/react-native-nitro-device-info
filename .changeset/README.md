# Changesets

This repository uses [Changesets](https://github.com/changesets/changesets) for version management and changelog generation.

## For Contributors

### When to Create a Changeset

Create a changeset when your PR includes:
- New features
- Bug fixes
- Breaking changes
- Documentation updates that warrant a version bump

**Do NOT create a changeset for:**
- Internal refactoring that doesn't affect users
- Test-only changes
- CI/tooling changes
- Example app changes

### Creating a Changeset

1. Make your code changes
2. Run the changeset command:

```bash
yarn changeset
```

3. Follow the interactive prompts:
   - Select which packages are affected (use spacebar to select)
   - Choose the bump type for each package (major/minor/patch)
   - Write a description of the change (this appears in the changelog)

4. A new file is created in `.changeset/` - commit it with your PR

### Package Selection Guide

| Package | When to Select |
|---------|---------------|
| `react-native-nitro-device-info` | Changes to main library (`src/`, `ios/`, `android/`) |
| `@react-native-nitro-device-info/mcp-server` | Changes to `packages/mcp-server/` |

### Version Bump Guidelines

- **Patch (0.0.X)**: Bug fixes, performance improvements, documentation updates
- **Minor (0.X.0)**: New features (backward compatible), new optional parameters
- **Major (X.0.0)**: Breaking API changes, removed features

## For Maintainers

The release process is automated via GitHub Actions. When changesets exist on `main`:
1. A "Version Packages" PR is automatically created/updated
2. Merging that PR publishes packages to npm and updates changelogs
