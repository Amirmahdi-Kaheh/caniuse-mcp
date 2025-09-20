# CanIUse MCP Configuration Examples

This directory contains practical configuration examples for different use cases.

## Quick Start

Copy any of these configuration files to your project root as `.caniuse-config.json`:

```bash
# Basic modern browser support
cp examples/basic-config.json .caniuse-config.json

# CSS Variables with polyfill support
cp examples/css-variables-polyfill.json .caniuse-config.json

# Promise.allSettled with polyfill support  
cp examples/promise-allsettled-polyfill.json .caniuse-config.json

# Enterprise multi-browser support
cp examples/enterprise-config.json .caniuse-config.json
```

## Configuration Files

### `basic-config.json`
- **Use case**: Modern web applications targeting recent Chrome versions
- **Baseline**: Chrome 50
- **Features**: Basic CSS Grid and Flexbox polyfill support
- **Custom targets**: Chrome 57, Chrome 60

### `css-variables-polyfill.json`
- **Use case**: Applications needing CSS Variables support in older browsers
- **Baseline**: Chrome 40 (includes IE 11 support)
- **Polyfills**: CSS Variables/Custom Properties
- **Override**: Forces CSS Variables as "supported" when polyfilled
- **Best for**: Legacy browser support projects

### `promise-allsettled-polyfill.json`
- **Use case**: JavaScript applications using Promise.allSettled
- **Baseline**: Chrome 60
- **Polyfills**: Promise.allSettled and general Promise support
- **Custom targets**: Chrome 75, Firefox 70, Safari 13
- **Best for**: Modern JavaScript with broader browser support

### `enterprise-config.json`
- **Use case**: Enterprise applications with comprehensive browser support
- **Baseline**: Chrome 50
- **Browsers**: IE 11, Edge Legacy, Chrome Enterprise, Firefox ESR
- **Extensive polyfills**: CSS, JavaScript ES6+, Web APIs
- **Best for**: Corporate environments with mixed browser versions

## Using Configuration

After copying a configuration file:

1. **View current config**:
   ```bash
   # Via MCP client (Cursor, etc.)
   manage_config { "action": "view" }
   ```

2. **Modify polyfills**:
   ```bash
   # Add a polyfill
   manage_config { 
     "action": "add_polyfill", 
     "polyfill": "css-grid" 
   }
   
   # Remove a polyfill
   manage_config { 
     "action": "remove_polyfill", 
     "polyfill": "flexbox" 
   }
   ```

3. **Set custom baseline**:
   ```bash
   manage_config { 
     "action": "set_baseline", 
     "baseline": "chrome-57" 
   }
   ```

4. **Add custom browser target**:
   ```bash
   manage_config {
     "action": "add_target",
     "targetName": "chrome-65",
     "browser": "chrome", 
     "version": "65"
   }
   ```

## Testing Your Configuration

After setting up configuration, test it:

```bash
# Check specific features
check_compatibility {
  "features": ["css-variables", "promise-allsettled"],
  "targets": ["chrome-40", "ie-11"]
}

# Scan your entire project
scan_project {
  "targets": ["chrome-50", "firefox-esr", "ie-11"]
}
```

## Environment Variables

You can also configure via environment variables:

```bash
# Set default baseline
export CANIUSE_DEFAULT_BASELINE="chrome-57"

# Set polyfills
export CANIUSE_POLYFILLS='["css-grid","promise-allsettled"]'

# Set overrides
export CANIUSE_OVERRIDES='{"css-variables":"supported"}'
```

## Common Polyfills

### CSS Features
- `css-variables` / `css-custom-properties` - CSS Variables support
- `css-grid` - CSS Grid Layout
- `flexbox` - Flexible Box Layout
- `object-fit` - Object fit property
- `css-sticky` - Sticky positioning

### JavaScript Features  
- `promises` - Promise support
- `promise-allsettled` - Promise.allSettled method
- `arrow-functions` - Arrow function syntax
- `const` / `let` - Block-scoped variable declarations
- `fetch` - Fetch API
- `object-assign` - Object.assign method

### Common Browser Targets
- `chrome-37` - Chrome 37 (Android 4.4 WebView)
- `chrome-50` - Chrome 50 (common enterprise baseline)
- `chrome-57` - Chrome 57 (CSS Grid support)
- `firefox-esr` - Firefox ESR (Long-term support)
- `safari-12` - Safari 12 (iOS 12+)
- `ie-11` - Internet Explorer 11
- `edge-legacy` - Pre-Chromium Edge