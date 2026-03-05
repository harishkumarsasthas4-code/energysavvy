// src/rules/loopRules.js
module.exports = [
  {
    id: 'loop-invariant',
    name: 'Loop Invariant',
    description: 'Detects calculations inside loops that don\'t change between iterations',
    severity: 'medium',
    energyImpact: 15, // percentage
    category: 'performance',
    languages: ['javascript', 'python'],
    patterns: [
      {
        type: 'javascript',
        pattern: 'ForStatement > BlockStatement > ExpressionStatement > AssignmentExpression',
        condition: (node, context) => {
          // Check if assigned variable is not modified elsewhere in loop
          return true;
        }
      }
    ],
    suggestion: 'Move invariant calculations outside the loop',
    example: {
      bad: `
for (let i = 0; i < array.length; i++) {
  const taxRate = 0.08; // This never changes
  total += array[i] * taxRate;
}`,
      good: `
const taxRate = 0.08;
for (let i = 0; i < array.length; i++) {
  total += array[i] * taxRate;
}`
    }
  },
  {
    id: 'array-length-in-condition',
    name: 'Array Length in Loop Condition',
    description: 'Array length accessed repeatedly in loop condition',
    severity: 'low',
    energyImpact: 5,
    category: 'performance',
    languages: ['javascript', 'python'],
    patterns: [
      {
        type: 'javascript',
        pattern: 'ForStatement > BinaryExpression > MemberExpression[property.name="length"]'
      },
      {
        type: 'python',
        pattern: 'For > Call[func.name="range"] > Call[func.name="len"]'
      }
    ],
    suggestion: 'Cache array length in a variable before the loop',
    example: {
      bad: `
for (let i = 0; i < array.length; i++) {
  console.log(array[i]);
}`,
      good: `
const len = array.length;
for (let i = 0; i < len; i++) {
  console.log(array[i]);
}`
    }
  },
  {
    id: 'chained-array-methods',
    name: 'Chained Array Methods',
    description: 'Multiple array iterations that could be combined',
    severity: 'medium',
    energyImpact: 20,
    category: 'performance',
    languages: ['javascript'],
    patterns: [
      {
        type: 'javascript',
        pattern: 'CallExpression[callee.property.name=/filter|map|reduce|forEach/] > CallExpression[callee.property.name=/filter|map|reduce|forEach/]'
      }
    ],
    suggestion: 'Use a single reduce() to combine multiple iterations',
    example: {
      bad: `
const result = data
  .filter(x => x > 0)
  .map(x => x * 2)
  .filter(x => x < 10);`,
      good: `
const result = data.reduce((acc, x) => {
  if (x > 0) {
    const doubled = x * 2;
    if (doubled < 10) {
      acc.push(doubled);
    }
  }
  return acc;
}, []);`
    }
  },
  {
    id: 'nested-loops',
    name: 'Nested Loops',
    description: 'Deeply nested loops can cause O(n²) complexity',
    severity: 'high',
    energyImpact: 40,
    category: 'complexity',
    languages: ['javascript', 'python'],
    condition: (node, context) => {
      // Check nesting depth
      let depth = 0;
      let current = node;
      while (current) {
        if (['ForStatement', 'WhileStatement', 'DoWhileStatement'].includes(current.type)) {
          depth++;
        }
        current = current.parent;
      }
      return depth > 2;
    },
    suggestion: 'Consider using a different algorithm or data structure to reduce complexity',
    example: {
      bad: `
for (let i = 0; i < array1.length; i++) {
  for (let j = 0; j < array2.length; j++) {
    for (let k = 0; k < array3.length; k++) {
      // O(n³) complexity
    }
  }
}`,
      good: `
// Use a Set for O(1) lookups
const set2 = new Set(array2);
const set3 = new Set(array3);
for (let i = 0; i < array1.length; i++) {
  if (set2.has(array1[i]) && set3.has(array1[i])) {
    // O(n) complexity
  }
}`
    }
  }
];