// src/parsers/jsParser.js
const acorn = require('acorn');
const walk = require('acorn-walk');

class JSParser {
  constructor(code, filename, options = {}) {
    this.code = code;
    this.filename = filename;
    this.options = {
      ecmaVersion: 2022,
      sourceType: 'module',
      locations: true,
      allowHashBang: true,
      allowImportExportEverywhere: true,
      ...options
    };
    this.ast = null;
    this.tokens = [];
    this.comments = [];
  }

  parse() {
    try {
      this.ast = acorn.parse(this.code, {
        ...this.options,
        onToken: (token) => this.tokens.push(token),
        onComment: (block, text, start, end) => this.comments.push({ block, text, start, end })
      });
      
      return {
        ast: this.ast,
        tokens: this.tokens,
        comments: this.comments,
        success: true
      };
    } catch (error) {
      return {
        ast: null,
        tokens: [],
        comments: [],
        success: false,
        error: {
          message: error.message,
          line: error.loc?.line,
          column: error.loc?.column
        }
      };
    }
  }

  traverse(callbacks) {
    if (!this.ast) return;
    
    const visitors = {};
    
    // Map node types to callbacks
    Object.entries(callbacks).forEach(([type, callback]) => {
      visitors[type] = (node, state, ancestor) => {
        callback(node, {
          code: this.code,
          filename: this.filename,
          ancestors: ancestor,
          getNodeCode: () => this.code.substring(node.start, node.end),
          getLineContent: (line) => this.getLineContent(line)
        });
      };
    });

    walk.fullAncestor(this.ast, visitors);
  }

  getLineContent(lineNumber) {
    const lines = this.code.split('\n');
    return lines[lineNumber - 1] || '';
  }

  getNodeAtPosition(line, column) {
    let foundNode = null;
    
    const search = (node) => {
      if (!node || !node.loc) return;
      
      if (node.loc.start.line <= line && node.loc.end.line >= line) {
        if (node.loc.start.line === line && node.loc.start.column <= column &&
            node.loc.end.line === line && node.loc.end.column >= column) {
          foundNode = node;
        } else if (node.loc.start.line < line || node.loc.end.line > line) {
          // Check children
          for (const key in node) {
            if (node[key] && typeof node[key] === 'object') {
              search(node[key]);
            }
          }
        }
      }
    };

    search(this.ast);
    return foundNode;
  }

  getFunctionAtLine(line) {
    let functionNode = null;
    
    const search = (node) => {
      if (!node || !node.loc) return;
      
      const isFunction = ['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'].includes(node.type);
      
      if (isFunction && node.loc.start.line <= line && node.loc.end.line >= line) {
        functionNode = node;
      } else {
        for (const key in node) {
          if (node[key] && typeof node[key] === 'object') {
            search(node[key]);
          }
        }
      }
    };

    search(this.ast);
    return functionNode;
  }

  getScopeAtPosition(line, column) {
    const node = this.getNodeAtPosition(line, column);
    if (!node) return [];

    const scope = [];
    let current = node;

    while (current) {
      if (current.type === 'FunctionDeclaration' || 
          current.type === 'FunctionExpression' ||
          current.type === 'ArrowFunctionExpression') {
        // Add function parameters to scope
        if (current.params) {
          current.params.forEach(param => {
            if (param.type === 'Identifier') {
              scope.push({ name: param.name, type: 'parameter' });
            }
          });
        }
        
        // Add variables declared in function body
        if (current.body && current.body.body) {
          current.body.body.forEach(statement => {
            if (statement.type === 'VariableDeclaration') {
              statement.declarations.forEach(decl => {
                if (decl.id.type === 'Identifier') {
                  scope.push({ name: decl.id.name, type: 'variable' });
                }
              });
            }
          });
        }
      }
      
      current = current.parent;
    }

    return scope;
  }
}

module.exports = JSParser;