export class Chrome37Utils {
  static getKnownIssues() {
    return {
      'flexbox': {
        issues: ['Flex shorthand not supported', 'Some flex properties have different behavior'],
        workarounds: ['Use longhand flex properties', 'Test flex layouts thoroughly']
      },
      'css-grid': {
        issues: ['Not supported at all'],
        workarounds: ['Use flexbox or CSS tables', 'Consider float-based layouts']
      },
      'css-variables': {
        issues: ['Custom properties not supported'],
        workarounds: ['Use Sass/Less variables', 'Use PostCSS custom properties plugin']
      },
      'object-fit': {
        issues: ['Not supported'],
        workarounds: ['Use background-size on wrapper divs', 'Use JavaScript polyfills']
      },
      'css-sticky': {
        issues: ['position: sticky not supported'],
        workarounds: ['Use JavaScript scroll event handling', 'Use position: fixed with calculations']
      }
    };
  }

  static getRecommendedPolyfills() {
    return {
      'flexbox': ['flexibility.js', 'flexie'],
      'css-grid': ['CSS Grid Polyfill'],
      'css-variables': ['css-vars-ponyfill'],
      'object-fit': ['object-fit-images'],
      'css-sticky': ['stickyfill'],
      'intersection-observer': ['intersection-observer-polyfill'],
      'es6-features': ['babel-polyfill', 'core-js']
    };
  }

  static getCSSPrefixes() {
    return {
      'transform': ['-webkit-transform', 'transform'],
      'transition': ['-webkit-transition', 'transition'],
      'animation': ['-webkit-animation', 'animation'],
      'box-sizing': ['-webkit-box-sizing', 'box-sizing'],
      'border-radius': ['-webkit-border-radius', 'border-radius'],
      'box-shadow': ['-webkit-box-shadow', 'box-shadow'],
      'linear-gradient': ['-webkit-linear-gradient', 'linear-gradient'],
      'flex': ['-webkit-flex', 'flex'],
      'flex-direction': ['-webkit-flex-direction', 'flex-direction'],
      'justify-content': ['-webkit-justify-content', 'justify-content'],
      'align-items': ['-webkit-align-items', 'align-items']
    };
  }

  static generatePrefixedCSS(property, value) {
    const prefixes = this.getCSSPrefixes();
    const propertyPrefixes = prefixes[property];
    
    if (!propertyPrefixes) {
      return `${property}: ${value};`;
    }
    
    return propertyPrefixes
      .map(prefixedProp => `${prefixedProp}: ${value};`)
      .join('\n');
  }

  static getUnsupportedFeatures() {
    return [
      'css-grid',
      'css-variables',
      'css-sticky',
      'object-fit',
      'css-snappoints',
      'css-masks',
      'css-clip-path',
      'css-backdrop-filter',
      'css-logical-props',
      'css-containment',
      'css-scroll-behavior',
      'intersection-observer',
      'es6-modules',
      'es6-destructuring',
      'es6-spread',
      'es6-rest-parameters',
      'es6-default-parameters'
    ];
  }

  static getSafeFeatures() {
    return [
      'css3-boxsizing',
      'border-radius',
      'css-gradients',
      'css3-colors',
      'transforms2d',
      'css-transitions',
      'css-animation',
      'flexbox', // partial support
      'css-mediaqueries',
      'css-sel3',
      'css-textshadow',
      'css-opacity'
    ];
  }

  static getReactCompatibilityTips() {
    return {
      jsx: {
        supported: true,
        note: 'JSX needs to be transpiled to React.createElement calls'
      },
      es6Classes: {
        supported: false,
        alternative: 'Use React.createClass or function components with hooks polyfill'
      },
      arrowFunctions: {
        supported: false,
        alternative: 'Use regular function expressions, transpile with Babel'
      },
      destructuring: {
        supported: false,
        alternative: 'Access props directly, use Babel for transpilation'
      },
      spread: {
        supported: false,
        alternative: 'Use Object.assign or manual property assignment'
      }
    };
  }

  static getBuildRecommendations() {
    return {
      babel: {
        presets: ['@babel/preset-env', '@babel/preset-react'],
        targets: { chrome: '37' },
        useBuiltIns: 'usage',
        corejs: 3
      },
      postcss: {
        plugins: ['autoprefixer'],
        browsers: ['Chrome >= 37']
      },
      polyfills: [
        'core-js/stable',
        'regenerator-runtime/runtime'
      ]
    };
  }
}