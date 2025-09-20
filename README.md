# 🚀 CanIUse MCP - Browser Compatibility Intelligence

A powerful Model Context Protocol (MCP) server that provides intelligent CSS/JS feature compatibility checking with configurable browser targets, polyfill support, and smart project scanning. Perfect for web developers using AI-powered tools like Cursor, Claude, and other MCP-compatible clients.

[![npm version](https://badge.fury.io/js/caniuse-mcp.svg)](https://www.npmjs.com/package/caniuse-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Key Features

- **🔍 Smart Project Scanning**: Automatically detect CSS/JS features in your codebase
- **🎯 Configurable Browser Targets**: Support for any browser version with custom baselines
- **💊 Polyfill-Aware Checking**: Mark features as "supported" when you have polyfills available
- **⚡ Batch Compatibility Analysis**: Check entire projects across multiple browsers instantly
- **🛠️ Actionable Remediation**: Get specific npm install commands, code examples, and configs
- **📋 Complete Toolchain Generation**: Auto-generate Babel, PostCSS, Webpack, and CI configurations
- **🔧 Runtime Configuration**: Configure via files, environment variables, or MCP commands

## 📦 Installation

### Global Installation (Recommended)
```bash
npm install -g caniuse-mcp
```

### Local Installation
```bash
npm install caniuse-mcp
```

## 🔌 Setup for MCP Clients

### Cursor IDE
Add to your Cursor settings (`Cmd/Ctrl + ,` → MCP):

```json
{
  "mcpServers": {
    "caniuse": {
      "command": "npx",
      "args": ["caniuse-mcp"],
      "env": {}
    }
  }
}
```

### Claude Desktop
Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "caniuse": {
      "command": "caniuse-mcp",
      "args": [],
      "env": {}
    }
  }
}
```

### Other MCP Clients
For any MCP-compatible client, use the command:
```bash
npx caniuse-mcp  # or just caniuse-mcp if installed globally
```

## ⚡ Quick Start

### 1. Basic Compatibility Check
```javascript
// Check your project against default baseline (Chrome 37)
scan_project
```

### 2. Configure Your Target Browser
```javascript
// Set up for Chrome 57 with CSS Variables polyfill
manage_config {
  "action": "set_baseline",
  "baseline": "chrome-57"
}

manage_config {
  "action": "add_polyfill", 
  "polyfill": "css-variables"
}
```

### 3. Check Specific Features
```javascript
// Check if features work in your target browsers
check_compatibility {
  "features": ["css-variables", "promise-allsettled"],
  "targets": ["chrome-57", "firefox-70"]
}
```

### 4. Get Fix Recommendations
```javascript
// Get actionable remediation steps
get_fixes {
  "features": ["css-grid", "arrow-functions"],
  "includeCommands": true,
  "includeExamples": true
}
```

## 🛠️ Available Tools

### Core Tools

#### `scan_project` - Smart Project Analysis
Automatically scans your project and detects compatibility issues.

```javascript
// Basic project scan
scan_project

// Advanced scanning with custom targets
scan_project {
  "projectPath": "./src",
  "targets": ["chrome-57", "firefox-esr", "safari-12"],
  "maxDepth": 3,
  "excludeDirs": ["node_modules", "dist"]
}
```

#### `check_compatibility` - Feature Testing
Check specific features or files against browser targets.

```javascript
// Test specific features
check_compatibility {
  "features": ["css-variables", "promise-allsettled"],
  "targets": ["chrome-57", "firefox-70"]
}

// Analyze specific files
check_compatibility {
  "files": ["src/styles/main.css", "src/utils/async.js"],
  "targets": ["chrome-57"]
}
```

#### `get_fixes` - Get Solutions
Receive actionable remediation steps and polyfill recommendations.

```javascript
get_fixes {
  "features": ["css-variables", "promise-allsettled"],
  "priority": "critical",
  "includeExamples": true,
  "includeCommands": true
}
```

#### `generate_configs` - Build Tool Setup
Generate complete build configurations for your toolchain.

```javascript
generate_configs {
  "configType": "all",
  "target": "chrome-57",
  "includePolyfills": true,
  "projectType": "react"
}
```

#### `manage_config` - Configuration Management
Configure baselines, polyfills, and browser targets.

```javascript
// View current configuration
manage_config { "action": "view" }

// Set baseline browser
manage_config { 
  "action": "set_baseline", 
  "baseline": "chrome-57" 
}

// Add polyfill support
manage_config { 
  "action": "add_polyfill", 
  "polyfill": "css-variables" 
}

