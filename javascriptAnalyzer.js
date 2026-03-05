const acorn = require('acorn');
const walk = require('acorn-walk');
const BaseAnalyzer = require('./baseAnalyzer.js');
const {
  detectInefficientLoops,
  detectMemoryLeaks,
  detectInefficientDataStructures,
  detectAntiPatterns
} = require('../detectors');

class JavaScriptAnalyzer extends BaseAnalyzer {
  constructor(code, filename) {
    super();
    this.code = code;
    this.filename = filename;
    this.ast = null;
  }

  async analyze() {
    try {
      // Parse JavaScript code
      this.ast = acorn.parse(this.code, {
        ecmaVersion: 2020,
        sourceType: 'module',
        locations: true
      });

      // Run various detectors
      this.detectInefficientLoops();
      this.detectMemoryIssues();
      this.detectDataStructureIssues();
      this.detectAntiPatterns();
      
      return this.getResults();
    } catch (error) {
      console.error(`Error analyzing ${this.filename}:`, error.message);
      return this.getResults();
    }
  }

  detectInefficientLoops() {
    walk.simple(this.ast, {
      ForStatement: (node) => {
        const issues = detectInefficientLoops.checkForStatement(node, this.code);
        issues.forEach(issue => this.addIssue(issue));
      },
      WhileStatement: (node) => {
        const issues = detectInefficientLoops.checkWhileStatement(node, this.code);
        issues.forEach(issue => this.addIssue(issue));
      },
      CallExpression: (node) => {
        // Check for inefficient array methods
        if (node.callee.type === 'MemberExpression') {
          const methodName = node.callee.property.name;
          if (['forEach', 'map', 'filter', 'reduce'].includes(methodName)) {
            const issues = detectInefficientLoops.checkArrayMethods(node, this.code);
            issues.forEach(issue => this.addIssue(issue));
          }
        }
      }
    });
  }

  detectMemoryIssues() {
    walk.simple(this.ast, {
      VariableDeclarator: (node) => {
        const issues = detectMemoryLeaks.checkVariableDeclaration(node, this.code);
        issues.forEach(issue => this.addIssue(issue));
      },
      AssignmentExpression: (node) => {
        const issues = detectMemoryLeaks.checkAssignment(node, this.code);
        issues.forEach(issue => this.addIssue(issue));
      },
      FunctionDeclaration: (node) => {
        const issues = detectMemoryLeaks.checkFunction(node, this.code);
        issues.forEach(issue => this.addIssue(issue));
      }
    });
  }

  detectDataStructureIssues() {
    walk.simple(this.ast, {
      NewExpression: (node) => {
        const issues = detectInefficientDataStructures.checkObjectCreation(node, this.code);
        issues.forEach(issue => this.addIssue(issue));
      },
      MemberExpression: (node) => {
        const issues = detectInefficientDataStructures.checkPropertyAccess(node, this.code);
        issues.forEach(issue => this.addIssue(issue));
      }
    });
  }

  detectAntiPatterns() {
    walk.simple(this.ast, {
      ExpressionStatement: (node) => {
        const issues = detectAntiPatterns.checkExpression(node, this.code);
        issues.forEach(issue => this.addIssue(issue));
      }
    });
  }
}

async function analyzeJavaScript(code, filename) {
  const analyzer = new JavaScriptAnalyzer(code, filename);
  return await analyzer.analyze();
}

module.exports = { analyzeJavaScript, JavaScriptAnalyzer };