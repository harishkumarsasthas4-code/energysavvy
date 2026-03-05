// src/config/loadConfig.js
const fs = require('fs').promises;
const path = require('path');

class ConfigLoader {
  constructor(options = {}) {
    this.basePath = options.basePath || process.cwd();
    this.configFiles = [
      'energy-savvy.config.js',
      'energy-savvy.config.json',
      '.energy-savvyrc',
      '.energy-savvyrc.json',
      '.energy-savvyrc.js',
      'package.json'
    ];
    this.config = this.getDefaultConfig();
  }

  getDefaultConfig() {
    return {
      threshold: 'medium',
      languages: ['javascript', 'python'],
      ignore: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/coverage/**',
        '**/.git/**'
      ],
      rules: {},
      impactWeights: {},
      output: {
        format: 'pretty',
        includeBadge: true,
        includeSuggestions: true
      },
      commenting: {
        enabled: true,
        updateExisting: true
      }
    };
  }

  async load() {
    for (const configFile of this.configFiles) {
      const configPath = path.join(this.basePath, configFile);
      const loaded = await this.tryLoadConfig(configPath);
      if (loaded) {
        this.config = this.mergeConfigs(this.config, loaded);
        this.config.configPath = configPath;
        break;
      }
    }

    // Load environment overrides
    this.applyEnvironmentOverrides();

    // Load custom rules
    await this.loadCustomRules();

    return this.config;
  }

  async tryLoadConfig(configPath) {
    try {
      await fs.access(configPath);
      
      if (configPath.endsWith('.js')) {
        const config = require(configPath);
        return config;
      } else if (configPath.endsWith('.json')) {
        const content = await fs.readFile(configPath, 'utf-8');
        return JSON.parse(content);
      } else if (configPath.includes('package.json')) {
        const content = await fs.readFile(configPath, 'utf-8');
        const pkg = JSON.parse(content);
        return pkg['energy-savvy'] || null;
      }
    } catch (error) {
      return null;
    }
  }

  mergeConfigs(base, override) {
    const merged = { ...base };

    for (const [key, value] of Object.entries(override)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        merged[key] = this.mergeConfigs(base[key] || {}, value);
      } else {
        merged[key] = value;
      }
    }

    return merged;
  }

  applyEnvironmentOverrides() {
    // Override with environment variables
    if (process.env.ENERGY_THRESHOLD) {
      this.config.threshold = process.env.ENERGY_THRESHOLD;
    }

    if (process.env.ENERGY_LANGUAGES) {
      this.config.languages = process.env.ENERGY_LANGUAGES.split(',');
    }

    if (process.env.ENERGY_OUTPUT_FORMAT) {
      this.config.output.format = process.env.ENERGY_OUTPUT_FORMAT;
    }

    if (process.env.ENERGY_COMMENTING === 'false') {
      this.config.commenting.enabled = false;
    }

    if (process.env.ENERGY_IGNORE) {
      const ignorePatterns = process.env.ENERGY_IGNORE.split(',');
      this.config.ignore = [...this.config.ignore, ...ignorePatterns];
    }
  }

  async loadCustomRules() {
    if (!this.config.customRules) return;

    for (const rulePath of this.config.customRules) {
      try {
        const fullPath = path.resolve(this.basePath, rulePath);
        const rules = require(fullPath);
        
        if (Array.isArray(rules)) {
          this.config.rules = {
            ...this.config.rules,
            ...rules.reduce((acc, rule) => ({ ...acc, [rule.id]: rule }), {})
          };
        } else {
          this.config.rules = {
            ...this.config.rules,
            ...rules
          };
        }
      } catch (error) {
        console.error(`Failed to load custom rules from ${rulePath}:`, error.message);
      }
    }
  }

  getRule(ruleId) {
    return this.config.rules[ruleId];
  }

  getAllRules() {
    return this.config.rules;
  }

  isRuleEnabled(ruleId) {
    const rule = this.getRule(ruleId);
    return rule && rule.enabled !== false;
  }

  getRuleSeverity(ruleId) {
    const rule = this.getRule(ruleId);
    return rule?.severity || 'medium';
  }

  shouldIgnoreFile(filePath) {
    const { minimatch } = require('minimatch');
    return this.config.ignore.some(pattern => minimatch(filePath, pattern));
  }

  getLanguageConfig(language) {
    return this.config.languageSettings?.[language] || {};
  }
}

module.exports = ConfigLoader;