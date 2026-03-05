// src/rules/memoryRules.js
module.exports = [
  {
    id: 'accidental-global',
    name: 'Accidental Global Variable',
    description: 'Assignment to undeclared variable creates global',
    severity: 'high',
    energyImpact: 25,
    category: 'memory',
    languages: ['javascript'],
    patterns: [
      {
        type: 'javascript',
        pattern: 'AssignmentExpression[left.type="Identifier"]'
      }
    ],
    condition: (node, context) => {
      // Check if variable is declared in scope
      const varName = node.left.name;
      return !context.scopeChain.some(scope => scope[varName]);
    },
    suggestion: 'Always declare variables with const, let, or var',
    example: {
      bad: `
function process() {
  result = 42; // Accidental global
}`,
      good: `
function process() {
  const result = 42; // Properly declared
}`
    }
  },
  {
    id: 'closure-memory-leak',
    name: 'Closure Memory Leak',
    description: 'Closure retains references to large objects',
    severity: 'high',
    energyImpact: 35,
    category: 'memory',
    languages: ['javascript'],
    condition: (node, context) => {
      // Check if closure captures large variables
      return false; // Complex to implement
    },
    suggestion: 'Nullify large variables when no longer needed',
    example: {
      bad: `
function createHandler() {
  const largeData = new Array(1000000);
  return function() {
    console.log(largeData.length);
  };
}`,
      good: `
function createHandler() {
  const largeData = new Array(1000000);
  const length = largeData.length;
  largeData = null; // Allow garbage collection
  return function() {
    console.log(length);
  };
}`
    }
  },
  {
    id: 'dom-reference',
    name: 'Unreleased DOM Reference',
    description: 'DOM element reference prevents garbage collection',
    severity: 'medium',
    energyImpact: 20,
    category: 'memory',
    languages: ['javascript'],
    patterns: [
      {
        type: 'javascript',
        pattern: 'VariableDeclarator[init.callee.property.name="getElementById"]'
      }
    ],
    suggestion: 'Remove references when elements are removed from DOM',
    example: {
      bad: `
const element = document.getElementById('temp');
// element still referenced after removal`,
      good: `
let element = document.getElementById('temp');
// When done:
element = null;`
    }
  },
  {
    id: 'large-string-concatenation',
    name: 'Large String Concatenation',
    description: 'Repeated string concatenation creates many intermediate strings',
    severity: 'medium',
    energyImpact: 15,
    category: 'memory',
    languages: ['javascript', 'python'],
    patterns: [
      {
        type: 'javascript',
        pattern: 'AssignmentExpression[right.type="BinaryExpression"][right.operator="+"]'
      },
      {
        type: 'python',
        pattern: 'AugAssign[op="Add"]'
      }
    ],
    suggestion: 'Use array join or StringBuilder pattern for large strings',
    example: {
      bad: `
let result = '';
for (let i = 0; i < 1000; i++) {
  result += 'item' + i;
}`,
      good: `
const parts = [];
for (let i = 0; i < 1000; i++) {
  parts.push('item' + i);
}
const result = parts.join('');`
    }
  }
];

