// src/reporters/jsonReporter.js
class JSONReporter {
  generateReport(analysisResults, energyImpact) {
    const report = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      summary: this.generateSummary(analysisResults, energyImpact),
      files: this.generateFileDetails(analysisResults),
      impact: energyImpact,
      metadata: {
        totalFiles: analysisResults.length,
        totalIssues: analysisResults.reduce((sum, f) => sum + f.issues.length, 0),
        averageScore: this.calculateAverageScore(analysisResults)
      }
    };

    return JSON.stringify(report, null, 2);
  }

  generateSummary(results, impact) {
    const issuesBySeverity = {
      high: 0,
      medium: 0,
      low: 0
    };

    results.forEach(file => {
      file.issues.forEach(issue => {
        issuesBySeverity[issue.severity]++;
      });
    });

    return {
      issuesBySeverity,
      totalWaste: impact.totalWaste,
      totalSavings: impact.totalSavings,
      co2Equivalent: impact.co2Equivalent,
      estimatedCost: impact.estimatedCost,
      severity: impact.severity
    };
  }

  generateFileDetails(results) {
    return results.map(file => ({
      filename: file.filename,
      score: file.score,
      metrics: file.metrics,
      issues: file.issues.map(issue => ({
        line: issue.line,
        column: issue.column,
        severity: issue.severity,
        type: issue.type,
        message: issue.message,
        suggestion: issue.suggestion,
        code: issue.code,
        context: issue.context
      }))
    }));
  }

  calculateAverageScore(results) {
    if (results.length === 0) return 100;
    const total = results.reduce((sum, file) => sum + file.score, 0);
    return Number((total / results.length).toFixed(2));
  }
}

module.exports = JSONReporter;