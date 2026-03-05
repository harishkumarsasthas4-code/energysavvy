// energy-savvy.config.js
// Configuration file for Energy Savvy Code analyzer

module.exports = {
  // Threshold for warnings (low, medium, high)
  // - low: Show all issues
  // - medium: Show medium and high severity issues only
  // - high: Show only high severity issues
  threshold: 'medium',
  
  // Languages to analyze
  languages: ['javascript', 'python'],
  
  // Files/directories to ignore (glob patterns)
  ignore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
    '**/.git/**',
    '**/*.min.js',
    '**/vendor/**',
    '**/test/**',
    '**/tests/**',
    '**/__tests__/**',
    '**/*.test.js',
    '**/*.spec.js',
    '**/examples/**',
    '**/docs/**'
  ],
  
  // Custom patterns to detect (JavaScript)
  customPatterns: {
    javascript: [
      {
        name: 'custom-anti-pattern',
        pattern: /some-regex-pattern/,
        severity: 'medium',
        message: 'Custom anti-pattern detected',
        suggestion: 'Consider using a better approach'
      }
    ],
    python: [
      {
        name: 'custom-python-pattern',
        pattern: /some-python-regex/,
        severity: 'high',
        message: 'Python custom pattern detected',
        suggestion: 'Use a more efficient alternative'
      }
    ]
  },
  
  // Impact weights customization (in watt-hours per 1000 executions)
  // Override default weights for specific issue types
  impactWeights: {
    // Loop-related issues
    'inefficient_loop': { low: 0.2, medium: 1.0, high: 3.0 },
    'loop_invariant': { low: 0.1, medium: 0.5, high: 1.5 },
    'chained_array_methods': { low: 0.1, medium: 0.4, high: 1.2 },
    'repeated_array_length': { low: 0.05, medium: 0.2, high: 0.6 },
    'infinite_loop_risk': { low: 0.5, medium: 2.0, high: 8.0 },
    'for_in_on_array': { low: 0.1, medium: 0.3, high: 0.9 },
    'expensive_loop_condition': { low: 0.15, medium: 0.6, high: 1.8 },
    
    // Memory-related issues
    'potential_global': { low: 0.1, medium: 0.4, high: 1.2 },
    'accidental_global': { low: 0.2, medium: 0.8, high: 2.4 },
    'large_object': { low: 0.3, medium: 1.2, high: 3.6 },
    'large_closure': { low: 0.25, medium: 1.0, high: 3.0 },
    'closure_memory_leak': { low: 0.4, medium: 1.6, high: 4.8 },
    'unreleased_reference': { low: 0.3, medium: 1.2, high: 3.6 },
    
    // Data structure issues
    'sparse_array': { low: 0.2, medium: 0.8, high: 2.4 },
    'sparse_array_literal': { low: 0.15, medium: 0.6, high: 1.8 },
    'large_array_literal': { low: 0.1, medium: 0.4, high: 1.2 },
    'large_set_map': { low: 0.25, medium: 1.0, high: 3.0 },
    'deep_property_access': { low: 0.05, medium: 0.2, high: 0.6 },
    'numeric_keys_object': { low: 0.1, medium: 0.3, high: 0.9 },
    
    // Anti-patterns
    'double_negation': { low: 0.02, medium: 0.08, high: 0.24 },
    'console_log': { low: 0.05, medium: 0.2, high: 0.6 },
    'loose_equality': { low: 0.03, medium: 0.12, high: 0.36 },
    'type_coercion': { low: 0.04, medium: 0.16, high: 0.48 },
    'void_operator': { low: 0.01, medium: 0.04, high: 0.12 },
    'empty_catch': { low: 0.1, medium: 0.4, high: 1.2 },
    'generic_error_handling': { low: 0.15, medium: 0.6, high: 1.8 },
    'missing_await': { low: 0.2, medium: 0.8, high: 2.4 },
    'manual_promise': { low: 0.1, medium: 0.4, high: 1.2 },
    'unnecessary_await': { low: 0.02, medium: 0.08, high: 0.24 },
    
    // DOM-related issues
    'inefficient_dom_query': { low: 0.15, medium: 0.6, high: 1.8 },
    'inefficient_dom_update': { low: 0.25, medium: 1.0, high: 3.0 },
    'reflow_trigger': { low: 0.3, medium: 1.2, high: 3.6 },
    
    // Python-specific issues
    'inefficient_range_loop': { low: 0.2, medium: 0.8, high: 2.4 },
    'repeated_append': { low: 0.15, medium: 0.6, high: 1.8 },
    'nested_comprehension': { low: 0.1, medium: 0.4, high: 1.2 },
    'pandas_apply': { low: 0.5, medium: 2.0, high: 6.0 },
    'pandas_iterrows': { low: 0.6, medium: 2.4, high: 7.2 },
    'inefficient_string_join': { low: 0.05, medium: 0.2, high: 0.6 },
    'multiple_assignments': { low: 0.02, medium: 0.08, high: 0.24 },
    'complex_boolean': { low: 0.03, medium: 0.12, high: 0.36 }
  },
  
  // Severity mapping for impact thresholds
  severityThresholds: {
    low: 1.0,    // Less than 1.0 Wh is low impact
    medium: 5.0,  // 1.0 - 5.0 Wh is medium impact
    high: 10.0    // Greater than 5.0 Wh is high impact
  },
  
  // CO2 conversion factor (kg CO2 per kWh)
  co2Factor: 0.4,
  
  // Cost per kWh (in USD)
  costPerKwh: 0.12,
  
  // Output configuration
  output: {
    format: 'pretty', // 'pretty', 'json', 'markdown'
    includeBadge: true,
    includeSuggestions: true,
    includeCodeSnippets: true,
    maxIssuesPerFile: 20,
    colorEnabled: true
  },
  
  // Comment posting configuration
  commenting: {
    enabled: true,
    updateExisting: true,
    postSummary: true,
    postDetails: true,
    useCheckRuns: true
  },
  
  // Per-language settings
  languageSettings: {
    javascript: {
      ecmaVersion: 2022,
      sourceType: 'module',
      analyzeJSX: true,
      analyzeTypeScript: true,
      ignorePatterns: [
        'generated/**',
        '*.d.ts'
      ]
    },
    python: {
      pythonVersion: '3.11',
      analyzeNotebooks: false,
      ignorePatterns: [
        '__pycache__/**',
        '*.pyc'
      ]
    }
  },
  
  // Ignore specific lines or issues by ID
  ignoreIssues: {
    // Format: 'filename': [{ line: number, type: string }]
    // Example:
    // 'src/app.js': [
    //   { line: 42, type: 'console_log' },
    //   { line: 100, type: 'loose_equality' }
    // ]
  },
  
  // Custom detectors (advanced)
  customDetectors: {
    javascript: [
      // Path to custom detector modules
      // './custom-detectors/my-detector.js'
    ],
    python: [
      // './custom-detectors/my-python-detector.js'
    ]
  },
  
  // Cache settings for performance
  cache: {
    enabled: true,
    directory: '.energy-cache',
    ttl: 3600000 // 1 hour in milliseconds
  },
  
  // Webhook integration (optional)
  webhooks: {
    slack: {
      enabled: false,
      webhookUrl: '',
      channel: '#energy-reports'
    },
    teams: {
      enabled: false,
      webhookUrl: ''
    }
  },
  
  // Performance profiling
  profiling: {
    enabled: false,
    slowThreshold: 1000 // ms
  },
  
  // Custom rules (extend or override built-in rules)
  rules: {
    'inefficient_loop': 'error', // 'error', 'warn', 'off'
    'memory_leak': 'error',
    'console_log': 'warn',
    'loose_equality': 'warn',
    // ... override other rules
  }
};

// Example: Environment-specific overrides
if (process.env.NODE_ENV === 'production') {
  module.exports.threshold = 'high';
  module.exports.output.format = 'json';
  module.exports.commenting.enabled = false;
}

if (process.env.CI === 'true') {
  // CI-specific settings
  module.exports.output.colorEnabled = false;
  module.exports.cache.enabled = false;
}