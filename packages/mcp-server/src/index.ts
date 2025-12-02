#!/usr/bin/env node
/**
 * MCP Server for react-native-nitro-device-info
 *
 * Enables AI tools like Claude, Cursor, and Copilot to access
 * accurate API documentation for the react-native-nitro-device-info library.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import type { SearchIndex } from './types/index.js';
import { buildIndex, getIndexStats, validateIndex } from './indexer/index.js';
import {
  searchDocsInputSchema,
  executeSearchDocs,
  type SearchDocsInput,
} from './tools/search-docs.js';
import {
  getApiInputSchema,
  executeGetApi,
  type GetApiInput,
} from './tools/get-api.js';
import {
  listApisInputSchema,
  executeListApis,
  type ListApisInput,
} from './tools/list-apis.js';

// Tool timeout in milliseconds (2 seconds per spec)
const TOOL_TIMEOUT_MS = 2000;

/**
 * Create and configure the MCP server
 */
async function createServer(): Promise<Server> {
  const server = new Server(
    {
      name: 'react-native-nitro-device-info',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Build search index
  let index: SearchIndex;
  try {
    console.error('Building documentation index...');
    const startTime = Date.now();
    index = buildIndex(__dirname);
    const buildTime = Date.now() - startTime;

    const stats = getIndexStats(index);
    console.error(`Index built in ${buildTime}ms:`);
    console.error(`  - APIs: ${stats.apiCount}`);
    console.error(`  - Documentation chunks: ${stats.chunkCount}`);
    console.error(`  - Total documents: ${stats.totalDocuments}`);

    // Validate index
    const validation = validateIndex(index);
    if (!validation.valid) {
      console.error('Index validation warnings:');
      for (const error of validation.errors) {
        console.error(`  - ERROR: ${error}`);
      }
    }
    if (validation.warnings.length > 0 && validation.warnings.length <= 5) {
      for (const warning of validation.warnings) {
        console.error(`  - WARNING: ${warning}`);
      }
    } else if (validation.warnings.length > 5) {
      console.error(`  - ${validation.warnings.length} warnings (suppressed)`);
    }
  } catch (error) {
    console.error(`Failed to build index: ${error}`);
    // Create empty index as fallback
    index = {
      apis: new Map(),
      chunks: [],
      invertedIndex: new Map(),
      documentLengths: new Map(),
      averageDocumentLength: 0,
      documentCount: 0,
      termDocumentFrequencies: new Map(),
    };
  }

  // Register tool list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'search_docs',
          description:
            'Search react-native-nitro-device-info documentation using natural language queries. Returns relevant API methods, properties, and documentation sections with relevance scores.',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description:
                  "Natural language search query (e.g., 'how to get battery level')",
                minLength: 1,
                maxLength: 1000,
              },
              limit: {
                type: 'number',
                description:
                  'Maximum number of results to return (1-20, default: 5)',
                minimum: 1,
                maximum: 20,
                default: 5,
              },
              type: {
                type: 'string',
                enum: ['all', 'api', 'guide'],
                description:
                  "Filter results by content type: 'api' = API definitions, 'guide' = documentation guides, 'all' = both",
                default: 'all',
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'get_api',
          description:
            'Get detailed information about a specific API method or property from react-native-nitro-device-info. Returns signature, parameters, return type, platform support, examples, and related APIs.',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description:
                  "API method or property name (e.g., 'getBatteryLevel', 'deviceId'). Case-insensitive lookup.",
                minLength: 1,
                maxLength: 100,
              },
            },
            required: ['name'],
          },
        },
        {
          name: 'list_apis',
          description:
            'List all available API methods and properties in react-native-nitro-device-info with optional filtering by category, platform, or kind.',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                enum: [
                  'all',
                  'device-info',
                  'battery',
                  'memory',
                  'storage',
                  'network',
                  'capabilities',
                  'application',
                  'platform-specific',
                  'display',
                  'audio',
                  'location',
                  'identification',
                ],
                description: 'Filter by API category',
                default: 'all',
              },
              platform: {
                type: 'string',
                enum: ['all', 'ios', 'android', 'both'],
                description:
                  "Filter by platform support: 'ios' = iOS only, 'android' = Android only, 'both' = must support both, 'all' = any platform",
                default: 'all',
              },
              kind: {
                type: 'string',
                enum: ['all', 'method', 'property'],
                description:
                  "Filter by API kind: 'method' = functions with (), 'property' = readonly getters",
                default: 'all',
              },
            },
          },
        },
      ],
    };
  });

  // Register tool call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    // Wrap execution with timeout
    const executeWithTimeout = async <T>(
      fn: () => T,
      timeoutMs: number
    ): Promise<T> => {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error(`Tool execution timed out after ${timeoutMs}ms`));
        }, timeoutMs);

        try {
          const result = fn();
          clearTimeout(timer);
          resolve(result);
        } catch (error) {
          clearTimeout(timer);
          reject(error);
        }
      });
    };

    try {
      // Check if index is empty
      if (index.documentCount === 0) {
        return {
          content: [
            {
              type: 'text',
              text: 'Error: Documentation index is empty or could not be built. Please check that the server is running from the correct directory.',
            },
          ],
          isError: true,
        };
      }

      switch (name) {
        case 'search_docs': {
          const parseResult = searchDocsInputSchema.safeParse(args);
          if (!parseResult.success) {
            return {
              content: [
                {
                  type: 'text',
                  text: `Invalid input: ${parseResult.error.message}`,
                },
              ],
              isError: true,
            };
          }

          const result = await executeWithTimeout(
            () => executeSearchDocs(index, parseResult.data as SearchDocsInput),
            TOOL_TIMEOUT_MS
          );

          return {
            content: [{ type: 'text', text: result.content }],
            isError: result.isError,
          };
        }

        case 'get_api': {
          const parseResult = getApiInputSchema.safeParse(args);
          if (!parseResult.success) {
            return {
              content: [
                {
                  type: 'text',
                  text: `Invalid input: ${parseResult.error.message}`,
                },
              ],
              isError: true,
            };
          }

          const result = await executeWithTimeout(
            () => executeGetApi(index, parseResult.data as GetApiInput),
            TOOL_TIMEOUT_MS
          );

          return {
            content: [{ type: 'text', text: result.content }],
            isError: result.isError,
          };
        }

        case 'list_apis': {
          const parseResult = listApisInputSchema.safeParse(args ?? {});
          if (!parseResult.success) {
            return {
              content: [
                {
                  type: 'text',
                  text: `Invalid input: ${parseResult.error.message}`,
                },
              ],
              isError: true,
            };
          }

          const result = await executeWithTimeout(
            () => executeListApis(index, parseResult.data as ListApisInput),
            TOOL_TIMEOUT_MS
          );

          return {
            content: [{ type: 'text', text: result.content }],
            isError: result.isError,
          };
        }

        default:
          return {
            content: [
              {
                type: 'text',
                text: `Unknown tool: ${name}. Available tools: search_docs, get_api, list_apis`,
              },
            ],
            isError: true,
          };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Handle timeout specifically
      if (errorMessage.includes('timed out')) {
        return {
          content: [
            {
              type: 'text',
              text: `Request timed out after ${TOOL_TIMEOUT_MS}ms. Please try a simpler query.`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `Error executing tool: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  try {
    const server = await createServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('MCP server started successfully');
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  process.exit(1);
});

// Run the server
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
