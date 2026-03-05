#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { analyzeJavaScript } = require('./analyzers/javascriptAnalyzer');
const { analyzePython } = require('./analyzers/pythonAnalyzer');
const { detectLanguage } = require('./utils/diffParser');
const { estimateImpact } = require('./utils/impactEstimator');
const { formatResults } = require('./utils/formatter');
const { generateBadge } = require('../badges/generateBadge');

async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  try {
    const files = await getFilesToAnalyze(options);
    const results = [];

    for (const file of files) {
      console.log(`Analyzing ${file}...`);
      const content = await fs.readFile(file, 'utf-8');
      const language = detectLanguage(file);
      
      let fileResults;
      if (language === 'javascript') {
        fileResults = await analyzeJavaScript(content, file);
      } else if (language === 'python') {
        fileResults = await analyzePython(content, file);
      }

      if (fileResults) {
        results.push({
          file,
          ...fileResults
        });
      }
    }

    const energyImpact = estimateImpact(results);
    const badge = generateBadge(energyImpact.totalSavings);
    
    if (options.output === 'json') {
      console.log(JSON.stringify({
        results,
        impact: energyImpact,
        badge
      }, null, 2));
    } else {
      console.log(formatResults(results, energyImpact, badge));
    }

    // Exit with code based on severity
    if (options.failOn && energyImpact.severity === options.failOn) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

function parseArgs(args) {
  const options = {
    files: [],
    directories: [],
    output: 'pretty',
    failOn: null,
    recursive: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--files' || arg === '-f') {
      while (i + 1 < args.length && !args[i + 1].startsWith('-')) {
        options.files.push(args[++i]);
      }
    } else if (arg === '--dir' || arg === '-d') {
      while (i + 1 < args.length && !args[i + 1].startsWith('-')) {
        options.directories.push(args[++i]);
      }
    } else if (arg === '--output' || arg === '-o') {
      options.output = args[++i];
    } else if (arg === '--fail-on') {
      options.failOn = args[++i];
    } else if (arg === '--recursive' || arg === '-r') {
      options.recursive = true;
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    }
  }

  return options;
}

async function getFilesToAnalyze(options) {
  const files = [];

  // Add specified files
  for (const file of options.files) {
    if (await fileExists(file)) {
      files.push(file);
    }
  }

  // Walk directories
  for (const dir of options.directories) {
    await walkDirectory(dir, files, options.recursive);
  }

  return files;
}

async function fileExists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function walkDirectory(dir, files, recursive) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && recursive) {
        await walkDirectory(fullPath, files, recursive);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.js', '.jsx', '.ts', '.tsx', '.py', '.pyw'].includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error walking directory ${dir}:`, error.message);
  }
}

function showHelp() {
  console.log(`
Energy Savvy Code CLI

Usage: energy-savvy [options]

Options:
  -f, --files <files...>    Specific files to analyze
  -d, --dir <dirs...>       Directories to analyze
  -r, --recursive           Recursively analyze subdirectories
  -o, --output <format>     Output format (pretty|json) [pretty]
  --fail-on <severity>       Exit with error if severity >= specified (low|medium|high)
  -h, --help                 Show this help message

Examples:
  energy-savvy -f app.js utils.py
  energy-savvy -d src --recursive
  energy-savvy -d src --output json --fail-on high
  `);
}

if (require.main === module) {
  main();
}

module.exports = { main };