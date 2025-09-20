#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { enhancedTools, handleEnhancedTool } from './src/enhanced-tools.js';

const server = new Server({
  name: 'caniuse-mcp-server',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {}
  }
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: enhancedTools
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;
    const result = await handleEnhancedTool(name, args);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: true,
            message: error.message,
            suggestion: "Try using 'scan_project' to automatically detect and check your project's compatibility, or 'check_compatibility' for specific features."
          }, null, 2)
        }
      ],
      isError: true
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('🚀 CanIUse MCP Server running on stdio');
  console.error('🎯 Smart CSS/JS compatibility checking with project scanning');
  console.error('\n📋 Available Tools:');
  enhancedTools.forEach(tool => {
    console.error(`  ✨ ${tool.name}: ${tool.description}`);
  });
  console.error('\n💡 Quick Start: Use "scan_project" to analyze your entire project automatically!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}