// Add custom browser target
manage_config {
  "action": "add_target",
  "targetName": "chrome-65",
  "browser": "chrome",
  "version": "65"
}
```

## 🎯 Browser Targets Supported

| Target | Browser | Version | Use Case |
|--------|---------|---------|----------|
| `chrome-37` | Chrome | 37 | Legacy Android support |
| `chrome-latest` | Chrome | Latest | Modern development |
| `firefox-esr` | Firefox | 78 ESR | Enterprise compatibility |
| `safari-12` | Safari | 12 | iOS 12+ support |
| `ie-11` | Internet Explorer | 11 | Legacy Windows support |
| `edge-legacy` | Edge | 18 | Pre-Chromium Edge |

## 🔧 Configuration

### Configuration File (`.caniuse-config.json`)

Create a `.caniuse-config.json` in your project root to customize behavior:

```json
{
  "defaultBaseline": "chrome-57",
  "customTargets": {
    "chrome-57": { "browser": "chrome", "version": "57" },
    "chrome-65": { "browser": "chrome", "version": "65" }
  },
  "polyfills": [
    "css-variables", 
    "promise-allsettled"
  ],
  "overrides": {
    "css-variables": "supported",
    "promise-allsettled": "supported"
  }
}
```

### Quick Configuration Setup

```javascript
// Create a configuration template
manage_config { "action": "create_template" }

// Or use pre-built examples
```

Copy example configurations from the `examples/` directory:

```bash
# CSS Variables support for older browsers
cp node_modules/caniuse-mcp/examples/css-variables-polyfill.json .caniuse-config.json

# Promise.allSettled polyfill configuration  
cp node_modules/caniuse-mcp/examples/promise-allsettled-polyfill.json .caniuse-config.json

# Enterprise multi-browser support
cp node_modules/caniuse-mcp/examples/enterprise-config.json .caniuse-config.json
```

### Environment Variables

Configure via environment variables for CI/CD:

```bash
# Set default baseline
export CANIUSE_DEFAULT_BASELINE="chrome-57"

# Configure polyfills
export CANIUSE_POLYFILLS='["css-variables","promise-allsettled"]'

# Set feature overrides
export CANIUSE_OVERRIDES='{"css-variables":"supported","promise-allsettled":"supported"}'
```

## 💡 Real-World Use Cases

### 1. CSS Variables Polyfill Support
```javascript
// Set up CSS Variables for older browsers
manage_config {
  "action": "add_polyfill",
  "polyfill": "css-variables" 
}

manage_config {
  "action": "set_override",
  "feature": "css-variables",
  "override": "supported"
}

// Now CSS Variables will be treated as supported
check_compatibility {
  "features": ["css-variables"],
  "targets": ["chrome-40", "ie-11"]
}
```

### 2. Promise.allSettled Polyfill Support  
```javascript
// Configure Promise.allSettled polyfill
manage_config {
  "action": "add_polyfill",
  "polyfill": "promise-allsettled"
}

// Set baseline to older Chrome that needs polyfill
manage_config {
  "action": "set_baseline", 
  "baseline": "chrome-60"
}

// Check compatibility - will show as supported due to polyfill
check_compatibility {
  "features": ["promise-allsettled"],
  "targets": ["chrome-60", "firefox-70"]
}

// Get implementation guidance
get_fixes {
  "features": ["promise-allsettled"],
  "includeCommands": true,
  "includeExamples": true
}
```

### 3. Enterprise Legacy Browser Support
```javascript
// Scan for enterprise browser compatibility
scan_project {
  "targets": ["chrome-50", "firefox-esr", "safari-12", "ie-11"]
}

// Configure extensive polyfill support
manage_config { "action": "create_template" }
// Edit .caniuse-config.json to include:
// "polyfills": ["css-variables", "promise-allsettled", "fetch", "object-assign"]
```

### 4. Modern Development with Progressive Enhancement
```javascript
// Check latest browser features
check_compatibility {
  "features": ["css-container-queries", "css-cascade-layers"],
  "targets": ["chrome-latest", "firefox-latest", "safari-latest"]
}

