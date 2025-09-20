import { CanIUseClient } from './caniuse-client.js';
import { ConfigManager } from './config-manager.js';

export class CompatibilityChecker {
  constructor(projectPath = '.') {
    this.client = new CanIUseClient(projectPath);
    this.configManager = new ConfigManager(projectPath);
    this.targetBrowser = 'chrome';
    this.targetVersion = '37';
  }

  async checkFeatureSupport(featureName, targetString = null) {
    try {
      // Use targetString if provided, otherwise use legacy default
      const target = targetString || `${this.targetBrowser}-${this.targetVersion}`;
      const result = await this.client.checkFeatureSupportForTarget(featureName, target);
      const config = await this.configManager.resolveTargetVersion(target);
      
      return {
        feature: featureName,
        browser: config.browser,
        version: config.version,
        supported: result.supported,
        status: result.type,
        description: result.description,
        source: result.source,
        rawValue: result.rawValue,
        originalSupport: result.originalSupport,
        // Legacy compatibility fields
        featureTitle: featureName,
        featureDescription: result.description
      };
    } catch (error) {
      return {
        feature: featureName,
        browser: this.targetBrowser,
        version: this.targetVersion,
        supported: false,
        status: 'error',
        description: error.message,
        error: true
      };
    }
  }

  async checkMultipleFeatures(featureNames) {
    const results = await Promise.all(
      featureNames.map(feature => this.checkFeatureSupport(feature))
    );
    
    const supported = results.filter(r => r.supported && !r.error);
    const unsupported = results.filter(r => !r.supported && !r.error);
    const errors = results.filter(r => r.error);
    
    return {
      summary: {
        total: results.length,
        supported: supported.length,
        unsupported: unsupported.length,
        errors: errors.length
      },
      results,
      supported,
      unsupported,
      errors
    };
  }

  getAlternatives(featureName) {
    const alternatives = {
      'flexbox': ['float layouts', 'CSS tables', 'inline-block'],
      'css-grid': ['flexbox', 'float layouts', 'CSS tables'],
      'css-variables': ['Sass variables', 'Less variables', 'PostCSS custom properties'],
      'css-snappoints': ['JavaScript scroll libraries', 'manual scroll handling'],
      'object-fit': ['background-size on div wrappers', 'manual image cropping'],
      'css-sticky': ['JavaScript scroll positioning', 'fixed positioning'],
      'css-filters': ['SVG filters', 'Canvas manipulation', 'image processing libraries'],
      'css-masks': ['SVG clipping paths', 'background images with transparency'],
      'transform3d': ['2D transforms', 'JavaScript animation libraries'],
      'css-animation': ['jQuery animations', 'JavaScript animation libraries'],
      'css-transitions': ['jQuery animations', 'JavaScript animation libraries']
    };
    
    return alternatives[featureName] || ['Consider using a polyfill', 'Use progressive enhancement', 'Implement JavaScript fallback'];
  }

  async getSuggestionsForUnsupported(featureName) {
    const result = await this.checkFeatureSupport(featureName);
    
    if (result.supported) {
      return {
        feature: featureName,
        needsAlternatives: false,
        message: `${featureName} is supported in Chrome 37`,
        result
      };
    }
    
    const alternatives = this.getAlternatives(featureName);
    
    return {
      feature: featureName,
      needsAlternatives: true,
      message: `${featureName} is not supported in Chrome 37. Consider these alternatives:`,
      alternatives,
      result
    };
  }
}