# Documentation

This guide covers how to contribute to the `react-native-nitro-device-info` documentation.

## Local Development

### Prerequisites

- Node.js 20 or higher
- Yarn package manager

### Running Locally

1. Navigate to the docs directory:

```bash
cd docs
```

2. Install dependencies:

```bash
yarn install
```

3. Start the development server:

```bash
yarn dev
```

The documentation site will be available at `http://localhost:5173`.

### Building for Production

To build the documentation for production:

```bash
cd docs
yarn build
```

The built files will be output to `docs/doc_build`.

## Documentation Structure

```
docs/
├── docs/
│   ├── index.md              # Homepage
│   ├── guide/                # Getting started guides
│   │   ├── introduction.md
│   │   ├── why-nitro-module.md
│   │   ├── getting-started.md
│   │   └── quick-start.md
│   ├── api/                  # API documentation
│   │   ├── index.md
│   │   ├── device-info.md
│   │   ├── types.md
│   │   └── migration.md
│   └── examples/             # Usage examples
│       ├── basic-usage.md
│       └── advanced-usage.md
├── .rspress/
│   └── config.ts             # RSPress configuration
└── public/                   # Static assets
```

## Writing Documentation

### Markdown Guidelines

- Use GitHub-flavored Markdown
- Include code examples with proper syntax highlighting
- Add TypeScript types for API examples
- Use backticks around `library-name` in prose
- Link to related pages using relative paths

### Code Examples

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

// Add clear comments explaining the code
const deviceId = DeviceInfoModule.deviceId;
console.log('Device ID:', deviceId);
```

### Adding New Pages

1. Create a new `.md` file in the appropriate directory
2. Update `.rspress/config.ts` to add the page to navigation:

```typescript
{
  text: 'New Section',
  items: [
    { text: 'Page Title', link: '/section/page' },
  ],
}
```

## Deployment

Documentation is automatically deployed to GitHub Pages when changes are merged to the `main` branch.

### Automated Workflows

#### Pull Request Validation

When you open a PR with documentation changes, the `docs-validation.yml` workflow will:

1. Install dependencies
2. Build the documentation
3. Upload build artifacts for review

This ensures all documentation builds successfully before merging.

#### Production Deployment

When changes are merged to `main`, the `docs-deploy.yml` workflow will:

1. Build the documentation
2. Deploy to GitHub Pages
3. Make the site available at: `https://l2hyunwoo.github.io/react-native-nitro-device-info/`

### Manual Deployment

If needed, you can manually trigger a deployment by pushing to the `main` branch:

```bash
git push origin main
```

## Configuration

### RSPress Config

The main configuration is in `.rspress/config.ts`:

```typescript
export default defineConfig({
  root: 'docs',
  title: 'React Native Nitro Device Info',
  base: '/react-native-nitro-device-info/',
  // ... other settings
});
```

Key configuration options:

- `base`: The base path for GitHub Pages deployment
- `themeConfig.nav`: Top navigation bar items
- `themeConfig.sidebar`: Sidebar navigation structure
- `locales`: Internationalization settings (English and Korean)

## Troubleshooting

### Build Fails Locally

If the build fails:

1. Clear the cache:
```bash
rm -rf node_modules docs/doc_build
yarn install
```

2. Check for syntax errors in Markdown files
3. Ensure all internal links are valid

### Changes Not Appearing

- Clear your browser cache
- Check that the dev server restarted after file changes
- Verify the file is in the correct directory structure

### GitHub Pages Not Updating

1. Check the Actions tab in GitHub for workflow status
2. Verify GitHub Pages is enabled in repository settings
3. Ensure the workflow has proper permissions (configured in `docs-deploy.yml`)

## Best Practices

1. **Keep it concise**: Users prefer shorter, focused documentation
2. **Show, don't tell**: Use code examples liberally
3. **Update related pages**: If you change an API, update all relevant docs
4. **Test locally**: Always build and preview before submitting a PR
5. **Check links**: Ensure all internal and external links work
6. **Mobile-friendly**: RSPress is responsive, but test on different screen sizes

## Getting Help

If you need help with documentation:

- Check the [RSPress documentation](https://rspress.dev/)
- Open an issue on GitHub
- Ask in pull request comments