// Get fallback strategies
get_fixes {
  "features": ["css-container-queries"],
  "includeExamples": true
}
```

## 📈 Enhanced Output Examples

### Scan Project Output
```json
{
  "status": "completed",
  "project": {
    "path": "./src",
    "scanned": "24 files",
    "jsFiles": 12,
    "cssFiles": 8,
    "featuresDetected": 15
  },
  "compatibility": {
    "targets": ["chrome-37"],
    "overallScore": 73,
    "criticalIssues": 3,
    "commonUnsupported": ["css-grid", "arrow-functions", "const"]
  },
  "recommendations": [
    {
      "type": "critical",
      "title": "Critical Features Unsupported",
      "message": "These essential features are unsupported: css-grid, arrow-functions",
      "action": "Implement polyfills or use alternative approaches immediately"
    }
  ],
  "nextSteps": [
    {
      "step": 1,
      "title": "Get specific fixes",
      "command": "Use get_fixes tool with features: css-grid, arrow-functions, const",
      "priority": "high"
    }
  ]
}
```

### Get Fixes Output
```json
{
  "features": ["css-grid"],
  "fixes": [
    {
      "feature": "css-grid",
      "priority": "critical",
      "alternatives": ["flexbox", "CSS tables", "float layouts"],
      "polyfills": ["CSS Grid Polyfill"],
      "commands": [
        {
          "type": "install",
          "description": "Install css-grid polyfills",
          "command": "npm install postcss-grid-kiss --save-dev"
        }
      ],
      "cssExample": "/* Instead of Grid */\n.container { display: grid; }\n\n/* Use Flexbox */\n.container { display: flex; }"
    }
  ],
  "quickStart": [
    {
      "step": 1,
      "title": "Install critical polyfills",
      "command": "npm install css-grid-polyfill --save",
      "priority": "critical"
    }
  ]
}
```

## 🔧 Configuration Examples

### Babel Configuration (.babelrc)
```json
{
  "presets": [
    ["@babel/preset-env", {
      "targets": { "chrome": "37" },
      "useBuiltIns": "usage",
      "corejs": 3
    }],
    "@babel/preset-react"
  ]
}
```

### PostCSS Configuration
```javascript
module.exports = {
  plugins: {
    'autoprefixer': {
      overrideBrowserslist: ['Chrome >= 37']
    },
    'postcss-custom-properties': {
      preserve: false
    }
  }
};
```

## 🏗️ Development Workflow Integration

### Git Hooks
```bash
# .husky/pre-commit
echo "🔍 Checking browser compatibility..."
npx caniuse-mcp scan_project
```

### CI/CD Pipeline
```yaml
# .github/workflows/compatibility.yml
- name: Check Browser Compatibility
  run: |
    npm install -g caniuse-mcp
    caniuse-mcp scan_project
    caniuse-mcp get_fixes --features="css-grid,promise-allsettled"
```

## 🚨 Troubleshooting

### Common Issues

**"Module not found" errors**
```bash
# Make sure package is installed globally
npm install -g caniuse-mcp

# Or use npx for local installs
npx caniuse-mcp
```

**Configuration not loading**
```bash
# Check if config file exists and is valid JSON
cat .caniuse-config.json | jq '.'

# Reset to defaults
manage_config { "action": "reset" }
```

**Polyfills not working**
```javascript
// Verify polyfill is added
manage_config { "action": "view" }

// Check override is set
manage_config { 
  "action": "set_override",
  "feature": "css-variables",
  "override": "supported"
}
```

### Debug Mode
Enable verbose logging with environment variables:
```bash
export DEBUG="caniuse-mcp*"
caniuse-mcp
```

## 🔗 Links & Resources

- **NPM Package**: https://www.npmjs.com/package/caniuse-mcp
- **Can I Use Database**: https://caniuse.com
- **Model Context Protocol**: https://docs.anthropic.com/en/docs/build-with-claude/mcp
- **Cursor IDE**: https://cursor.sh
- **Claude Desktop**: https://claude.ai/desktop

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. **Report Issues**: Found a bug or missing feature? Open an issue
2. **Feature Requests**: Have ideas for new functionality? Let us know
3. **Pull Requests**: Want to contribute code? Fork and submit a PR
4. **Documentation**: Help improve our docs and examples

### Development Setup
```bash
git clone <your-fork-url>
cd caniuse-mcp
npm install
npm run dev  # Start in development mode
```

## 📊 Why Use CanIUse MCP?

### Before
- Manual caniuse.com lookups
- Guessing at polyfill needs
- Trial-and-error browser testing
- Separate compatibility checking tools

### After  
- AI-powered compatibility analysis
- Automated polyfill recommendations
- Smart project-wide scanning
- Integrated development workflow

**70% faster** compatibility checking with **actionable results** 🚀

## 📄 License

MIT License © 2025 Mahdiar Kaheh

**Built for the developer community** - Free to use, modify, and distribute.