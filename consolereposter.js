// src/reporters/consoleReporter.js
const chalk = require('chalk');
const { table } = require('table');

class ConsoleReporter {
  constructor(options = {}) {
    this.colorEnabled = options.colorEnabled !== false;
    this.verbose = options.verbose || false;
  }

  generateReport(analysisResults, energyImpact) {
    this.printHeader();
    this.printSummary(analysisResults, energyImpact);
    this.printIssues(analysisResults);
    this.printImpact(energyImpact);
    this.printSuggestions(analysisResults);
    this.printFooter();
  }

  printHeader() {
    console.log('\n' + chalk.bold.green('🔋 Energy Savvy Code Report'));
    console.log(chalk.gray('='.repeat(50)) + '\n');
  }

  printSummary(results, impact) {
    const totalIssues = results.reduce((sum, file) => sum + file.issues.length, 0);
    const filesAnalyzed = results.length;
    const filesWithIssues = results.filter(r => r.issues.length > 0).length;

    const summaryData = [
      ['Metric', 'Value'],
      ['Total Issues', chalk.yellow(totalIssues)],
      ['Files Analyzed', chalk.cyan(filesAnalyzed)],
      ['Files with Issues', chalk.yellow(filesWithIssues)],
      ['Impact Level', this.getColoredImpact(impact.severity)],
      ['Energy Waste', chalk.red(`${impact.totalWaste} Wh/1000 runs`)],
      ['Potential Savings', chalk.green(`${impact.totalSavings} Wh/1000 runs`)],
      ['CO₂ Equivalent', chalk.gray(`${impact.co2Equivalent} g/1000 runs`)]
    ];

    console.log(table(summaryData));
  }

  printIssues(results) {
    if (results.length === 0) return;

    console.log(chalk.bold('\n📝 Detected Issues\n'));

    for (const file of results) {
      if (file.issues.length === 0) continue;

      console.log(chalk.cyan(`📄 ${file.filename}`));
      
      for (const issue of file.issues) {
        const severityColor = {
          'high': chalk.red,
          'medium': chalk.yellow,
          'low': chalk.green
        }[issue.severity] || chalk.white;

        console.log(`  ${severityColor('●')} Line ${chalk.bold(issue.line)}: ${issue.message}`);
        console.log(`    ${chalk.gray('→')} ${chalk.italic(issue.suggestion)}`);
        
        if (this.verbose && issue.code) {
          console.log(`    ${chalk.gray('Code:')} ${chalk.dim(issue.code)}`);
        }
        console.log('');
      }
    }
  }

  printImpact(impact) {
    console.log(chalk.bold('\n📊 Energy Impact Estimate\n'));

    const impactData = [
      ['Metric', 'Value'],
      ['Total Waste', `${impact.totalWaste} Wh`],
      ['Total Savings', `${impact.totalSavings} Wh`],
      ['CO₂ Equivalent', `${impact.co2Equivalent} g`],
      ['Cost Savings', `$${impact.estimatedCost}`]
    ];

    console.log(table(impactData));

    // Visual impact bar
    const maxBarWidth = 40;
    const wastePercent = Math.min(100, (impact.totalWaste / 20) * 100);
    const barWidth = Math.floor((wastePercent / 100) * maxBarWidth);
    
    console.log(chalk.bold('\nImpact Level:'));
    console.log(chalk.gray('[') + 
      chalk.red('█'.repeat(barWidth)) + 
      chalk.gray('░'.repeat(maxBarWidth - barWidth)) + 
      chalk.gray(']') + 
      chalk.white(` ${wastePercent.toFixed(1)}%`));
  }

  printSuggestions(results) {
    const suggestions = new Set();
    
    results.forEach(file => {
      file.issues.forEach(issue => {
        suggestions.add(issue.suggestion);
      });
    });

    if (suggestions.size > 0) {
      console.log(chalk.bold('\n💡 Quick Fixes\n'));
      
      Array.from(suggestions).forEach((suggestion, index) => {
        console.log(`  ${chalk.green(`${index + 1}.`)} ${suggestion}`);
      });
      console.log('');
    }
  }

  printFooter() {
    console.log(chalk.gray('='.repeat(50)));
    console.log(chalk.gray('For detailed HTML report, run with --format html\n'));
  }

  getColoredImpact(severity) {
    const colors = {
      'high': chalk.red('HIGH'),
      'medium': chalk.yellow('MEDIUM'),
      'low': chalk.green('LOW')
    };
    return colors[severity] || severity;
  }
}

module.exports = ConsoleReporter;