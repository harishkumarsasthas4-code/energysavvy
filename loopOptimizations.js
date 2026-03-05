const detectInefficientLoops = {
  checkForStatement(node, code) {
    const issues = [];
    
    // Check for missing loop invariants
    if (node.body && node.body.body) {
      const invariants = this.findLoopInvariants(node);
      if (invariants.length > 0) {
        issues.push({
          type: 'loop_invariant',
          severity: 'medium',
          line: node.loc.start.line,
          message: 'Found calculations that don\'t change inside loop',
          suggestion: 'Move these invariants outside the loop: ' + invariants.join(', '),
          code: code.substring(node.start, node.end)
        });
      }
    }

    // Check for array length access in condition
    if (node.test && node.test.type === 'BinaryExpression') {
      if (this.hasArrayLengthAccess(node.test)) {
        issues.push({
          type: 'repeated_array_length',
          severity: 'low',
          line: node.loc.start.line,
          message: 'Array length accessed in loop condition',
          suggestion: 'Cache array length in a variable before the loop'
        });
      }
    }

    return issues;
  },

  checkWhileStatement(node, code) {
    const issues = [];
    
    // Check for potential infinite loops
    if (node.test && node.test.type === 'Literal' && node.test.value === true) {
      if (!this.hasBreakStatement(node)) {
        issues.push({
          type: 'potential_infinite_loop',
          severity: 'high',
          line: node.loc.start.line,
          message: 'Potential infinite loop detected',
          suggestion: 'Ensure there\'s a break condition or use a for loop with proper bounds'
        });
      }
    }

    return issues;
  },

  checkArrayMethods(node, code) {
    const issues = [];
    
    // Check for chained array methods that could be combined
    if (node.callee.object && node.callee.object.type === 'CallExpression') {
      const methods = this.getMethodChain(node);
      if (methods.length > 2) {
        issues.push({
          type: 'chained_array_methods',
          severity: 'medium',
          line: node.loc.start.line,
          message: 'Multiple array method chaining detected',
          suggestion: 'Consider using a single reduce() to avoid multiple iterations',
          methods: methods
        });
      }
    }

    return issues;
  },

  findLoopInvariants(node) {
    const invariants = [];
    const loopVars = this.getLoopVariables(node);
    
    if (node.body && node.body.body) {
      node.body.body.forEach(statement => {
        if (statement.type === 'ExpressionStatement' && 
            statement.expression.type === 'AssignmentExpression') {
          const assignedVar = statement.expression.left.name;
          // Check if assigned variable is not a loop variable
          if (!loopVars.includes(assignedVar)) {
            invariants.push(assignedVar);
          }
        }
      });
    }
    
    return invariants;
  },

  getLoopVariables(node) {
    const vars = [];
    if (node.init && node.init.type === 'VariableDeclaration') {
      node.init.declarations.forEach(decl => {
        if (decl.id.name) {
          vars.push(decl.id.name);
        }
      });
    }
    return vars;
  },

  hasArrayLengthAccess(node) {
    if (node.type === 'MemberExpression' && 
        node.property.name === 'length') {
      return true;
    }
    if (node.left) return this.hasArrayLengthAccess(node.left);
    if (node.right) return this.hasArrayLengthAccess(node.right);
    return false;
  },

  hasBreakStatement(node) {
    let hasBreak = false;
    const checkBreak = (node) => {
      if (node.type === 'BreakStatement') hasBreak = true;
      if (node.body && !hasBreak) {
        if (Array.isArray(node.body)) {
          node.body.forEach(checkBreak);
        } else if (node.body.body) {
          node.body.body.forEach(checkBreak);
        }
      }
    };
    checkBreak(node);
    return hasBreak;
  },

  getMethodChain(node) {
    const methods = [];
    let current = node;
    while (current && current.type === 'CallExpression' && 
           current.callee.type === 'MemberExpression') {
      methods.unshift(current.callee.property.name);
      current = current.callee.object;
    }
    return methods;
  }
};

module.exports = detectInefficientLoops;