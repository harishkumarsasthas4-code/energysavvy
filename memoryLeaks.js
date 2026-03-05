const detectMemoryLeaks = {
  checkVariableDeclaration(node, code) {
    const issues = [];

    // Check for global variables in non-strict mode
    if (node.id && !node.id.name.startsWith('_') && 
        this.isInGlobalScope(node)) {
      issues.push({
        type: 'potential_global',
        severity: 'medium',
        line: node.loc.start.line,
        message: 'Variable declared in global scope',
        suggestion: 'Use let/const inside a block or function scope'
      });
    }

    // Check for large object literals
    if (node.init && node.init.type === 'ObjectExpression' && 
        node.init.properties.length > 10) {
      issues.push({
        type: 'large_object',
        severity: 'low',
        line: node.loc.start.line,
        message: 'Large object literal detected',
        suggestion: 'Consider creating the object incrementally or using a class'
      });
    }

    return issues;
  },

  checkAssignment(node, code) {
    const issues = [];

    // Check for accidental global creation
    if (node.left.type === 'Identifier' && 
        !this.isDeclared(node.left.name) && 
        !node.left.name.startsWith('_')) {
      issues.push({
        type: 'accidental_global',
        severity: 'high',
        line: node.loc.start.line,
        message: `Assignment to undeclared variable '${node.left.name}'`,
        suggestion: `Declare '${node.left.name}' with let/const first`
      });
    }

    return issues;
  },

  checkFunction(node, code) {
    const issues = [];

    // Check for closures that might cause memory leaks
    if (node.body && node.body.body) {
      const closures = this.findClosureReferences(node);
      if (closures.length > 5) {
        issues.push({
          type: 'large_closure',
          severity: 'medium',
          line: node.loc.start.line,
          message: 'Function closes over many external variables',
          suggestion: 'Consider passing values as parameters instead'
        });
      }
    }

    return issues;
  },

  isInGlobalScope(node) {
    // Simplified check - in real implementation, would need proper scope analysis
    let current = node;
    while (current.parent) {
      if (current.parent.type === 'FunctionDeclaration' || 
          current.parent.type === 'FunctionExpression' ||
          current.parent.type === 'BlockStatement') {
        return false;
      }
      current = current.parent;
    }
    return true;
  },

  isDeclared(varName) {
    // Simplified - would need scope chain analysis
    return false;
  },

  findClosureReferences(node) {
    // Simplified - would need to analyze the function's scope
    const references = [];
    if (node.params) {
      references.push(...node.params.map(p => p.name));
    }
    return references;
  }
};

module.exports = detectMemoryLeaks;