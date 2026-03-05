// src/parsers/pythonParser.js
const { exec } = require('@actions/exec');
const fs = require('fs').promises;
const path = require('path');

class PythonParser {
  constructor(code, filename, options = {}) {
    this.code = code;
    this.filename = filename;
    this.options = options;
    this.tempFile = null;
    this.ast = null;
  }

  async parse() {
    try {
      this.tempFile = await this.createTempFile();
      const astData = await this.getAST();
      
      if (astData.error) {
        return {
          ast: null,
          success: false,
          error: astData.error
        };
      }

      this.ast = astData;
      return {
        ast: astData,
        success: true
      };
    } catch (error) {
      return {
        ast: null,
        success: false,
        error: error.message
      };
    } finally {
      if (this.tempFile) {
        await fs.unlink(this.tempFile).catch(() => {});
      }
    }
  }

  async createTempFile() {
    const tempDir = path.join(process.cwd(), 'temp_ast');
    await fs.mkdir(tempDir, { recursive: true });
    const tempFile = path.join(tempDir, `ast_${Date.now()}.py`);
    await fs.writeFile(tempFile, this.code);
    return tempFile;
  }

  async getAST() {
    let output = '';
    let error = '';

    const pythonScript = `
import ast
import json
import sys

def get_ast_info(node):
    """Convert AST node to serializable dict"""
    if isinstance(node, ast.AST):
        fields = {
            'type': type(node).__name__,
            'lineno': getattr(node, 'lineno', None),
            'col_offset': getattr(node, 'col_offset', None),
            'end_lineno': getattr(node, 'end_lineno', None),
            'end_col_offset': getattr(node, 'end_col_offset', None)
        }
        
        # Add specific fields based on node type
        if isinstance(node, ast.FunctionDef):
            fields['name'] = node.name
            fields['args'] = [get_ast_info(arg) for arg in node.args.args]
        elif isinstance(node, ast.ClassDef):
            fields['name'] = node.name
            fields['bases'] = [get_ast_info(base) for base in node.bases]
        elif isinstance(node, ast.Call):
            fields['func'] = get_ast_info(node.func)
            fields['args'] = [get_ast_info(arg) for arg in node.args]
        elif isinstance(node, ast.Name):
            fields['id'] = node.id
            fields['ctx'] = type(node.ctx).__name__
        elif isinstance(node, ast.Constant):
            fields['value'] = str(node.value)
            fields['kind'] = node.kind
        
        # Add children
        fields['children'] = []
        for child in ast.iter_child_nodes(node):
            fields['children'].append(get_ast_info(child))
        
        return fields
    elif isinstance(node, list):
        return [get_ast_info(item) for item in node]
    else:
        return str(node)

def analyze_file(filepath):
    with open(filepath, 'r') as f:
        code = f.read()
    
    try:
        tree = ast.parse(code)
        ast_dict = get_ast_info(tree)
        
        # Extract metrics
        metrics = {
            'function_count': len([n for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)]),
            'class_count': len([n for n in ast.walk(tree) if isinstance(n, ast.ClassDef)]),
            'loop_count': len([n for n in ast.walk(tree) if isinstance(n, (ast.For, ast.While))]),
            'comprehension_count': len([n for n in ast.walk(tree) if isinstance(n, (ast.ListComp, ast.DictComp, ast.SetComp, ast.GeneratorExp))]),
            'lines_of_code': len(code.splitlines())
        }
        
        result = {
            'ast': ast_dict,
            'metrics': metrics
        }
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({'error': str(e)}))

if __name__ == '__main__':
    analyze_file(r'${this.tempFile.replace(/\\/g, '\\\\')}')
    `;

    await exec('python3', ['-c', pythonScript], {
      listeners: {
        stdout: (data) => { output += data.toString(); },
        stderr: (data) => { error += data.toString(); }
      }
    });

    if (error) {
      return { error };
    }

    try {
      return JSON.parse(output);
    } catch {
      return { error: 'Failed to parse AST JSON' };
    }
  }

  traverse(node, callbacks) {
    if (!node) return;

    const visit = (currentNode, parent = null) => {
      if (!currentNode) return;

      // Call callback for this node type
      const nodeType = currentNode.type;
      if (callbacks[nodeType]) {
        callbacks[nodeType](currentNode, {
          code: this.code,
          filename: this.filename,
          parent,
          getNodeCode: () => this.getNodeCode(currentNode),
          getLineContent: (line) => this.getLineContent(line)
        });
      }

      // Visit children
      if (currentNode.children) {
        currentNode.children.forEach(child => visit(child, currentNode));
      }
    };

    visit(node);
  }

  getNodeCode(node) {
    if (!node || !node.lineno) return '';
    
    const lines = this.code.split('\n');
    if (node.end_lineno) {
      return lines.slice(node.lineno - 1, node.end_lineno).join('\n');
    }
    return lines[node.lineno - 1] || '';
  }

  getLineContent(lineNumber) {
    const lines = this.code.split('\n');
    return lines[lineNumber - 1] || '';
  }

  getFunctionAtLine(line) {
    const search = (node) => {
      if (!node) return null;
      
      if (node.type === 'FunctionDef' && 
          node.lineno <= line && 
          node.end_lineno >= line) {
        return node;
      }
      
      if (node.children) {
        for (const child of node.children) {
          const result = search(child);
          if (result) return result;
        }
      }
      
      return null;
    };

    return search(this.ast?.ast);
  }

  getScopeAtPosition(line) {
    const function_ = this.getFunctionAtLine(line);
    if (!function_) return [];

    const scope = [];
    
    // Add function name
    if (function_.name) {
      scope.push({ name: function_.name, type: 'function' });
    }
    
    // Add parameters
    if (function_.args) {
      function_.args.forEach(arg => {
        scope.push({ name: arg.id, type: 'parameter' });
      });
    }

    return scope;
  }
}

module.exports = PythonParser;