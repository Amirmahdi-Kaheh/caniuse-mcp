import fetch from 'node-fetch';
import { ConfigManager } from './config-manager.js';

export class CanIUseClient {
  constructor(projectPath = '.') {
    this.baseUrl = 'https://caniuse.com/process/get_feat_data.php';
    this.cache = new Map();
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
    this.configManager = new ConfigManager(projectPath);
  }

  async getFeatureData(featureName) {
    const cacheKey = featureName;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      const url = `${this.baseUrl}?type=support-data&feat=${featureName}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch feature data: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data || data.length === 0) {
        throw new Error(`No data found for feature: ${featureName}`);
      }

      this.cache.set(cacheKey, {
        data: data[0],
        timestamp: Date.now()
      });
      
      return data[0];
    } catch (error) {
      throw new Error(`Error fetching caniuse data for ${featureName}: ${error.message}`);
    }
  }

  async getBrowserSupport(featureData, browser, version) {
    if (!featureData.stats || !featureData.stats[browser]) {
      return null;
    }
    
    // Try exact version first
    if (featureData.stats[browser][version]) {
      return featureData.stats[browser][version];
    }
    
    // If exact version not found, try fallback versions
    const fallbackVersions = await this.configManager.getFallbackVersions(browser);
    for (const fallbackVersion of fallbackVersions) {
      if (featureData.stats[browser][fallbackVersion]) {
        return featureData.stats[browser][fallbackVersion];
      }
    }
    
    // If still not found, try to find closest version
    const availableVersions = Object.keys(featureData.stats[browser] || {});
    if (availableVersions.length > 0) {
      // Sort versions and try to find closest
      const numericVersions = availableVersions
        .map(v => ({ version: v, numeric: parseFloat(v) }))
        .filter(v => !isNaN(v.numeric))
        .sort((a, b) => a.numeric - b.numeric);
        
      const targetNumeric = parseFloat(version);
      if (!isNaN(targetNumeric)) {
        // Find closest version that's less than or equal to target
        let closest = null;
        for (const v of numericVersions) {
          if (v.numeric <= targetNumeric) {
            closest = v.version;
          } else {
            break;
          }
        }
        
        if (closest && featureData.stats[browser][closest]) {
          return featureData.stats[browser][closest];
        }
      }
      
      // Fallback to lowest available version
      const lowestVersion = numericVersions[0]?.version;
      if (lowestVersion && featureData.stats[browser][lowestVersion]) {
        return featureData.stats[browser][lowestVersion];
      }
    }
    
    return null;
  }

  getSupportStatus(supportValue) {
    const statusMap = {
      'y': { supported: true, type: 'full', description: 'Full support' },
      'a': { supported: true, type: 'partial', description: 'Partial support' },
      'n': { supported: false, type: 'none', description: 'No support' },
      'd': { supported: false, type: 'disabled', description: 'Disabled by default' },
      'p': { supported: false, type: 'polyfill', description: 'Requires polyfill' },
      'u': { supported: false, type: 'unknown', description: 'Support unknown' }
    };
    
    return statusMap[supportValue] || { supported: false, type: 'unknown', description: 'Unknown support status' };
  }

  async getFeatureSupportWithConfig(featureName, browser, version) {
    try {
      // Check for feature override first
      const override = await this.configManager.getFeatureOverride(featureName);
      if (override) {
        return {
          supported: override === 'supported',
          type: override === 'supported' ? 'override' : 'override-disabled',
          description: override === 'supported' ? 'Forced supported by configuration' : 'Forced unsupported by configuration',
          source: 'config-override'
        };
      }

      // Get normal support data first
      const featureData = await this.getFeatureData(featureName);
      const supportValue = await this.getBrowserSupport(featureData, browser, version);
      const status = this.getSupportStatus(supportValue || 'n');
      
      // Check if feature is polyfilled
      const isPolyfilled = await this.configManager.isFeaturePolyfilled(featureName);
      
      // If feature is polyfilled and originally unsupported, mark as supported
      if (isPolyfilled && !status.supported) {
        return {
          supported: true,
          type: 'polyfilled',
          description: 'Supported via polyfill',
          originalSupport: status,
          source: 'polyfill',
          rawValue: supportValue
        };
      }
      
      return {
        ...status,
        source: 'caniuse-data',
        rawValue: supportValue
      };
      
    } catch (error) {
      return {
        supported: false,
        type: 'error',
        description: `Error checking support: ${error.message}`,
        source: 'error'
      };
    }
  }

  async checkFeatureSupportForTarget(featureName, targetString) {
    const targetConfig = await this.configManager.resolveTargetVersion(targetString);
    return await this.getFeatureSupportWithConfig(featureName, targetConfig.browser, targetConfig.version);
  }
}