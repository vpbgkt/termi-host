const fs = require('fs');
const path = require('path');

class Config {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    const configDir = path.join(__dirname, '..', 'config');
    
    // Load default config
    let config = this.loadJsonFile(path.join(configDir, 'default.json'));
    
    // Try to load local config (overrides)
    const localConfigPath = path.join(configDir, 'local.json');
    if (fs.existsSync(localConfigPath)) {
      const localConfig = this.loadJsonFile(localConfigPath);
      config = this.mergeDeep(config, localConfig);
      console.log('✓ Loaded local configuration');
    }
    
    // Apply environment variable overrides
    config = this.applyEnvOverrides(config);
    
    return config;
  }

  loadJsonFile(filePath) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error(`Error loading config file ${filePath}:`, err.message);
      return {};
    }
  }

  mergeDeep(target, source) {
    const output = Object.assign({}, target);
    
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.mergeDeep(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    
    return output;
  }

  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  applyEnvOverrides(config) {
    // Server
    if (process.env.PORT) {
      config.server.port = parseInt(process.env.PORT, 10);
    }
    if (process.env.HOST) {
      config.server.host = process.env.HOST;
    }
    
    // Terminal
    if (process.env.SHELL) {
      config.terminal.shell = process.env.SHELL;
    }
    if (process.env.TERMINAL_COLS) {
      config.terminal.cols = parseInt(process.env.TERMINAL_COLS, 10);
    }
    if (process.env.TERMINAL_ROWS) {
      config.terminal.rows = parseInt(process.env.TERMINAL_ROWS, 10);
    }
    
    // Authentication
    if (process.env.AUTH_ENABLED) {
      config.authentication.enabled = process.env.AUTH_ENABLED === 'true';
    }
    if (process.env.AUTH_USERNAME) {
      config.authentication.username = process.env.AUTH_USERNAME;
    }
    if (process.env.AUTH_PASSWORD) {
      config.authentication.password = process.env.AUTH_PASSWORD;
    }
    
    return config;
  }

  get(path) {
    const keys = path.split('.');
    let value = this.config;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  getAll() {
    return this.config;
  }
}

module.exports = new Config();
