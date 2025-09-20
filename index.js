#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { tools, handleTool } from './src/tools.js';
import { enhancedTools, handleEnhancedTool, mapLegacyTool } from './src/enhanced-tools.js';

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
    tools: [...enhancedTools, ...tools.map(tool => ({ ...tool, deprecated: true, replacement: getReplacementTool(tool.name) }))]
  };
});

function getReplacementTool(toolName) {
  const replacements = {
    'check_feature_support': 'check_compatibility',
    'check_multiple_features': 'check_compatibility',
    'suggest_alternatives': 'get_fixes',
    'check_react_compatibility': 'check_compatibility',
    'check_css_modules_compatibility': 'check_compatibility',
    'generate_css_fallbacks': 'get_fixes',
    'get_build_config': 'generate_configs',
    'generate_component_template': 'generate_configs'
  };
  return replacements[toolName] || 'scan_project';
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;
    
    // Check if it's a new enhanced tool
    const isEnhancedTool = enhancedTools.some(tool => tool.name === name);
    
    let result;
    if (isEnhancedTool) {
      result = await handleEnhancedTool(name, args);
    } else {
      // Legacy tool - provide deprecation warning and try to map to new tool
      try {
        result = await mapLegacyTool(name, args);
        result._deprecationWarning = `Tool '${name}' is deprecated. Use '${getReplacementTool(name)}' instead for better performance and features.`;
      } catch (mappingError) {
        // Fallback to original tool
        result = await handleTool(name, args);
        result._deprecationWarning = `Tool '${name}' is deprecated. Consider using the new enhanced tools for better functionality.`;
      }
    }
    
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
  
  console.error('🚀 Enhanced CanIUse MCP Server running on stdio');
  console.error('🎯 Smart CSS/JS compatibility checking with project scanning');
  console.error('\n📋 New Enhanced Tools (Recommended):');
  enhancedTools.forEach(tool => {
    console.error(`  ✨ ${tool.name}: ${tool.description}`);
  });
  console.error('\n⚠️  Legacy Tools (Deprecated but supported):');
  tools.forEach(tool => {
    console.error(`  📦 ${tool.name}: ${tool.description} [Use ${getReplacementTool(tool.name)} instead]`);
  });
  console.error('\n💡 Quick Start: Use "scan_project" to analyze your entire project automatically!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}