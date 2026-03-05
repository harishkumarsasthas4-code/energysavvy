const { exec } = require('@actions/exec');
const BaseAnalyzer = require('./baseAnalyzer');

class PythonAnalyzer extends BaseAnalyzer {
  constructor(code, filename) {
    super();
    this.code = code;
    this.filename = filename;
  }

  async analyze() {
    try {
      // Use Python's AST module through subprocess
      const analysis = await this.runPythonAnalysis();
      
      // Process the results
      analysis.issues.forEach(issue => this.addIssue(issue));
      
      return this.getResults();
    } catch (error) {
      console.error(`Error analyzing ${this.filename}:`, error.message);
      return this.getResults();
    }
  }

  async runPythonAnalysis() {
    let output = '';
    let error = '';

    const pythonScript = `
import ast
import json
import sys

class EnergyEfficiencyAnalyzer(ast.NodeVisitor):
    def __init__(self):
        self.issues = []
    
    def visit_For(self, node):
        # Check for inefficient loops
        if isinstance(node.iter, ast.Call) and hasattr(node.iter.func, 'attr'):
            if node.iter.func.attr == 'range' and len(node.iter.args) == 3:
                self.issues.append({
                    'type': 'inefficient_loop',
                    'severity': 'medium',
                    'line': node.lineno,
                    'message': 'Range with step can be optimized using while loop for better performance',
                    'suggestion': 'Consider using a while loop for custom step ranges'
                })
        self.generic_visit(node)
    
    def visit_Call(self, node):
        # Check for inefficient function calls
        if isinstance(node.func, ast.Attribute):
            if node.func.attr in ['append', 'extend'] and isinstance(node.func.value, ast.Name):
                if node.func.value.id == 'list':
                    self.issues.append({
                        'type': 'inefficient_list_operation',
                        'severity': 'low',
                        'line': node.lineno,
                        'message': 'Repeated list appends can be optimized with list comprehension',
                        'suggestion': 'Use list comprehension instead of repeated appends'
                    })
        
        # Check for pandas operations (if applicable)
        if isinstance(node.func, ast.Attribute):
            if node.func.attr == 'apply' and isinstance(node.func.value, ast.Name):
                if 'df' in node.func.value.id.lower():
                    self.issues.append({
                        'type': 'inefficient_dataframe',
                        'severity': 'high',
                        'line': node.lineno,
                        'message': 'DataFrame.apply can be very slow for large datasets',
                        'suggestion': 'Consider using vectorized operations instead of apply'
                    })
        self.generic_visit(node)
    
    def visit_ListComp(self, node):
        # Check for nested list comprehensions
        if any(isinstance(gen, ast.comprehension) for gen in node.generators):
            for gen in node.generators:
                if isinstance(gen.iter, ast.ListComp):
                    self.issues.append({
                        'type': 'nested_comprehension',
                        'severity': 'medium',
                        'line': node.lineno,
                        'message': 'Nested list comprehensions can be memory intensive',
                        'suggestion': 'Consider using generator expressions or breaking into multiple lines'
                    })
        self.generic_visit(node)
    
    def visit_Assign(self, node):
        # Check for repeated assignments in loops
        if any(isinstance(target, ast.Name) and target.id in ['result', 'output'] for target in node.targets):
            if any(isinstance(parent, ast.For) for parent in self.get_parents()):
                self.issues.append({
                    'type': 'repeated_assignment',
                    'severity': 'low',
                    'line': node.lineno,
                    'message': 'Repeated assignments in loops can be optimized',
                    'suggestion': 'Consider using list accumulation or pre-allocation'
                })
        self.generic_visit(node)
    
    def get_parents(self):
        # Helper to get parent nodes
        return []

code = '''${this.code.replace(/'/g, "\\'")}'''
try:
    tree = ast.parse(code)
    analyzer = EnergyEfficiencyAnalyzer()
    analyzer.visit(tree)
    print(json.dumps({'issues': analyzer.issues}))
except Exception as e:
    print(json.dumps({'error': str(e), 'issues': []}))
    `;

    await exec('python3', ['-c', pythonScript], {
      listeners: {
        stdout: (data) => { output += data.toString(); },
        stderr: (data) => { error += data.toString(); }
      }
    });

    if (error) {
      console.error('Python analysis error:', error);
    }

    try {
      return JSON.parse(output);
    } catch {
      return { issues: [] };
    }
  }
}

async function analyzePython(code, filename) {
  const analyzer = new PythonAnalyzer(code, filename);
  return await analyzer.analyze();
}

module.exports = { analyzePython, PythonAnalyzer };