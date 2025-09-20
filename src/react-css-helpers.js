import { Chrome37Utils } from './chrome37-utils.js';

export class ReactCSSHelpers {
  static getReactSpecificFeatures() {
    return [
      'jsx',
      'es6-class',
      'es6-arrow-functions', 
      'es6-destructuring',
      'es6-spread',
      'es6-default-parameters',
      'es6-template-literals',
      'const',
      'let'
    ];
  }

  static getCSSModulesFeatures() {
    return [
      'css-variables',
      'css-grid',
      'flexbox',
      'css-transforms',
      'css-transitions',
      'css-animation',
      'calc',
      'css3-colors',
      'border-radius',
      'css-gradients'
    ];
  }

  static generateReactBabelConfig() {
    return {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: { chrome: '37' },
            useBuiltIns: 'usage',
            corejs: 3,
            modules: false
          }
        ],
        '@babel/preset-react'
      ],
      plugins: [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-transform-object-rest-spread',
        '@babel/plugin-transform-arrow-functions',
        '@babel/plugin-transform-destructuring'
      ]
    };
  }

  static generatePostCSSConfig() {
    return {
      plugins: {
        'postcss-modules': {
          generateScopedName: '[name]__[local]__[hash:base64:5]'
        },
        'autoprefixer': {
          overrideBrowserslist: ['Chrome >= 37']
        },
        'postcss-custom-properties': {
          preserve: false
        },
        'postcss-calc': {},
        'postcss-flexbugs-fixes': {}
      }
    };
  }

  static getReactPolyfills() {
    return {
      runtime: [
        'core-js/stable',
        'regenerator-runtime/runtime'
      ],
      react: [
        'react-app-polyfill/ie11',
        'react-app-polyfill/stable'
      ],
      features: {
        'Promise': 'es6-promise',
        'fetch': 'whatwg-fetch',
        'Object.assign': 'object-assign',
        'Array.from': 'array-from',
        'Array.includes': 'array-includes'
      }
    };
  }

  static getCSSFallbacks() {
    return {
      'display: grid': {
        fallback: 'display: flex;',
        note: 'Use flexbox with flex-wrap for grid-like layouts'
      },
      'grid-template-columns': {
        fallback: 'Use flexbox with fixed widths',
        note: 'Calculate widths manually and use flex-basis'
      },
      'css-variables': {
        fallback: 'Use Sass variables or CSS custom properties plugin',
        note: 'Define fallback values in CSS'
      },
      'object-fit': {
        fallback: 'Use background-size on wrapper div',
        note: 'Wrap img in div and use background-image instead'
      },
      'position: sticky': {
        fallback: 'Use position: fixed with JavaScript',
        note: 'Calculate scroll position and toggle classes'
      }
    };
  }

  static generateCSSWithFallbacks(cssProperty, value) {
    const fallbacks = this.getCSSFallbacks();
    const prefixed = Chrome37Utils.generatePrefixedCSS(cssProperty, value);
    
    if (fallbacks[`${cssProperty}: ${value}`]) {
      const fallback = fallbacks[`${cssProperty}: ${value}`];
      return `/* Fallback for Chrome 37 */\n${fallback.fallback}\n/* Modern property */\n${prefixed}`;
    }
    
    return prefixed;
  }

  static getRecommendedCSSStructure() {
    return {
      'base.css': [
        '/* Reset and base styles */',
        'box-sizing: border-box for all elements',
        'Basic typography',
        'Color variables as classes (not CSS variables)'
      ],
      'layout.css': [
        '/* Layout utilities */',
        'Flexbox classes with prefixes',
        'Grid simulation with flexbox',
        'Spacing utilities'
      ],
      'components/': [
        '/* Component-specific CSS modules */',
        'Use .module.css extension',
        'Compose from base utilities',
        'Include fallbacks for unsupported features'
      ]
    };
  }

  static generateReactComponentTemplate(componentName, usesCSS = true) {
    const cssImport = usesCSS ? `import styles from './${componentName}.module.css';` : '';
    const className = usesCSS ? `className={styles.container}` : '';
    
    return `import React from 'react';
${cssImport}

// Compatible with Chrome 37 - using function component
function ${componentName}(props) {
  return (
    <div ${className}>
      {props.children}
    </div>
  );
}

export default ${componentName};`;
  }

  static generateCSSModuleTemplate(componentName) {
    return `.container {
  /* Use flexbox instead of grid for Chrome 37 */
  display: -webkit-flex;
  display: flex;
  -webkit-flex-direction: column;
  flex-direction: column;
}

.content {
  /* Use prefixed transforms */
  -webkit-transform: translateY(0);
  transform: translateY(0);
  -webkit-transition: transform 0.3s ease;
  transition: transform 0.3s ease;
}

.content:hover {
  -webkit-transform: translateY(-2px);
  transform: translateY(-2px);
}

/* Fallback for unsupported features */
.legacy {
  /* Instead of CSS variables, use fixed values */
  background-color: #f0f0f0;
  /* Instead of calc(), use fixed calculations */
  width: 300px; /* calc(100% - 20px) equivalent */
  margin: 0 10px;
}`;
  }

  static getWebpackConfig() {
    return {
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: this.generateReactBabelConfig()
            }
          },
          {
            test: /\.module\.css$/,
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: {
                  modules: {
                    localIdentName: '[name]__[local]__[hash:base64:5]'
                  }
                }
              },
              'postcss-loader'
            ]
          }
        ]
      },
      resolve: {
        extensions: ['.js', '.jsx']
      }
    };
  }
}