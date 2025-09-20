import { CanIUseClient } from './caniuse-client.js';
import { ProjectScanner } from './project-scanner.js';
import { ConfigManager } from './config-manager.js';

export class EnhancedCompatibilityChecker {
  constructor(projectPath = '.') {
    this.client = new CanIUseClient(projectPath);
    this.scanner = new ProjectScanner();
    this.configManager = new ConfigManager(projectPath);
  }

  async checkProjectCompatibility(projectPath, options = {}) {
    const config = await this.configManager.loadConfig();
    const {
      targets = [config.defaultBaseline],
      scanOptions = {},
      includeRecommendations = true
    } = options;

    // Scan project for features
    const scanResult = await this.scanner.scanDirectory(projectPath, scanOptions);
    
    if (scanResult.featuresArray.length === 0) {
      return {
        status: 'no-features-detected',
        message: 'No detectable CSS/JS features found in project',
        scannedFiles: scanResult.summary.totalFiles,
        suggestions: [
          'Ensure files have supported extensions (.js, .jsx, .css, etc.)',
          'Check if files contain recognizable feature patterns',
          'Try scanning specific files with scan_files tool'
        ]
      };
    }

    // Check compatibility for all detected features across all targets
    const compatibilityResults = {};
    
    for (const target of targets) {
      try {
        const results = await this._checkFeaturesForTarget(scanResult.featuresArray, target);
        const browserConfig = await this.configManager.resolveTargetVersion(target);
        
        compatibilityResults[target] = {
          ...results,
          browserInfo: browserConfig
        };
      } catch (error) {
        console.warn(`Error checking target ${target}: ${error.message}`);
        compatibilityResults[target] = {
          error: true,
          message: error.message,
          browserInfo: { browser: 'unknown', version: 'unknown' }
        };
      }
    }

    const summary = this._generateCompatibilitySummary(compatibilityResults, targets);
    
    return {
      projectScan: {
        totalFiles: scanResult.summary.totalFiles,
        jsFiles: scanResult.summary.jsFiles,
        cssFiles: scanResult.summary.cssFiles,
        featuresDetected: scanResult.featuresArray.length
      },
      features: scanResult.featuresArray,
      featureDetails: scanResult.features,
      compatibility: compatibilityResults,
      summary,
      recommendations: includeRecommendations ? this._generateRecommendations(summary, scanResult) : null,
      nextSteps: this._generateNextSteps(summary)
    };
  }

  async checkSpecificFeatures(features, options = {}) {
    const config = await this.configManager.loadConfig();
    const { targets = [config.defaultBaseline] } = options;
    const results = {};
    
    for (const target of targets) {
      try {
        results[target] = await this._checkFeaturesForTarget(features, target);
      } catch (error) {
        console.warn(`Error checking target ${target}: ${error.message}`);
        results[target] = {
          error: true,
          message: error.message,
          total: features.length,
          supported: 0,
          unsupported: features.length,
          errors: features.length
        };
      }
    }
    
    return {
      features,
      compatibility: results,
      summary: this._generateCompatibilitySummary(results, targets)
    };
  }

  async _checkFeaturesForTarget(features, targetString) {
    const results = await Promise.all(
      features.map(async (feature) => {
        try {
          const result = await this.client.checkFeatureSupportForTarget(feature, targetString);
          
          return {
            feature,
            supported: result.supported,
            status: result.type,
            description: result.description,
            source: result.source,
            rawValue: result.rawValue,
            originalSupport: result.originalSupport // For polyfilled features
          };
        } catch (error) {
          return {
            feature,
            supported: false,
            status: 'error',
            description: `Could not check feature: ${error.message}`,
            source: 'error',
            error: true
          };
        }
      })
    );
    
    const supported = results.filter(r => r.supported && !r.error);
    const unsupported = results.filter(r => !r.supported && !r.error);
    const errors = results.filter(r => r.error);
    const polyfilled = results.filter(r => r.source === 'polyfill');
    const overridden = results.filter(r => r.source === 'config-override');
    
    return {
      total: results.length,
      supported: supported.length,
      unsupported: unsupported.length,
      errors: errors.length,
      polyfilled: polyfilled.length,
      overridden: overridden.length,
      supportedFeatures: supported.map(r => r.feature),
      unsupportedFeatures: unsupported.map(r => r.feature),
      errorFeatures: errors.map(r => r.feature),
      polyfilledFeatures: polyfilled.map(r => r.feature),
      overriddenFeatures: overridden.map(r => r.feature),
      details: results
    };
  }

