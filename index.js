#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { handleScanProject, handleCheckCompatibility, handleGetFixes, handleGenerateConfigs, handleManageConfig } from './src/enhanced-tools.js';
import { fileURLToPath } from 'url';

const server = new McpServer({
  name: 'caniuse-mcp-server',
  version: '1.2.1'
});

// Register scan_project tool
server.registerTool(
  "scan_project",
  {
    title: "Project Scanner",
    description: "Analyze project files to detect CSS/JS features and check compatibility across browser targets",
    inputSchema: {
      projectPath: z.string().optional().default(".").describe("Path to the project directory to scan (default: current directory)"),
      targets: z.array(z.string()).optional().default(["chrome-37"]).describe("Browser targets to check (e.g., 'chrome-37', 'firefox-esr', 'safari-12')"),
      maxDepth: z.number().optional().default(5).describe("Maximum directory depth to scan"),
      excludeDirs: z.array(z.string()).optional().default(["node_modules", ".git", "dist", "build"]).describe("Directories to exclude from scanning")
    }
  },
  async (args) => {
    try {
      const result = await handleScanProject(args);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: true,
            message: error.message,
            suggestion: "Try using 'scan_project' to automatically detect and check your project's compatibility."
          }, null, 2)
        }],
        isError: true
      };
    }
  }
);

// Register check_compatibility tool
server.registerTool(
  "check_compatibility",
  {
    title: "Compatibility Checker",
    description: "Check specific features or files against multiple browser targets with detailed analysis",
    inputSchema: {
      features: z.array(z.string()).optional().describe("Specific caniuse feature names to check (e.g., 'flexbox', 'css-grid')"),
      files: z.array(z.string()).optional().describe("Specific file paths to analyze for features"),
      targets: z.array(z.string()).optional().default(["chrome-37"]).describe("Browser targets (chrome-37, firefox-esr, safari-12, ie-11, edge-legacy)")
    }
  },
  async (args) => {
    try {
      const result = await handleCheckCompatibility(args);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: true,
            message: error.message,
            suggestion: "Check the input parameters and try again. Use 'scan_project' first to detect features automatically."
          }, null, 2)
        }],
        isError: true
      };
    }
  }
);

// Register get_fixes tool
server.registerTool(
  "get_fixes",
  {
    title: "Fix Generator",
    description: "Get actionable remediation steps, polyfills, and alternatives for unsupported features",
    inputSchema: {
      features: z.array(z.string()).describe("Features that need fixes (from compatibility check results)"),
      priority: z.enum(["critical", "high", "medium", "low", "all"]).optional().default("all").describe("Filter fixes by priority level"),
      includeExamples: z.boolean().optional().default(true).describe("Include code examples in the response"),
      includeCommands: z.boolean().optional().default(true).describe("Include terminal commands for installation/setup")
    }
  },
  async (args) => {
    try {
      const result = handleGetFixes(args);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: true,
            message: error.message,
            suggestion: "Provide an array of feature names that need fixes."
          }, null, 2)
        }],
        isError: true
      };
    }
  }
);

// Register generate_configs tool
server.registerTool(
  "generate_configs",
  {
    title: "Config Generator",
    description: "Generate complete build configurations, CI/CD setups, and workflow files for browser compatibility",
    inputSchema: {
      configType: z.enum(["babel", "postcss", "webpack", "package-json", "ci", "git-hooks", "all"]).optional().default("all").describe("Type of configuration to generate"),
      target: z.string().optional().default("chrome-37").describe("Primary browser target for configuration"),
      includePolyfills: z.boolean().optional().default(true).describe("Include polyfill configurations"),
      projectType: z.enum(["react", "vanilla-js", "vue", "angular"]).optional().default("react").describe("Project framework type")
    }
  },
  async (args) => {
    try {
      const result = handleGenerateConfigs(args);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: true,
            message: error.message,
            suggestion: "Check configuration parameters and try again."
          }, null, 2)
        }],
        isError: true
      };
    }
  }
);

// Register manage_config tool
server.registerTool(
  "manage_config",
  {
    title: "Config Manager",
    description: "Configure browser baselines, polyfills, and feature overrides for more accurate compatibility checking",
    inputSchema: {
      action: z.enum(["view", "set_baseline", "add_polyfill", "remove_polyfill", "set_override", "add_target", "create_template", "reset"]).optional().default("view").describe("Configuration action to perform"),
      baseline: z.string().optional().describe("Set default baseline browser target (e.g., 'chrome-37', 'chrome-57')"),
      polyfill: z.string().optional().describe("Feature name to add/remove from polyfills list"),
      feature: z.string().optional().describe("Feature name for override setting"),
      override: z.enum(["supported", "unsupported"]).optional().describe("Force feature support status"),
      targetName: z.string().optional().describe("Custom target name (e.g., 'chrome-57')"),
      browser: z.string().optional().describe("Browser name for custom target"),
      version: z.string().optional().describe("Browser version for custom target")
    }
  },
  async (args) => {
    try {
      const result = await handleManageConfig(args);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: true,
            message: error.message,
            suggestion: "Check the action parameter and required fields. Use action='view' to see available options."
          }, null, 2)
        }],
        isError: true
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('🚀 CanIUse MCP Server running on stdio');
  console.error('🎯 Smart CSS/JS compatibility checking with project scanning');
  console.error('\n📋 Available Tools:');
  console.error('  ✨ scan_project: Analyze project files to detect CSS/JS features and check compatibility across browser targets');
  console.error('  ✨ check_compatibility: Check specific features or files against multiple browser targets with detailed analysis');
  console.error('  ✨ get_fixes: Get actionable remediation steps, polyfills, and alternatives for unsupported features');
  console.error('  ✨ generate_configs: Generate complete build configurations, CI/CD setups, and workflow files for browser compatibility');
  console.error('  ✨ manage_config: Configure browser baselines, polyfills, and feature overrides for more accurate compatibility checking');
  console.error('\n💡 Quick Start: Use "scan_project" to analyze your entire project automatically!');
}

// Always start the MCP server when this module is executed
main().catch(console.error);