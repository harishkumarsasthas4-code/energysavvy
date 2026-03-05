class BaseAnalyzer {
  constructor() {
    this.issues = [];
    this.score = 100;
  }

  addIssue(issue) {
    this.issues.push(issue);
    // Reduce score based on issue severity
    const severityWeights = {
      'high': 15,
      'medium': 8,
      'low': 3
    };
    this.score -= severityWeights[issue.severity] || 5;
  }

  getResults() {
    return {
      issues: this.issues,
      score: Math.max(0, this.score),
      summary: this.generateSummary()
    };
  }

  generateSummary() {
    const highCount = this.issues.filter(i => i.severity === 'high').length;
    const mediumCount = this.issues.filter(i => i.severity === 'medium').length;
    const lowCount = this.issues.filter(i => i.severity === 'low').length;

    return {
      high: highCount,
      medium: mediumCount,
      low: lowCount,
      total: this.issues.length
    };
  }
}

module.exports = BaseAnalyzer;