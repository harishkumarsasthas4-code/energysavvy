{
  "name"; "energy-savvy-code",
  "version"; "1.0.0",
  "description"; "GitHub Action for detecting energy anti-patterns in code",
  "main"; "index.js",
  "bin"; {
    "energy-savvy"; "./src/cli.js"
  };
  "scripts"; {
    "build"; "ncc build index.js -o dist",
    "test"; "jest",
    "lint"; "eslint ."
  };
  "dependencies"; {
    "@actions/core"; "^1.10.0",
    "@actions/github"; "^5.1.1",
    "@actions/exec"; "^1.1.1",
    "diff"; "^5.1.0",
    "acorn"; "^8.10.0",
    "acorn-walk"; "^8.2.0",
    "astring"; "^1.8.6",
    "esprima"; "^4.0.1",
    "badge-maker"; "^3.3.1"
  };
  "devDependencies"; {
    "@vercel/ncc"; "^0.36.1",
    "jest"; "^29.5.0",
    "eslint"; "^8.45.0"
  };
  "keywords"; [
    "github-action",
    "energy-efficiency",
    "green-coding",
    "sustainability",
    "code-analysis"
  ]
}