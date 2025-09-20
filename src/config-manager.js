import fs from 'fs';
import path from 'path';

export class ConfigManager {
  constructor(projectPath = '.') {
    this.projectPath = projectPath;
    this.config = null;
    this.defaultConfig = {
      defaultBaseline: 'chrome-37',
      customTargets: {},
      polyfills: [],
      overrides: {},
      browserFallbacks: {
        chrome: ['37'], // fallback versions if specific version not found
        firefox: ['78'],
        safari: ['12'],
        ie: ['11'],
        edge: ['18']
      }
    };
  }

  async loadConfig() {
    if (this.config) return this.config;

    // Try to load from file first
    const configPath = path.join(this.projectPath, '.caniuse-config.json');
    let fileConfig = {};
    
    try {
      if (fs.existsSync(configPath)) {
        const configContent = await fs.promises.readFile(configPath, 'utf8');
        fileConfig = JSON.parse(configContent);
      }
    } catch (error) {
      console.warn(`Warning: Could not load config from ${configPath}: ${error.message}`);
    }

    // Merge with environment variables
    const envConfig = this._loadFromEnvironment();

    // Merge all configurations: default < file < environment
    this.config = {
      ...this.defaultConfig,
      ...fileConfig,
      ...envConfig,
      // Merge nested objects properly
      customTargets: {
        ...this.defaultConfig.customTargets,
        ...fileConfig.customTargets,
        ...envConfig.customTargets
      },
      polyfills: [
        ...this.defaultConfig.polyfills,
        ...(fileConfig.polyfills || []),
        ...(envConfig.polyfills || [])
      ],
      overrides: {
        ...this.defaultConfig.overrides,
        ...fileConfig.overrides,
        ...envConfig.overrides
      },
      browserFallbacks: {
        ...this.defaultConfig.browserFallbacks,
        ...fileConfig.browserFallbacks,
        ...envConfig.browserFallbacks
      }
    };

    return this.config;
  }

  _loadFromEnvironment() {
    const envConfig = {};
    
    if (process.env.CANIUSE_DEFAULT_BASELINE) {
      envConfig.defaultBaseline = process.env.CANIUSE_DEFAULT_BASELINE;
    }
    
    if (process.env.CANIUSE_POLYFILLS) {
      try {
        envConfig.polyfills = JSON.parse(process.env.CANIUSE_POLYFILLS);
      } catch (error) {
        envConfig.polyfills = process.env.CANIUSE_POLYFILLS.split(',').map(p => p.trim());
      }
    }
    
    if (process.env.CANIUSE_OVERRIDES) {
      try {
        envConfig.overrides = JSON.parse(process.env.CANIUSE_OVERRIDES);
      } catch (error) {
        console.warn('Invalid CANIUSE_OVERRIDES environment variable format');
      }
    }

    return envConfig;
  }

  async getBrowserTargets() {
    const config = await this.loadConfig();
    
    // Built-in targets
    const builtInTargets = {
      'chrome-37': { browser: 'chrome', version: '37' },
      'chrome-latest': { browser: 'chrome', version: 'latest' },
      'firefox-esr': { browser: 'firefox', version: '78' },
      'safari-12': { browser: 'safari', version: '12' },
      'ie-11': { browser: 'ie', version: '11' },
      'edge-legacy': { browser: 'edge', version: '18' }
    };

    // Merge with custom targets
    return {
      ...builtInTargets,
      ...config.customTargets
    };
  }

  async resolveTargetVersion(targetString) {
    const config = await this.loadConfig();
    const targets = await this.getBrowserTargets();
    
    // Check if it's a known target
    if (targets[targetString]) {
      return targets[targetString];
    }
    
    // Try to parse browser-version format (e.g., "chrome-57")
    const match = targetString.match(/^([a-z]+)-(.+)$/);
    if (match) {
      const [, browser, version] = match;
      return { browser, version };
    }
    
    // Fallback to default baseline
    const defaultTarget = targets[config.defaultBaseline];
    if (defaultTarget) {
      return defaultTarget;
    }
    
    // Final fallback
    return { browser: 'chrome', version: '37' };
  }

  async isFeaturePolyfilled(featureName) {
    const config = await this.loadConfig();
    return config.polyfills.includes(featureName);
  }

  async getFeatureOverride(featureName) {
    const config = await this.loadConfig();
    return config.overrides[featureName];
  }

  async getFallbackVersions(browser) {
    const config = await this.loadConfig();
    return config.browserFallbacks[browser] || [];
  }

  async updateConfig(updates) {
    const config = await this.loadConfig();
    const newConfig = { ...config, ...updates };
    
    const configPath = path.join(this.projectPath, '.caniuse-config.json');
    await fs.promises.writeFile(configPath, JSON.stringify(newConfig, null, 2));
    
    // Reload config
    this.config = null;
    return await this.loadConfig();
  }

  async addPolyfill(featureName) {
    const config = await this.loadConfig();
    if (!config.polyfills.includes(featureName)) {
      config.polyfills.push(featureName);
      await this.updateConfig({ polyfills: config.polyfills });
    }
  }

  async removePolyfill(featureName) {
    const config = await this.loadConfig();
    const index = config.polyfills.indexOf(featureName);
    if (index > -1) {
      config.polyfills.splice(index, 1);
      await this.updateConfig({ polyfills: config.polyfills });
    }
  }

  async setFeatureOverride(featureName, supportStatus) {
    const config = await this.loadConfig();
    config.overrides[featureName] = supportStatus;
    await this.updateConfig({ overrides: config.overrides });
  }

  // Helper to create a config file template
  static async createConfigTemplate(projectPath) {
    const configPath = path.join(projectPath, '.caniuse-config.json');
    const template = {
      "$schema": "https://json-schema.org/draft-07/schema#",
      "$comment": "CanIUse MCP Configuration",
      "defaultBaseline": "chrome-37",
      "customTargets": {
        "chrome-57": { "browser": "chrome", "version": "57" },
        "chrome-60": { "browser": "chrome", "version": "60" }
      },
      "polyfills": [
        "css-grid",
        "flexbox",
        "promises"
      ],
      "overrides": {
        "css-variables": "supported"
      },
      "browserFallbacks": {
        "chrome": ["37", "40", "45"],
        "firefox": ["78", "68"],
        "safari": ["12", "11"],
        "ie": ["11"],
        "edge": ["18", "16"]
      }
    };
    
    await fs.promises.writeFile(configPath, JSON.stringify(template, null, 2));
    return configPath;
  }
}