  _generateCompatibilitySummary(compatibilityResults, targets) {
    const summary = {
      overallScore: 0,
      targets: {},
      criticalIssues: [],
      commonUnsupported: []
    };
    
    let totalSupported = 0;
    let totalFeatures = 0;
    
    for (const target of targets) {
      const result = compatibilityResults[target];
      if (!result) continue;
      
      const score = result.total > 0 ? Math.round((result.supported / result.total) * 100) : 100;
      summary.targets[target] = {
        score,
        supported: result.supported,
        unsupported: result.unsupported,
        issues: result.unsupportedFeatures
      };
      
      totalSupported += result.supported;
      totalFeatures += result.total;
      
      // Track features unsupported in this target
      result.unsupportedFeatures.forEach(feature => {
        const existing = summary.criticalIssues.find(issue => issue.feature === feature);
        if (existing) {
          existing.targets.push(target);
        } else {
          summary.criticalIssues.push({
            feature,
            targets: [target]
          });
        }
      });
    }
    
    summary.overallScore = totalFeatures > 0 ? Math.round((totalSupported / totalFeatures / targets.length) * 100) : 100;
    
    // Find features unsupported in all targets
    summary.commonUnsupported = summary.criticalIssues
      .filter(issue => issue.targets.length === targets.length)
      .map(issue => issue.feature);
    
    return summary;
  }

  _generateRecommendations(summary, scanResult) {
    const recommendations = [];
    
    // Overall score recommendations
    if (summary.overallScore < 70) {
      recommendations.push({
        type: 'critical',
        title: 'Low Compatibility Score',
        message: `${summary.overallScore}% compatibility. Consider using build tools to transpile/polyfill unsupported features.`,
        action: 'Run get_fixes tool for specific remediation steps'
      });
    } else if (summary.overallScore < 90) {
      recommendations.push({
        type: 'warning', 
        title: 'Moderate Compatibility Issues',
        message: `${summary.overallScore}% compatibility. Some features may need polyfills or fallbacks.`,
        action: 'Review unsupported features and implement fallbacks'
      });
    }
    
    // Feature-specific recommendations
    const categorized = this.scanner.categorizeFeatures(summary.commonUnsupported);
    
    if (categorized.critical.length > 0) {
      recommendations.push({
        type: 'critical',
        title: 'Critical Features Unsupported',
        message: `These essential features are unsupported: ${categorized.critical.join(', ')}`,
        action: 'Implement polyfills or use alternative approaches immediately'
      });
    }
    
    if (categorized.high.length > 0) {
      recommendations.push({
        type: 'warning',
        title: 'Important Features Need Attention',
        message: `These features need fallbacks: ${categorized.high.join(', ')}`,
        action: 'Add vendor prefixes and fallback implementations'
      });
    }
    
    return recommendations;
  }

  _generateNextSteps(summary) {
    const steps = [];
    
    if (summary.commonUnsupported.length > 0) {
      steps.push({
        step: 1,
        title: 'Get specific fixes',
        command: `Use get_fixes tool with features: ${summary.commonUnsupported.slice(0, 3).join(', ')}`,
        priority: 'high'
      });
    }
    
    if (summary.overallScore < 80) {
      steps.push({
        step: 2,
        title: 'Generate build configuration',
        command: 'Use generate_configs tool to create Babel/PostCSS configs with polyfills',
        priority: 'high'
      });
    }
    
    steps.push({
      step: steps.length + 1,
      title: 'Set up development workflow',
      command: 'Use generate_configs tool with type="workflow" for CI/CD and Git hooks',
      priority: 'medium'
    });
    
    return steps;
  }

  async getSupportedBrowserTargets() {
    const targets = await this.configManager.getBrowserTargets();
    return Object.keys(targets).map(key => ({
      id: key,
      ...targets[key],
      description: this._getBrowserDescription(key)
    }));
  }

  _getBrowserDescription(targetId) {
    const descriptions = {
      'chrome-37': 'Chrome 37 (Legacy Android support)',
      'chrome-latest': 'Latest Chrome (Modern features)',
      'firefox-esr': 'Firefox ESR (Enterprise support)',
      'safari-12': 'Safari 12 (iOS 12+ compatibility)',
      'ie-11': 'Internet Explorer 11 (Legacy Windows)',
      'edge-legacy': 'Edge Legacy (Pre-Chromium Edge)'
    };
    return descriptions[targetId] || targetId;
  }
}