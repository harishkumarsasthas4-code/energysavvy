// src/reporters/githubReporter.js
class GitHubReporter {
  constructor(octokit, context) {
    this.octokit = octokit;
    this.context = context;
  }

  async generateReport(analysisResults, energyImpact) {
    const { owner, repo } = this.context.repo;
    const prNumber = this.context.payload.pull_request.number;

    const summary = this.generateSummary(analysisResults, energyImpact);
    const details = this.generateDetailedReport(analysisResults, energyImpact);
    const suggestions = this.generateSuggestions(analysisResults);

    const report = this.formatReport(summary, details, suggestions);

    // Post as PR comment
    await this.postToPR(report, owner, repo, prNumber);

    // Also create a check run
    await this.createCheckRun(analysisResults, energyImpact);

    return report;
  }

  generateSummary(results, impact) {
    const totalIssues = results.reduce((sum, file) => sum + file.issues.length, 0);
    const filesWithIssues = results.filter(r => r.issues.length > 0).length;
    
    let impactLevel = '🟢 LOW';
    let impactColor = '#2ecc71';
    if (impact.totalWaste > 10) {
      impactLevel = '🔴 HIGH';
      impactColor = '#e74c3c';
    } else if (impact.totalWaste > 3) {
      impactLevel = '🟡 MEDIUM';
      impactColor = '#f1c40f';
    }

    return {
      totalIssues,
      filesWithIssues,
      impactLevel,
      impactColor,
      totalWaste: impact.totalWaste,
      totalSavings: impact.totalSavings,
      co2Equivalent: impact.co2Equivalent
    };
  }

  generateDetailedReport(results, impact) {
    const sections = [];
    
    for (const file of results) {
      if (file.issues.length === 0) continue;

      const fileSection = {
        filename: file.file,
        issues: file.issues.map(issue => ({
          line: issue.line,
          severity: issue.severity,
          message: issue.message,
          suggestion: issue.suggestion,
          type: issue.type,
          code: issue.code
        }))
      };
      sections.push(fileSection);
    }

    return sections;
  }

  generateSuggestions(results) {
    const suggestions = [];
    const issueTypes = new Set();

    results.forEach(file => {
      file.issues.forEach(issue => {
        issueTypes.add(issue.type);
      });
    });

    const suggestionMap = {
      'inefficient_loop': 'Move invariant calculations outside loops and cache array lengths',
      'loop_invariant': 'Extract constant calculations to before the loop',
      'chained_array_methods': 'Combine multiple array iterations into a single reduce()',
      'memory_leak': 'Use local variables and clean up event listeners',
      'accidental_global': 'Always declare variables with const/let',
      'console_log': 'Remove console.log in production or use proper logging',
      'loose_equality': 'Use strict equality (===) for better performance',
      'sparse_array': 'Avoid creating arrays with holes, use Array.from() instead',
      'nested_comprehension': 'Break nested comprehensions into multiple steps',
      'pandas_apply': 'Use vectorized operations instead of apply()',
      'pandas_iterrows': 'Avoid iterating over DataFrame rows, use vectorized operations'
    };

    issueTypes.forEach(type => {
      if (suggestionMap[type]) {
        suggestions.push({
          type,
          suggestion: suggestionMap[type]
        });
      }
    });

    return suggestions;
  }

  formatReport(summary, details, suggestions) {
    const report = [];
    
    // Header with badge
    report.push('# 🔋 Energy Efficiency Analysis');
    report.push('');
    report.push(`![Energy Impact](https://img.shields.io/badge/energy-${summary.totalWaste}%20Wh-${summary.impactColor})`);
    report.push('');
    
    // Summary section
    report.push('## 📊 Summary');
    report.push('| Metric | Value |');
    report.push('|--------|-------|');
    report.push(`| Total Issues | ${summary.totalIssues} |`);
    report.push(`| Files with Issues | ${summary.filesWithIssues} |`);
    report.push(`| Impact Level | ${summary.impactLevel} |`);
    report.push(`| Energy Waste | ${summary.totalWaste} Wh/1000 executions |`);
    report.push(`| Potential Savings | ${summary.totalSavings} Wh/1000 executions |`);
    report.push(`| CO₂ Equivalent | ${summary.co2Equivalent} g/1000 executions |`);
    report.push('');
    
    // Detailed issues
    if (details.length > 0) {
      report.push('## 🎯 Detected Issues');
      report.push('');
      
      for (const file of details) {
        report.push(`### 📄 ${file.filename}`);
        report.push('');
        report.push('| Line | Severity | Issue | Suggestion |');
        report.push('|------|----------|-------|------------|');
        
        for (const issue of file.issues) {
          const severityEmoji = {
            'high': '🔴',
            'medium': '🟡',
            'low': '🟢'
          }[issue.severity] || '⚪';
          
          report.push(`| ${issue.line} | ${severityEmoji} ${issue.severity.toUpperCase()} | ${issue.message} | ${issue.suggestion} |`);
        }
        report.push('');
      }
    } else {
      report.push('✅ No energy anti-patterns detected! Great job!');
      report.push('');
    }
    
    // Suggestions
    if (suggestions.length > 0) {
      report.push('## 💡 Optimization Tips');
      report.push('');
      for (const s of suggestions) {
        report.push(`- **${s.type}**: ${s.suggestion}`);
      }
      report.push('');
    }
    
    // Environmental impact
    report.push('## 🌍 Environmental Impact');
    report.push('');
    report.push(`If this code runs 1 million times, you could save:`);
    report.push(`- ⚡ **${(summary.totalSavings * 1000).toFixed(2)} kWh** of electricity`);
    report.push(`- 🌲 **${(summary.co2Equivalent * 1000 / 1000).toFixed(2)} kg** of CO₂ emissions`);
    report.push(`- 💰 **$${(summary.totalSavings * 1000 * 0.12).toFixed(2)}** in energy costs`);
    report.push('');
    
    // Footer
    report.push('---');
    report.push('*Report generated by [Energy Savvy Code](https://github.com/energy-savvy-code) action*');
    
    return report.join('\n');
  }

  async postToPR(report, owner, repo, prNumber) {
    // Check for existing comment
    const { data: comments } = await this.octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: prNumber
    });

    const botComment = comments.find(comment => 
      comment.user.type === 'Bot' && 
      comment.body.includes('Energy Efficiency Analysis')
    );

    if (botComment) {
      await this.octokit.rest.issues.updateComment({
        owner,
        repo,
        comment_id: botComment.id,
        body: report
      });
    } else {
      await this.octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body: report
      });
    }
  }

  async createCheckRun(results, impact) {
    const { owner, repo } = this.context.repo;
    const headSha = this.context.payload.pull_request.head.sha;

    const totalIssues = results.reduce((sum, file) => sum + file.issues.length, 0);
    const conclusion = impact.totalWaste > 10 ? 'failure' : 'success';

    await this.octokit.rest.checks.create({
      owner,
      repo,
      name: 'Energy Efficiency Check',
      head_sha: headSha,
      status: 'completed',
      conclusion,
      output: {
        title: 'Energy Efficiency Analysis',
        summary: `Found ${totalIssues} issues with estimated waste of ${impact.totalWaste} Wh`,
        text: JSON.stringify({
          issues: totalIssues,
          waste: impact.totalWaste,
          savings: impact.totalSavings,
          co2: impact.co2Equivalent
        }, null, 2)
      }
    });
  }
}

module.exports = GitHubReporter;