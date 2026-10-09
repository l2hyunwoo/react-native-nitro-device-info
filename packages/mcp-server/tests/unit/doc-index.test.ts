import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { buildIndex } from '../../src/indexer';
import { getDocsPaths, parseMarkdownContent } from '../../src/indexer/doc-parser';
import { buildSearchIndex, search } from '../../src/indexer/search';
import { SAMPLE_DEVICE_INFO_CONTENT } from '../fixtures/sample-device-info';

describe('documentation corpus', () => {
  it('keeps heading-like lines inside fenced examples in their original chunk', () => {
    const content = '# Install\n\n````bash\n# npm\n```\nnpm install example\n````\n\n## Next\n\nRead the guide.';
    const chunks = parseMarkdownContent(content, 'guide.md');
    expect(chunks.map(chunk => chunk.title)).toEqual(['Install', 'Next']);
    expect(chunks[0].content).toContain('# npm');
    expect(chunks[0].content).toContain('npm install example');
  });

  it('gives same-named pages distinct IDs and retains Korean search terms', () => {
    const chunks = [
      ...parseMarkdownContent('# Overview\n\nDevice overview.', 'api/index.md'),
      ...parseMarkdownContent('# 개요\n\n배터리 정보를 확인하세요.', 'ko/api/index.md'),
    ];
    expect(new Set(chunks.map(chunk => chunk.id)).size).toBe(chunks.length);
    const results = search(buildSearchIndex([], chunks), '배터리');
    expect(results).toHaveLength(1);
    expect(results[0].item).toMatchObject({ source: 'ko/api/index.md' });
  });

  it('reads a standalone package corpus without a sibling repository', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nitro-mcp-corpus-'));
    try {
      const docs = path.join(root, 'data', 'docs');
      fs.mkdirSync(path.join(docs, 'api'), { recursive: true });
      fs.mkdirSync(path.join(root, 'dist'));
      fs.writeFileSync(path.join(root, 'data', 'DeviceInfo.nitro.ts'), SAMPLE_DEVICE_INFO_CONTENT);
      fs.writeFileSync(path.join(root, 'data', 'DeviceIntegrity.nitro.ts'), SAMPLE_DEVICE_INFO_CONTENT.replace('interface DeviceInfo', 'interface DeviceIntegrity'));
      fs.writeFileSync(path.join(root, 'data', 'README.md'), '# Library\n\nLibrary installation.');
      fs.writeFileSync(path.join(docs, 'index.md'), '# Overview\n\nDevice information.');
      fs.writeFileSync(path.join(docs, 'api', 'index.md'), '# API\n\nBattery information.');

      const packageRoot = path.join(root, 'dist');
      expect(getDocsPaths(packageRoot)).toEqual([docs]);
      const index = buildIndex(packageRoot, { includePlatformLimitations: false });
      expect(index.apis.has('deviceId')).toBe(true);
      expect(index.chunks).toHaveLength(3);
      expect(new Set(index.chunks.map(chunk => chunk.id)).size).toBe(3);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
