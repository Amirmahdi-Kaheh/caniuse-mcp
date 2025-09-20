export class FixGenerator {
  constructor() {
    this.fixDatabase = {
      // CSS Fixes
      'css-grid': {
        priority: 'critical',
        alternatives: ['flexbox', 'CSS tables', 'float layouts'],
        polyfills: ['CSS Grid Polyfill'],
        buildSteps: [
          'npm install postcss-grid-kiss --save-dev',
          'Add postcss-grid-kiss to PostCSS plugins'
        ],
        cssExample: `/* Instead of Grid */
.container { display: grid; grid-template-columns: 1fr 2fr; }

/* Use Flexbox */
.container { display: flex; }
.item1 { flex: 1; }
.item2 { flex: 2; }`,
        documentation: 'https://css-tricks.com/snippets/css/complete-guide-grid/'
      },

      'flexbox': {
        priority: 'high',
        alternatives: ['CSS tables', 'inline-block', 'float layouts'],
        polyfills: ['flexibility.js', 'flexie'],
        buildSteps: [
          'npm install flexibility --save',
          'Add flexibility polyfill to your HTML'
        ],
        cssExample: `/* Add vendor prefixes */
.container {
  display: -webkit-flex;
  display: flex;
  -webkit-justify-content: center;
  justify-content: center;
}`,
        prefixes: ['-webkit-', '-moz-', '-ms-'],
        documentation: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/'
      },

      'css-variables': {
        priority: 'medium',
        alternatives: ['Sass variables', 'Less variables', 'PostCSS custom properties'],
        polyfills: ['css-vars-ponyfill'],
        buildSteps: [
          'npm install css-vars-ponyfill --save',
          'npm install postcss-custom-properties --save-dev'
        ],
        cssExample: `/* Instead of CSS Variables */
:root { --main-color: blue; }
.element { color: var(--main-color); }

/* Use fixed values with Sass */
$main-color: blue;
.element { color: $main-color; }`,
        documentation: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties'
      },

      'object-fit': {
        priority: 'medium',
        alternatives: ['background-size on wrapper divs'],
        polyfills: ['object-fit-images'],
        buildSteps: [
          'npm install object-fit-images --save',
          'Import and initialize polyfill in JS'
        ],
        cssExample: `/* Instead of object-fit */
img { object-fit: cover; }

/* Use background approach */
.img-wrapper { 
  background-image: url(image.jpg);
  background-size: cover;
  background-position: center;
}`,
        jsExample: `import objectFitImages from 'object-fit-images';
objectFitImages();`,
        documentation: 'https://github.com/bfred-it/object-fit-images'
      },

      // JavaScript Fixes
      'arrow-functions': {
        priority: 'high',
        alternatives: ['function expressions', 'regular functions'],
        polyfills: [],
        buildSteps: [
          'npm install @babel/preset-env --save-dev',
          'Add "@babel/preset-env" to .babelrc presets'
        ],
        jsExample: `// Instead of arrow functions
const add = (a, b) => a + b;

// Use regular functions  
const add = function(a, b) { return a + b; };`,
        babelConfig: {
          presets: [['@babel/preset-env', { targets: { chrome: '37' } }]]
        },
        documentation: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions'
      },

      'const': {
        priority: 'high',
        alternatives: ['var declarations'],
        polyfills: [],
        buildSteps: [
          'npm install @babel/preset-env --save-dev',
          'Configure Babel to transpile const/let'
        ],
        jsExample: `// Instead of const/let
const value = 'hello';
let counter = 0;

// Use var (with careful scoping)
var value = 'hello';
var counter = 0;`,
        documentation: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const'
      },

      'template-literals': {
        priority: 'medium',
        alternatives: ['string concatenation'],
        polyfills: [],
        buildSteps: [
          'npm install @babel/preset-env --save-dev',
          'Enable template literal transformation'
        ],
        jsExample: `// Instead of template literals
const message = \`Hello \${name}!\`;

// Use concatenation
const message = 'Hello ' + name + '!';`,
        documentation: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals'
      },

      'promises': {
        priority: 'critical',
        alternatives: ['callbacks', 'async libraries'],
        polyfills: ['es6-promise', 'core-js'],
        buildSteps: [
          'npm install es6-promise --save',
          'Import polyfill at app entry point'
        ],
        jsExample: `// Import Promise polyfill
import 'es6-promise/auto';

// Or use callbacks
function fetchData(callback) {
  // async operation
  callback(null, data);
}`,
        documentation: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise'
      }
    };

    this.workflowTemplates = {
      babel: {
        config: {
          presets: [
            ['@babel/preset-env', {
              targets: { chrome: '37' },
              useBuiltIns: 'usage',
              corejs: 3
            }],
            '@babel/preset-react'
          ],
          plugins: [
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-transform-runtime'
          ]
        },
        packages: [
          '@babel/core',
          '@babel/preset-env', 
          '@babel/preset-react',
          '@babel/plugin-proposal-class-properties',
          '@babel/plugin-transform-runtime',
          'core-js@3'
        ]
      },
      postcss: {
        config: {
          plugins: {
            'autoprefixer': { overrideBrowserslist: ['Chrome >= 37'] },
            'postcss-custom-properties': { preserve: false },
            'postcss-calc': {},
            'postcss-flexbugs-fixes': {}
          }
        },
        packages: [
          'postcss',
          'autoprefixer',
          'postcss-custom-properties',
          'postcss-calc',
          'postcss-flexbugs-fixes'
        ]
      }
    };
  }

  generateFixes(features, options = {}) {
    const { priority = 'all', includeExamples = true, includeCommands = true } = options;
    
    const fixes = features.map(feature => {
      const fixInfo = this.fixDatabase[feature];
      if (!fixInfo) {
        return {
          feature,
          status: 'unknown',
          message: `No fix information available for ${feature}`,
          suggestions: [
            'Check caniuse.com for manual compatibility info',
            'Search for polyfills or alternative implementations',
            'Consider progressive enhancement'
          ]
        };
      }

      const fix = {
        feature,
        priority: fixInfo.priority,
        alternatives: fixInfo.alternatives,
        polyfills: fixInfo.polyfills || [],
        buildSteps: fixInfo.buildSteps || [],
        documentation: fixInfo.documentation
      };

      if (includeExamples) {
        if (fixInfo.cssExample) fix.cssExample = fixInfo.cssExample;
        if (fixInfo.jsExample) fix.jsExample = fixInfo.jsExample;
      }

      if (includeCommands) {
        fix.commands = this._generateCommands(feature, fixInfo);
      }

      return fix;
    });

    return {
      fixes,
      summary: this._generateFixSummary(fixes),
      quickStart: this._generateQuickStart(fixes)
    };
  }

  _generateCommands(feature, fixInfo) {
    const commands = [];
    
    // Install polyfills
    if (fixInfo.polyfills && fixInfo.polyfills.length > 0) {
      const polyfillPackages = fixInfo.polyfills.map(p => p.toLowerCase().replace(/\s+/g, '-'));
      commands.push({
        type: 'install',
        description: `Install ${feature} polyfills`,
        command: `npm install ${polyfillPackages.join(' ')} --save`
      });
    }

    // Build tool steps
    if (fixInfo.buildSteps) {
      fixInfo.buildSteps.forEach((step, index) => {
        if (step.startsWith('npm install')) {
          commands.push({
            type: 'install',
            description: `Install build dependencies for ${feature}`,
            command: step
          });
        } else {
          commands.push({
            type: 'config',
            description: `Configure build tools for ${feature}`,
            instruction: step
          });
        }
      });
    }

    return commands;
  }

  _generateFixSummary(fixes) {
    const summary = {
      total: fixes.length,
      byPriority: { critical: 0, high: 0, medium: 0, low: 0, unknown: 0 },
      totalPolyfills: 0,
      totalCommands: 0
    };

    fixes.forEach(fix => {
      if (fix.priority) {
        summary.byPriority[fix.priority]++;
      }
      if (fix.polyfills) {
        summary.totalPolyfills += fix.polyfills.length;
      }
      if (fix.commands) {
        summary.totalCommands += fix.commands.length;
      }
    });

    return summary;
  }

  _generateQuickStart(fixes) {
    const criticalFixes = fixes.filter(f => f.priority === 'critical');
    const highFixes = fixes.filter(f => f.priority === 'high');
    
    const steps = [];
    
    // Step 1: Install critical polyfills
    const criticalPolyfills = criticalFixes.flatMap(f => f.polyfills || []);
    if (criticalPolyfills.length > 0) {
      const packages = criticalPolyfills.map(p => p.toLowerCase().replace(/\s+/g, '-')).join(' ');
      steps.push({
        step: 1,
        title: 'Install critical polyfills',
        command: `npm install ${packages} --save`,
        priority: 'critical'
      });
    }

    // Step 2: Setup build tools
    const needsBabel = fixes.some(f => ['arrow-functions', 'const', 'template-literals', 'promises'].includes(f.feature));
    if (needsBabel) {
      steps.push({
        step: steps.length + 1,
        title: 'Setup Babel for JS transpilation',
        command: 'npm install @babel/core @babel/preset-env --save-dev',
        followUp: 'Create .babelrc with Chrome 37 target',
        priority: 'high'
      });
    }

    // Step 3: Setup PostCSS for CSS
    const needsPostCSS = fixes.some(f => ['css-variables', 'flexbox', 'css-grid'].includes(f.feature));
    if (needsPostCSS) {
      steps.push({
        step: steps.length + 1,
        title: 'Setup PostCSS for CSS processing',
        command: 'npm install postcss autoprefixer --save-dev',
        followUp: 'Configure autoprefixer for Chrome >= 37',
        priority: 'high'
      });
    }

    return steps;
  }

  generateWorkflowConfig(type, options = {}) {
    const { target = 'chrome-37', includePolyfills = true, includeDevDeps = true } = options;
    
    switch (type) {
      case 'babel':
        return this._generateBabelConfig(target, includePolyfills);
      case 'postcss':
        return this._generatePostCSSConfig(target);
      case 'webpack':
        return this._generateWebpackConfig(target);
      case 'package-json':
        return this._generatePackageJsonConfig(includeDevDeps);
      case 'ci':
        return this._generateCIConfig();
      case 'git-hooks':
        return this._generateGitHooks();
      case 'all':
        return {
          babel: this._generateBabelConfig(target, includePolyfills),
          postcss: this._generatePostCSSConfig(target),
          webpack: this._generateWebpackConfig(target),
          packageJson: this._generatePackageJsonConfig(includeDevDeps),
          ci: this._generateCIConfig(),
          gitHooks: this._generateGitHooks()
        };
      default:
        throw new Error(`Unknown config type: ${type}`);
    }
  }

  _generateBabelConfig(target, includePolyfills) {
    const targetVersion = target === 'chrome-37' ? '37' : '60';
    return {
      filename: '.babelrc',
      content: JSON.stringify({
        presets: [
          ['@babel/preset-env', {
            targets: { chrome: targetVersion },
            useBuiltIns: includePolyfills ? 'usage' : false,
            corejs: includePolyfills ? 3 : undefined
          }],
          '@babel/preset-react'
        ],
        plugins: [
          '@babel/plugin-proposal-class-properties',
          '@babel/plugin-transform-runtime'
        ]
      }, null, 2),
      packages: [
        '@babel/core',
        '@babel/preset-env',
        '@babel/preset-react', 
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-transform-runtime',
        ...(includePolyfills ? ['core-js@3'] : [])
      ],
      installCommand: `npm install ${[
        '@babel/core',
        '@babel/preset-env',
        '@babel/preset-react',
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-transform-runtime'
      ].join(' ')} --save-dev`
    };
  }

  _generatePostCSSConfig(target) {
    const browserTarget = target === 'chrome-37' ? 'Chrome >= 37' : 'Chrome >= 60';
    return {
      filename: 'postcss.config.js',
      content: `module.exports = {
  plugins: {
    'autoprefixer': {
      overrideBrowserslist: ['${browserTarget}']
    },
    'postcss-custom-properties': {
      preserve: false
    },
    'postcss-calc': {},
    'postcss-flexbugs-fixes': {}
  }
};`,
      packages: [
        'postcss',
        'autoprefixer',
        'postcss-custom-properties',
        'postcss-calc',
        'postcss-flexbugs-fixes'
      ],
      installCommand: 'npm install postcss autoprefixer postcss-custom-properties postcss-calc postcss-flexbugs-fixes --save-dev'
    };
  }

  _generateWebpackConfig(target) {
    return {
      filename: 'webpack.config.js',
      content: `const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\\.module\\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { modules: true }
          },
          'postcss-loader'
        ]
      },
      {
        test: /\\.css$/,
        exclude: /\\.module\\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
};`,
      packages: [
        'webpack',
        'webpack-cli',
        'babel-loader',
        'style-loader', 
        'css-loader',
        'postcss-loader'
      ]
    };
  }

  _generatePackageJsonConfig(includeDevDeps) {
    const config = {
      scripts: {
        'build': 'webpack --mode production',
        'dev': 'webpack --mode development --watch',
        'babel': 'babel src --out-dir lib',
        'compat-check': 'node -e "console.log(\'Run compatibility check with MCP server\')"'
      }
    };

    if (includeDevDeps) {
      config.devDependencies = {
        '@babel/core': '^7.0.0',
        '@babel/preset-env': '^7.0.0',
        '@babel/preset-react': '^7.0.0',
        'webpack': '^5.0.0',
        'webpack-cli': '^4.0.0',
        'postcss': '^8.0.0',
        'autoprefixer': '^10.0.0'
      };
    }

    return {
      filename: 'package.json (partial)',
      content: JSON.stringify(config, null, 2),
      note: 'Add these scripts and devDependencies to your existing package.json'
    };
  }

  _generateCIConfig() {
    return {
      filename: '.github/workflows/compatibility-check.yml',
      content: `name: Browser Compatibility Check

on: [push, pull_request]

jobs:
  compatibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build project
        run: npm run build
      - name: Run compatibility tests
        run: |
          echo "Add browser compatibility testing here"
          # Example: browserstack-runner or similar tool`
    };
  }

  _generateGitHooks() {
    return {
      filename: '.husky/pre-commit',
      content: `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run compatibility check before commit
echo "🔍 Checking browser compatibility..."

# Add your MCP compatibility check here
# Example: check if new CSS/JS features are compatible
npm run lint
npm run build`,
      setup: [
        'npm install husky --save-dev',
        'npx husky install',
        'npx husky add .husky/pre-commit "npm run build"'
      ]
    };
  }
}