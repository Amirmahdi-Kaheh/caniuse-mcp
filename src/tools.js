import { CompatibilityChecker } from './compatibility-checker.js';
import { Chrome37Utils } from './chrome37-utils.js';
import { ReactCSSHelpers } from './react-css-helpers.js';

const checker = new CompatibilityChecker();

export const tools = [
  {
    name: "check_feature_support",
    description: "Check if a CSS or JavaScript feature is supported in Chrome 37",
    input_schema: {
      type: "object",
      properties: {
        feature: {
          type: "string",
          description: "The caniuse feature name (e.g., 'flexbox', 'css-grid', 'es6-arrow-functions')"
        }
      },
      required: ["feature"]
    }
  },
  {
    name: "check_multiple_features",
    description: "Check support for multiple CSS/JS features in Chrome 37 at once",
    input_schema: {
      type: "object",
      properties: {
        features: {
          type: "array",
          items: {
            type: "string"
          },
          description: "Array of caniuse feature names to check"
        }
      },
      required: ["features"]
    }
  },
  {
    name: "suggest_alternatives",
    description: "Get alternative solutions for features not supported in Chrome 37",
    input_schema: {
      type: "object",
      properties: {
        feature: {
          type: "string",
          description: "The caniuse feature name to get alternatives for"
        }
      },
      required: ["feature"]
    }
  },
  {
    name: "check_react_compatibility",
    description: "Check compatibility of React-specific features and patterns for Chrome 37",
    input_schema: {
      type: "object",
      properties: {
        features: {
          type: "array",
          items: {
            type: "string"
          },
          description: "React features to check (e.g., 'jsx', 'es6-class', 'arrow-functions', 'destructuring')"
        }
      },
      required: ["features"]
    }
  },
  {
    name: "check_css_modules_compatibility",
    description: "Check CSS features commonly used with CSS modules for Chrome 37 compatibility",
    input_schema: {
      type: "object",
      properties: {
        cssFeatures: {
          type: "array",
          items: {
            type: "string"
          },
          description: "CSS features to check (e.g., 'css-variables', 'css-grid', 'flexbox', 'css-transforms')"
        }
      },
      required: ["cssFeatures"]
    }
  },
  {
    name: "generate_css_fallbacks",
    description: "Generate CSS with fallbacks for Chrome 37 compatibility",
    input_schema: {
      type: "object",
      properties: {
        cssProperty: {
          type: "string",
          description: "The CSS property (e.g., 'transform', 'flex-direction')"
        },
        value: {
          type: "string", 
          description: "The CSS value"
        }
      },
      required: ["cssProperty", "value"]
    }
  },
  {
    name: "get_build_config",
    description: "Get recommended build configuration for React + CSS modules targeting Chrome 37",
    input_schema: {
      type: "object",
      properties: {
        configType: {
          type: "string",
          enum: ["babel", "postcss", "webpack", "all"],
          description: "Type of configuration to generate"
        }
      },
      required: ["configType"]
    }
  },
  {
    name: "generate_component_template",
    description: "Generate React component template with CSS modules compatible with Chrome 37",
    input_schema: {
      type: "object", 
      properties: {
        componentName: {
          type: "string",
          description: "Name of the React component"
        },
        includeCSS: {
          type: "boolean",
          description: "Whether to include CSS module import",
          default: true
        }
      },
      required: ["componentName"]
    }
  }
];

export async function handleTool(name, args) {
  switch (name) {
    case "check_feature_support":
      return await checker.checkFeatureSupport(args.feature);
      
    case "check_multiple_features":
      return await checker.checkMultipleFeatures(args.features);
      
    case "suggest_alternatives":
      return await checker.getSuggestionsForUnsupported(args.feature);
      
    case "check_react_compatibility":
      const reactFeatures = args.features || ['jsx', 'es6-class', 'arrow-functions', 'destructuring', 'const', 'let', 'template-literals'];
      const reactResult = await checker.checkMultipleFeatures(reactFeatures);
      return {
        ...reactResult,
        context: "React compatibility check for Chrome 37",
        recommendations: generateReactRecommendations(reactResult)
      };
      
    case "check_css_modules_compatibility":
      const cssFeatures = args.cssFeatures || ReactCSSHelpers.getCSSModulesFeatures();
      const cssResult = await checker.checkMultipleFeatures(cssFeatures);
      return {
        ...cssResult,
        context: "CSS Modules compatibility check for Chrome 37",
        recommendations: generateCSSRecommendations(cssResult)
      };
      
    case "generate_css_fallbacks":
      return {
        property: args.cssProperty,
        value: args.value,
        fallbackCSS: ReactCSSHelpers.generateCSSWithFallbacks(args.cssProperty, args.value),
        prefixedCSS: Chrome37Utils.generatePrefixedCSS(args.cssProperty, args.value)
      };
      
    case "get_build_config":
      const configs = {
        babel: ReactCSSHelpers.generateReactBabelConfig(),
        postcss: ReactCSSHelpers.generatePostCSSConfig(), 
        webpack: ReactCSSHelpers.getWebpackConfig(),
        all: {
          babel: ReactCSSHelpers.generateReactBabelConfig(),
          postcss: ReactCSSHelpers.generatePostCSSConfig(),
          webpack: ReactCSSHelpers.getWebpackConfig(),
          polyfills: ReactCSSHelpers.getReactPolyfills(),
          buildRecommendations: Chrome37Utils.getBuildRecommendations()
        }
      };
      return configs[args.configType] || configs.all;
      
    case "generate_component_template":
      return {
        componentName: args.componentName,
        jsTemplate: ReactCSSHelpers.generateReactComponentTemplate(args.componentName, args.includeCSS !== false),
        cssTemplate: ReactCSSHelpers.generateCSSModuleTemplate(args.componentName),
        compatibilityNotes: Chrome37Utils.getReactCompatibilityTips()
      };
      
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function generateReactRecommendations(result) {
  const recommendations = [];
  
  if (result.unsupported.some(f => ['arrow-functions', 'const', 'let'].includes(f.feature))) {
    recommendations.push("Consider using Babel to transpile ES6+ features for Chrome 37 compatibility");
  }
  
  if (result.unsupported.some(f => f.feature === 'jsx')) {
    recommendations.push("Ensure JSX is properly transpiled to React.createElement calls");
  }
  
  if (result.unsupported.length > 0) {
    recommendations.push("Review your build process to ensure all modern JavaScript features are transpiled");
  }
  
  return recommendations;
}

function generateCSSRecommendations(result) {
  const recommendations = [];
  
  if (result.unsupported.some(f => f.feature === 'css-grid')) {
    recommendations.push("Use flexbox or float-based layouts instead of CSS Grid");
  }
  
  if (result.unsupported.some(f => f.feature === 'css-variables')) {
    recommendations.push("Use Sass/Less variables or PostCSS for dynamic styling");
  }
  
  if (result.unsupported.some(f => f.feature === 'flexbox')) {
    recommendations.push("Consider using CSS tables or float-based layouts with clearfix");
  }
  
  if (result.unsupported.length > 0) {
    recommendations.push("Consider using PostCSS with autoprefixer for better browser support");
  }
  
  return recommendations;
}