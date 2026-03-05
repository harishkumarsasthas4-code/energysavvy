const detectAntiPatterns = {
  checkExpression(node, code) {
    const issues = [];

    // Check for double negation (!!) - often unnecessary
    if (node.expression && node.expression.type === 'UnaryExpression' &&
        node.expression.operator === '!' &&
        node.expression.argument.type === 'UnaryExpression' &&
        node.expression.argument.operator === '!') {
      issues.push({
        type: 'double_negation',
        severity: 'low',
        line: node.loc.start.line,
        message: 'Double negation (!!) detected',
        suggestion: 'Use Boolean() or direct comparison for clarity'
      });
    }

    // Check for console.log in production
    if (node.expression && node.expression.type === 'CallExpression' &&
        node.expression.callee.type === 'MemberExpression' &&
        node.expression.callee.object.name === 'console' &&
        node.expression.callee.property.name === 'log') {
      issues.push({
        type: 'console_log',
        severity: 'low',
        line: node.loc.start.line,
        message: 'console.log detected',
        suggestion: 'Remove or replace with proper logging in production'
      });
    }

    // Check for == vs === (loose equality)
    if (node.expression && node.expression.type === 'BinaryExpression' &&
        node.expression.operator === '==') {
      issues.push({
        type: 'loose_equality',
        severity: 'medium',
        line: node.loc.start.line,
        message: 'Loose equality (==) used',
        suggestion: 'Use strict equality (===) to avoid type coercion'
      });
    }

    return issues;
  }
};

module.exports = detectAntiPatterns;