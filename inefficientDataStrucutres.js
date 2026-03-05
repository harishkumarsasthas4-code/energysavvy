const detectInefficientDataStructures = {
  checkObjectCreation(node, code) {
    const issues = [];

    // Check for Array constructor with single number (creates sparse array)
    if (node.callee && node.callee.name === 'Array' && 
        node.arguments.length === 1 && 
        node.arguments[0].type === 'Literal' &&
        typeof node.arguments[0].value === 'number') {
      issues.push({
        type: 'sparse_array',
        severity: 'medium',
        line: node.loc.start.line,
        message: 'Creating array with predefined length',
        suggestion: 'Use Array.from() or literal [] and push for better performance'
      });
    }

    // Check for Set/Map usage with large initial data
    if ((node.callee && (node.callee.name === 'Set' || node.callee.name === 'Map')) &&
        node.arguments.length === 1 &&
        node.arguments[0].type === 'ArrayExpression' &&
        node.arguments[0].elements.length > 100) {
      issues.push({
        type: 'large_set_map',
        severity: 'low',
        line: node.loc.start.line,
        message: `Large ${node.callee.name} initialization`,
        suggestion: `Consider adding elements incrementally or using a more efficient structure`
      });
    }

    return issues;
  },

  checkPropertyAccess(node, code) {
    const issues = [];

    // Check for repeated property access that could be cached
    if (node.object && node.object.type === 'MemberExpression') {
      const path = this.getPropertyPath(node);
      if (path.length > 2) {
        issues.push({
          type: 'deep_property_access',
          severity: 'low',
          line: node.loc.start.line,
          message: 'Deep property access chain detected',
          suggestion: 'Cache intermediate results: const temp = ' + path.slice(0, -1).join('.')
        });
      }
    }

    return issues;
  },

  getPropertyPath(node) {
    const path = [];
    let current = node;
    
    while (current && current.type === 'MemberExpression') {
      if (current.property.type === 'Identifier') {
        path.unshift(current.property.name);
      } else if (current.property.type === 'Literal') {
        path.unshift(current.property.value);
      }
      current = current.object;
    }
    
    if (current && current.type === 'Identifier') {
      path.unshift(current.name);
    }
    
    return path;
  }
};

module.exports = detectInefficientDataStructures;