import { readFile, readdir, stat } from 'fs/promises';
import { join, extname } from 'path';

export class ProjectScanner {
  constructor() {
    this.cssFeaturePatterns = {
      'css-grid': [/display:\s*grid/i, /grid-template/i, /grid-area/i, /grid-column/i, /grid-row/i],
      'flexbox': [/display:\s*flex/i, /justify-content/i, /align-items/i, /flex-direction/i, /flex-wrap/i],
      'css-variables': [/var\(--[\w-]+\)/i, /--[\w-]+:/i],
      'css-sticky': [/position:\s*sticky/i],
      'object-fit': [/object-fit:/i],
      'css-transforms': [/transform:/i, /-webkit-transform:/i],
      'css-transitions': [/transition:/i, /-webkit-transition:/i],
      'css-animation': [/animation:/i, /@keyframes/i, /-webkit-animation:/i],
      'css-filters': [/filter:/i, /-webkit-filter:/i],
      'css-masks': [/mask:/i, /-webkit-mask:/i],
      'css-clip-path': [/clip-path:/i, /-webkit-clip-path:/i],
      'border-radius': [/border-radius:/i, /-webkit-border-radius:/i],
      'calc': [/calc\(/i],
      'css-gradients': [/linear-gradient/i, /radial-gradient/i, /-webkit-gradient/i]
    };

    this.jsFeaturePatterns = {
      'arrow-functions': [/=>\s*{/i, /=>\s*\(/i, /=>\s*[\w]/i],
      'const': [/\bconst\s+\w+/i],
      'let': [/\blet\s+\w+/i],
      'destructuring': [/\{\s*\w+.*\}\s*=/i, /\[\s*\w+.*\]\s*=/i],
      'template-literals': [/`.*\$\{.*\}.*`/i],
      'spread-syntax': [/\.\.\.[\w]/i],
      'promises': [/\bnew\s+Promise/i, /\.then\(/i, /\.catch\(/i],
      'async-await': [/\basync\s+function/i, /\bawait\s+/i],
      'es6-class': [/\bclass\s+\w+/i, /\bextends\s+\w+/i],
      'for-of': [/\bfor\s*\(\s*\w+\s+of\s+/i],
      'array-includes': [/\.includes\(/i],
      'object-assign': [/Object\.assign/i],
      'es6-modules': [/\bimport\s+/i, /\bexport\s+/i]
    };

    this.supportedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.sass', '.less'];
  }

  async scanDirectory(dirPath, options = {}) {
    const { 
      maxDepth = 5, 
      excludeDirs = ['node_modules', '.git', 'dist', 'build'],
      includeFiles = []
    } = options;

    const results = {
      files: [],
      features: new Map(),
      summary: {
        totalFiles: 0,
        jsFiles: 0,
        cssFiles: 0,
        featuresFound: 0
      }
    };

    await this._scanDirectoryRecursive(dirPath, results, 0, maxDepth, excludeDirs, includeFiles);
    
    results.summary.featuresFound = results.features.size;
    results.featuresArray = Array.from(results.features.keys());

    return results;
  }

  async _scanDirectoryRecursive(dirPath, results, currentDepth, maxDepth, excludeDirs, includeFiles) {
    if (currentDepth > maxDepth) return;

    try {
      const items = await readdir(dirPath);
      
      for (const item of items) {
        const itemPath = join(dirPath, item);
        
        try {
          const stats = await stat(itemPath);
          
          if (stats.isDirectory() && !excludeDirs.includes(item)) {
            await this._scanDirectoryRecursive(itemPath, results, currentDepth + 1, maxDepth, excludeDirs, includeFiles);
          } else if (stats.isFile()) {
            const ext = extname(item);
            const shouldInclude = this.supportedExtensions.includes(ext) || includeFiles.includes(item);
            
            if (shouldInclude) {
              const fileResult = await this.scanFile(itemPath);
              if (fileResult.features.length > 0) {
                results.files.push(fileResult);
                results.summary.totalFiles++;
                
                if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
                  results.summary.jsFiles++;
                } else if (['.css', '.scss', '.sass', '.less'].includes(ext)) {
                  results.summary.cssFiles++;
                }
                
                fileResult.features.forEach(feature => {
                  if (!results.features.has(feature)) {
                    results.features.set(feature, []);
                  }
                  results.features.get(feature).push({
                    file: itemPath,
                    matches: fileResult.matches[feature] || []
                  });
                });
              }
            }
          }
        } catch (error) {
          console.warn(`Warning: Could not process ${itemPath}:`, error.message);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read directory ${dirPath}:`, error.message);
    }
  }

  async scanFile(filePath) {
    try {
      const content = await readFile(filePath, 'utf-8');
      const ext = extname(filePath);
      
      const features = [];
      const matches = {};
      
      let patterns;
      if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
        patterns = this.jsFeaturePatterns;
      } else if (['.css', '.scss', '.sass', '.less'].includes(ext)) {
        patterns = this.cssFeaturePatterns;
      } else {
        return { file: filePath, features: [], matches: {} };
      }
      
      for (const [feature, regexes] of Object.entries(patterns)) {
        const featureMatches = [];
        
        for (const regex of regexes) {
          const match = content.match(regex);
          if (match) {
            if (!features.includes(feature)) {
              features.push(feature);
            }
            featureMatches.push({
              pattern: regex.source,
              match: match[0],
              line: this._getLineNumber(content, match.index)
            });
          }
        }
        
        if (featureMatches.length > 0) {
          matches[feature] = featureMatches;
        }
      }
      
      return {
        file: filePath,
        type: ['.js', '.jsx', '.ts', '.tsx'].includes(ext) ? 'javascript' : 'css',
        features,
        matches,
        linesOfCode: content.split('\n').length
      };
    } catch (error) {
      console.warn(`Warning: Could not scan file ${filePath}:`, error.message);
      return { file: filePath, features: [], matches: {}, error: error.message };
    }
  }

  _getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  async scanSpecificFiles(filePaths) {
    const results = [];
    
    for (const filePath of filePaths) {
      const result = await this.scanFile(filePath);
      if (result.features.length > 0 || result.error) {
        results.push(result);
      }
    }
    
    return results;
  }

  getFeaturePriority() {
    return {
      critical: ['flexbox', 'css-grid', 'es6-class', 'arrow-functions'],
      high: ['css-variables', 'const', 'let', 'template-literals'],
      medium: ['css-transforms', 'css-transitions', 'destructuring', 'spread-syntax'],
      low: ['css-filters', 'css-masks', 'for-of', 'array-includes']
    };
  }

  categorizeFeatures(features) {
    const priorities = this.getFeaturePriority();
    const categorized = { critical: [], high: [], medium: [], low: [], unknown: [] };
    
    features.forEach(feature => {
      let found = false;
      for (const [priority, featureList] of Object.entries(priorities)) {
        if (featureList.includes(feature)) {
          categorized[priority].push(feature);
          found = true;
          break;
        }
      }
      if (!found) {
        categorized.unknown.push(feature);
      }
    });
    
    return categorized;
  }
}