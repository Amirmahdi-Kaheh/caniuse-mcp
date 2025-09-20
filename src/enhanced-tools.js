import { EnhancedCompatibilityChecker } from './enhanced-compatibility-checker.js';
import { FixGenerator } from './fix-generator.js';
import { ProjectScanner } from './project-scanner.js';
import { ConfigManager } from './config-manager.js';

const compatibilityChecker = new EnhancedCompatibilityChecker();
const fixGenerator = new FixGenerator();
const projectScanner = new ProjectScanner();
const configManager = new ConfigManager();

export const enhancedTools = [
  {
    name: "scan_project",
    description: "Analyze project files to detect CSS/JS features and check compatibility across browser targets",
    input_schema: {
      type: "object",
      properties: {
        projectPath: {
          type: "string",
          description: "Path to the project directory to scan (default: current directory)",
          default: "."
        },
        targets: {
          type: "array",
          items: { type: "string" },
          description: "Browser targets to check (e.g., 'chrome-37', 'firefox-esr', 'safari-12')",
          default: ["chrome-37"]
        },
        maxDepth: {
          type: "number", 
          description: "Maximum directory depth to scan",
          default: 5
        },
        excludeDirs: {
          type: "array",
          items: { type: "string" },
          description: "Directories to exclude from scanning",
          default: ["node_modules", ".git", "dist", "build"]
        }
      },
      required: []
    }
  },
  {
    name: "check_compatibility", 
    description: "Check specific features or files against multiple browser targets with detailed analysis",
    input_schema: {
      type: "object",
      properties: {
        features: {
          type: "array",
          items: { type: "string" },
          description: "Specific caniuse feature names to check (e.g., 'flexbox', 'css-grid')"
        },
        files: {
          type: "array",
          items: { type: "string" },
          description: "Specific file paths to analyze for features"
        },
        targets: {
          type: "array",
          items: { type: "string" }, 
          description: "Browser targets (chrome-37, firefox-esr, safari-12, ie-11, edge-legacy)",
          default: ["chrome-37"]
        }
      },
      required: []
    }
  },
  {
    name: "get_fixes",
    description: "Get actionable remediation steps, polyfills, and alternatives for unsupported features",
    input_schema: {
      type: "object",
      properties: {
        features: {
          type: "array",
          items: { type: "string" },
          description: "Features that need fixes (from compatibility check results)"
        },
        priority: {
          type: "string",
          enum: ["critical", "high", "medium", "low", "all"],
          description: "Filter fixes by priority level",
          default: "all"
        },
        includeExamples: {
          type: "boolean",
          description: "Include code examples in the response",
          default: true
        },
        includeCommands: {
          type: "boolean", 
          description: "Include terminal commands for installation/setup",
          default: true
        }
      },
      required: ["features"]
    }
  },
  {
    name: "generate_configs",
    description: "Generate complete build configurations, CI/CD setups, and workflow files for browser compatibility",
    input_schema: {
      type: "object",
      properties: {
        configType: {
          type: "string",
          enum: ["babel", "postcss", "webpack", "package-json", "ci", "git-hooks", "all"],
          description: "Type of configuration to generate",
          default: "all"
        },
        target: {
          type: "string",
          description: "Primary browser target for configuration",
          default: "chrome-37"
        },
        includePolyfills: {
          type: "boolean",
          description: "Include polyfill configurations",
          default: true
        },
        projectType: {
          type: "string",
          enum: ["react", "vanilla-js", "vue", "angular"],
          description: "Project framework type",
          default: "react"
        }
      },
      required: []
    }
  },
  {
    name: "manage_config",
    description: "Configure browser baselines, polyfills, and feature overrides for more accurate compatibility checking",
    input_schema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["view", "set_baseline", "add_polyfill", "remove_polyfill", "set_override", "add_target", "create_template", "reset"],
          description: "Configuration action to perform",
          default: "view"
        },
        baseline: {
          type: "string",
          description: "Set default baseline browser target (e.g., 'chrome-37', 'chrome-57')"
        },
        polyfill: {
          type: "string",
          description: "Feature name to add/remove from polyfills list"
        },
        feature: {
          type: "string",
          description: "Feature name for override setting"
        },
        override: {
          type: "string",
          enum: ["supported", "unsupported"],
          description: "Force feature support status"
        },
        targetName: {
          type: "string",
          description: "Custom target name (e.g., 'chrome-57')"
        },
        browser: {
          type: "string",
          description: "Browser name for custom target"
        },
        version: {
          type: "string",
          description: "Browser version for custom target"
        }
      },
      required: []
    }
  }
];

