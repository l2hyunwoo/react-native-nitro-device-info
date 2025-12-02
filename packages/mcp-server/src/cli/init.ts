/**
 * CLI init command - generates MCP configuration files
 *
 * Supports:
 * - .cursor/mcp.json for Cursor IDE
 * - .mcp.json for Claude Code (project-level)
 */

import * as fs from 'fs';
import * as path from 'path';

interface McpConfig {
  mcpServers: {
    [key: string]: {
      command: string;
      args: string[];
    };
  };
}

const MCP_SERVER_CONFIG = {
  command: 'npx',
  args: ['@react-native-nitro-device-info/mcp-server'],
};

const SERVER_NAME = 'nitro-device-info';

/**
 * Merge MCP server config into existing config
 */
function mergeConfig(existing: McpConfig | null): McpConfig {
  if (!existing) {
    return {
      mcpServers: {
        [SERVER_NAME]: MCP_SERVER_CONFIG,
      },
    };
  }

  return {
    ...existing,
    mcpServers: {
      ...existing.mcpServers,
      [SERVER_NAME]: MCP_SERVER_CONFIG,
    },
  };
}

/**
 * Read existing JSON config file
 */
function readJsonFile(filePath: string): McpConfig | null {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as McpConfig;
    }
  } catch {
    // File doesn't exist or invalid JSON
  }
  return null;
}

/**
 * Write JSON config file
 */
function writeJsonFile(filePath: string, config: McpConfig): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2) + '\n');
}

/**
 * Initialize Cursor MCP configuration
 */
function initCursor(projectRoot: string): { created: boolean; path: string } {
  const configPath = path.join(projectRoot, '.cursor', 'mcp.json');
  const existing = readJsonFile(configPath);
  const merged = mergeConfig(existing);

  // Check if already configured
  if (existing?.mcpServers?.[SERVER_NAME]) {
    return { created: false, path: configPath };
  }

  writeJsonFile(configPath, merged);
  return { created: true, path: configPath };
}

/**
 * Initialize Claude Code MCP configuration (.mcp.json)
 */
function initClaudeCode(projectRoot: string): {
  created: boolean;
  path: string;
} {
  const configPath = path.join(projectRoot, '.mcp.json');
  const existing = readJsonFile(configPath);
  const merged = mergeConfig(existing);

  // Check if already configured
  if (existing?.mcpServers?.[SERVER_NAME]) {
    return { created: false, path: configPath };
  }

  writeJsonFile(configPath, merged);
  return { created: true, path: configPath };
}

/**
 * Run the init command
 */
export async function runInit(): Promise<void> {
  const projectRoot = process.cwd();

  console.log('Initializing MCP configuration for react-native-nitro-device-info...\n');

  // Initialize Cursor
  const cursorResult = initCursor(projectRoot);
  if (cursorResult.created) {
    console.log(`✓ Created ${path.relative(projectRoot, cursorResult.path)}`);
  } else {
    console.log(
      `• ${path.relative(projectRoot, cursorResult.path)} (already configured)`
    );
  }

  // Initialize Claude Code
  const claudeResult = initClaudeCode(projectRoot);
  if (claudeResult.created) {
    console.log(`✓ Created ${path.relative(projectRoot, claudeResult.path)}`);
  } else {
    console.log(
      `• ${path.relative(projectRoot, claudeResult.path)} (already configured)`
    );
  }

  console.log('\nMCP configuration complete!\n');
  console.log('Next steps:');
  console.log('  • Cursor IDE: Restart Cursor to load the MCP server');
  console.log(
    '  • Claude Code: The MCP server will be available in your project'
  );
  console.log('\nYou can now ask AI assistants about react-native-nitro-device-info:');
  console.log('  "How do I get the device\'s battery level?"');
  console.log('  "What network APIs are available?"');
}
