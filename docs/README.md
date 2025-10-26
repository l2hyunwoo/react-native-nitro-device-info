# Documentation Development

This directory contains the RSPress documentation site for react-native-nitro-device-info.

## Quick Start

### Prerequisites

- Node.js 20 or higher
- Yarn package manager

### Installation

```bash
# Install dependencies
yarn install
```

### Development

```bash
# Start development server (with hot reload)
yarn dev
```

The site will be available at http://localhost:5173/

### Build

```bash
# Build for production
yarn build
```

Build output will be in `.rspress/dist/`

### Preview

```bash
# Preview production build locally
yarn preview
```

## Project Structure

```
docs/
├── index.md                    # Homepage
├── guide/                      # Guide sections
│   ├── introduction.md
│   ├── why-nitro-module.md
│   ├── getting-started.md
│   └── quick-start.md
├── api/                        # API Reference
│   ├── index.md
│   ├── device-info.md
│   ├── types.md
│   └── migration.md
├── examples/                   # Usage examples
│   ├── basic-usage.md
│   └── advanced-usage.md
├── contributing/               # Contributing guides
│   └── documentation.md
├── i18n/ko/                    # Korean translations
│   └── [mirrors structure above]
├── .rspress/
│   └── config.ts               # Site configuration
├── public/                     # Static assets
└── package.json
```

## Writing Documentation

### Creating a New Page

1. Create a markdown file in the appropriate directory
2. Add frontmatter with title and description
3. Write content using markdown
4. Update navigation in `.rspress/config.ts` if needed

### Adding Code Examples

Use fenced code blocks with language tags:

````markdown
```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

const deviceId = DeviceInfoModule.deviceId;
console.log(deviceId); // "iPhone14,2"
```
````

### Adding Images

Place images in `public/` directory and reference them:

```markdown
![Description](/image-name.png)
```

## Troubleshooting

### Port Already in Use

If port 5173 is already in use:

```bash
# Kill the process
lsof -ti:5173 | xargs kill -9

# Or use a different port
yarn dev --port 5174
```

### Build Fails

1. Delete node_modules and reinstall:
   ```bash
   rm -rf node_modules yarn.lock
   yarn install
   ```

2. Clear RSPress cache:
   ```bash
   rm -rf .rspress/dist .rspress/.cache
   yarn build
   ```

## Deployment

Documentation is automatically deployed to GitHub Pages when changes are merged to the main branch.

### Automated Workflows

Two GitHub Actions workflows handle documentation deployment:

1. **PR Validation** (`.github/workflows/docs-validation.yml`)
   - Triggers on PRs that modify `docs/**`
   - Builds documentation to verify no errors
   - Uploads build artifacts for review

2. **Production Deploy** (`.github/workflows/docs-deploy.yml`)
   - Triggers on push to `main` branch with `docs/**` changes
   - Builds documentation
   - Deploys to GitHub Pages at: https://l2hyunwoo.github.io/react-native-nitro-device-info/

### Manual Deployment

To manually trigger a deployment, push changes to the main branch:

```bash
git push origin main
```

For detailed deployment documentation, see [Contributing > Documentation](docs/contributing/documentation.md).