export async function handleEnhancedTool(name, args) {
  try {
    switch (name) {
      case "scan_project":
        return await handleScanProject(args);
        
      case "check_compatibility":
        return await handleCheckCompatibility(args);
        
      case "get_fixes":
        return handleGetFixes(args);
        
      case "generate_configs":
        return handleGenerateConfigs(args);
        
      case "manage_config":
        return await handleManageConfig(args);
        
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      error: true,
      message: error.message,
      suggestion: "Check the input parameters and try again. Use 'scan_project' first to detect features automatically."
    };
  }
}

async function handleScanProject(args) {
  const {
    projectPath = '.',
    targets = ['chrome-37'],
    maxDepth = 5,
    excludeDirs = ['node_modules', '.git', 'dist', 'build']
  } = args;

  const scanOptions = {
    maxDepth,
    excludeDirs
  };

  const result = await compatibilityChecker.checkProjectCompatibility(
    projectPath, 
    { targets, scanOptions, includeRecommendations: true }
  );

  // Format for better UX
  return {
    status: result.status || 'completed',
    project: {
      path: projectPath,
      scanned: `${result.projectScan?.totalFiles || 0} files`,
      jsFiles: result.projectScan?.jsFiles || 0,
      cssFiles: result.projectScan?.cssFiles || 0,
      featuresDetected: result.features?.length || 0
    },
    compatibility: {
      targets: Object.keys(result.compatibility || {}),
      overallScore: result.summary?.overallScore || 100,
      criticalIssues: result.summary?.criticalIssues?.length || 0,
      commonUnsupported: result.summary?.commonUnsupported || []
    },
    recommendations: result.recommendations || [],
    nextSteps: result.nextSteps || [],
    detailedResults: {
      features: result.features,
      targetResults: result.compatibility,
      summary: result.summary
    }
  };
}

async function handleCheckCompatibility(args) {
  const { features, files, targets = ['chrome-37'] } = args;

  let featuresToCheck = features || [];

  // If files are provided, scan them for features
  if (files && files.length > 0) {
    const scanResults = await projectScanner.scanSpecificFiles(files);
    const detectedFeatures = [...new Set(scanResults.flatMap(r => r.features))];
    featuresToCheck = [...new Set([...featuresToCheck, ...detectedFeatures])];
  }

  if (featuresToCheck.length === 0) {
    return {
      status: 'no-features',
      message: 'No features specified or detected in files',
      suggestion: 'Either provide specific features to check, or use scan_project to auto-detect features',
      availableTargets: compatibilityChecker.getSupportedBrowserTargets()
    };
  }

  const result = await compatibilityChecker.checkSpecificFeatures(featuresToCheck, { targets });

  return {
    features: featuresToCheck,
    targets,
    compatibility: result.compatibility,
    summary: {
      overallScore: result.summary.overallScore,
      byTarget: result.summary.targets,
      unsupportedFeatures: result.summary.commonUnsupported
    },
    recommendations: result.summary.commonUnsupported.length > 0 
      ? [`Use get_fixes tool with features: ${result.summary.commonUnsupported.slice(0, 5).join(', ')}`]
      : ['All features are supported in the specified targets'],
    detailedResults: result
  };
}

function handleGetFixes(args) {
  const { features, priority = 'all', includeExamples = true, includeCommands = true } = args;

  if (!features || features.length === 0) {
    return {
      error: true,
      message: 'No features specified for fixes',
      suggestion: 'Provide an array of feature names that need fixes (from compatibility check results)'
    };
  }

  const result = fixGenerator.generateFixes(features, {
    priority,
    includeExamples,
    includeCommands
  });

  return {
    features,
    fixes: result.fixes,
    summary: result.summary,
    quickStart: result.quickStart,
    instructions: {
      step1: 'Review the fixes for each feature below',
      step2: 'Run the provided installation commands',
      step3: 'Follow the configuration instructions', 
      step4: 'Use generate_configs tool for complete build setup'
    }
  };
}

function handleGenerateConfigs(args) {
  const {
    configType = 'all',
    target = 'chrome-37', 
    includePolyfills = true,
    projectType = 'react'
  } = args;

  const result = fixGenerator.generateWorkflowConfig(configType, {
    target,
    includePolyfills,
    projectType
  });

  // Add installation instructions
  const installInstructions = [];
  
  if (configType === 'all' || configType === 'babel') {
    const babelConfig = configType === 'all' ? result.babel : result;
    if (babelConfig.installCommand) {
      installInstructions.push({
        step: 'Install Babel dependencies',
        command: babelConfig.installCommand
      });
    }
  }

  if (configType === 'all' || configType === 'postcss') {
    const postcssConfig = configType === 'all' ? result.postcss : result;
    if (postcssConfig.installCommand) {
      installInstructions.push({
        step: 'Install PostCSS dependencies', 
        command: postcssConfig.installCommand
      });
    }
  }

  return {
    configType,
    target,
    projectType,
    configs: result,
    installation: installInstructions,
    instructions: [
      '1. Run the installation commands above',
      '2. Create the configuration files with the provided content',
      '3. Update your package.json scripts if needed',
      '4. Test your build process',
      '5. Run compatibility checks again to verify fixes'
    ],
    nextSteps: [
      'Test the build configuration with your project',
      'Run scan_project again to verify compatibility improvements',
      'Set up CI/CD integration if not already done'
    ]
  };
}


