// src/rules/dataStructureRules.js
module.exports = [
  {
    id: 'sparse-array',
    name: 'Sparse Array',
    description: 'Arrays with holes are less efficient',
    severity: 'medium',
    energyImpact: 15,
    category: 'data-structures',
    languages: ['javascript'],
    patterns: [
      {
        type: 'javascript',
        pattern: 'NewExpression[callee.name="Array"][arguments.length=1][arguments.0.type="Literal"]'
      },
      {
        type: 'javascript',
        pattern: 'ArrayExpression[elements.0=null]'
      }
    ],
    suggestion: 'Use Array.from() or fill() for pre-allocated arrays',
    example: {
      bad: `
const arr = new Array(100); // Sparse array
const arr2 = [1, , 3]; // Has a hole`,
      good: `
const arr = Array.from({ length: 100 });
const arr2 = [1, undefined, 3]; // Explicit undefined`
    }
  },
  {
    id: 'object-for-numeric-keys',
    name: 'Object with Numeric Keys',
    description: 'Use Map for numeric keys for better performance',
    severity: 'low',
    energyImpact: 8,
    category: 'data-structures',
    languages: ['javascript'],
    patterns: [
      {
        type: 'javascript',
        pattern: 'ObjectExpression > Property[key.type="Literal"][key.value=/^\\d+$/]'
      }
    ],
    suggestion: 'Use Map for numeric keys or large collections',
    example: {
      bad: `
const obj = {
  1: 'one',
  2: 'two',
  3: 'three'
};`,
      good: `
const map = new Map([
  [1, 'one'],
  [2, 'two'],
  [3, 'three']
]);`
    }
  },
  {
    id: 'set-for-unique-check',
    name: 'Inefficient Unique Check',
    description: 'Using array includes for unique checks is O(n)',
    severity: 'medium',
    energyImpact: 20,
    category: 'data-structures',
    languages: ['javascript'],
    patterns: [
      {
        type: 'javascript',
        pattern: 'CallExpression[callee.property.name="includes"]'
      }
    ],
    suggestion: 'Use Set for O(1) lookups when checking uniqueness',
    example: {
      bad: `
const unique = [];
for (const item of items) {
  if (!unique.includes(item)) {
    unique.push(item);
  }
}`,
      good: `
const unique = [...new Set(items)];`
    }
  },
  {
    id: 'map-for-lookup',
    name: 'Array for Lookup',
    description: 'Using array find for lookups is O(n)',
    severity: 'medium',
    energyImpact: 18,
    category: 'data-structures',
    languages: ['javascript'],
    patterns: [
      {
        type: 'javascript',
        pattern: 'CallExpression[callee.property.name="find"]'
      }
    ],
    suggestion: 'Use Map or object for O(1) lookups when possible',
    example: {
      bad: `
const users = [{id: 1, name: 'John'}, {id: 2, name: 'Jane'}];
const user = users.find(u => u.id === id);`,
      good: `
const users = new Map([
  [1, {id: 1, name: 'John'}],
  [2, {id: 2, name: 'Jane'}]
]);
const user = users.get(id);`
    }
  }
];