async function handleManageConfig(args) {
  const { action = 'view', baseline, polyfill, feature, override, targetName, browser, version } = args;

  try {
    switch (action) {
      case 'view':
        const config = await configManager.loadConfig();
        const targets = await configManager.getBrowserTargets();
        return {
          action: 'view',
          currentConfig: {
            defaultBaseline: config.defaultBaseline,
            polyfills: config.polyfills,
            overrides: config.overrides,
            customTargets: config.customTargets
          },
          availableTargets: Object.keys(targets),
          instructions: {
            setBaseline: 'Use action="set_baseline" with baseline="chrome-57"',
            addPolyfill: 'Use action="add_polyfill" with polyfill="css-grid"',
            removePolyfill: 'Use action="remove_polyfill" with polyfill="css-grid"',
            setOverride: 'Use action="set_override" with feature="css-variables" and override="supported"',
            addTarget: 'Use action="add_target" with targetName="chrome-57", browser="chrome", version="57"',
            createTemplate: 'Use action="create_template" to create .caniuse-config.json file'
          }
        };

      case 'set_baseline':
        if (!baseline) {
          throw new Error('baseline parameter required for set_baseline action');
        }
        await configManager.updateConfig({ defaultBaseline: baseline });
        return {
          action: 'set_baseline',
          success: true,
          message: `Default baseline set to ${baseline}`,
          newBaseline: baseline
        };

      case 'add_polyfill':
        if (!polyfill) {
          throw new Error('polyfill parameter required for add_polyfill action');
        }
        await configManager.addPolyfill(polyfill);
        const updatedConfig = await configManager.loadConfig();
        return {
          action: 'add_polyfill',
          success: true,
          message: `Added ${polyfill} to polyfills list`,
          feature: polyfill,
          currentPolyfills: updatedConfig.polyfills
        };

      case 'remove_polyfill':
        if (!polyfill) {
          throw new Error('polyfill parameter required for remove_polyfill action');
        }
        await configManager.removePolyfill(polyfill);
        const configAfterRemoval = await configManager.loadConfig();
        return {
          action: 'remove_polyfill',
          success: true,
          message: `Removed ${polyfill} from polyfills list`,
          feature: polyfill,
          currentPolyfills: configAfterRemoval.polyfills
        };

      case 'set_override':
        if (!feature || !override) {
          throw new Error('feature and override parameters required for set_override action');
        }
        await configManager.setFeatureOverride(feature, override);
        return {
          action: 'set_override',
          success: true,
          message: `Set ${feature} override to ${override}`,
          feature,
          override
        };

      case 'add_target':
        if (!targetName || !browser || !version) {
          throw new Error('targetName, browser, and version parameters required for add_target action');
        }
        const currentConfig = await configManager.loadConfig();
        const newCustomTargets = {
          ...currentConfig.customTargets,
          [targetName]: { browser, version }
        };
        await configManager.updateConfig({ customTargets: newCustomTargets });
        return {
          action: 'add_target',
          success: true,
          message: `Added custom target ${targetName} (${browser} ${version})`,
          targetName,
          browserConfig: { browser, version }
        };

      case 'create_template':
        const templatePath = await ConfigManager.createConfigTemplate('.');
        return {
          action: 'create_template',
          success: true,
          message: 'Created .caniuse-config.json template file',
          configFile: templatePath,
          instructions: [
            'Edit the created .caniuse-config.json file to customize your settings',
            'Run manage_config with action="view" to see current configuration',
            'The configuration will be automatically loaded for all compatibility checks'
          ]
        };

      case 'reset':
        // Reset to default configuration
        await configManager.updateConfig({
          defaultBaseline: 'chrome-37',
          customTargets: {},
          polyfills: [],
          overrides: {}
        });
        return {
          action: 'reset',
          success: true,
          message: 'Configuration reset to defaults',
          newConfig: {
            defaultBaseline: 'chrome-37',
            customTargets: {},
            polyfills: [],
            overrides: {}
          }
        };

      default:
        throw new Error(`Unknown config action: ${action}`);
    }
  } catch (error) {
    return {
      action,
      error: true,
      message: error.message,
      suggestion: 'Check the action parameter and required fields. Use action="view" to see available options.'
    };
  }
}