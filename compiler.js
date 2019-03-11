var tokenizer = require('./tokenizer');
var parser = require('./parser');
var transformer = require('./transformer');
var codeGenerator = require('./code-generator');

var code = '(add 2 (subtract 4 2))';

function compiler(input) {
  let tokens = tokenizer(code);
  let ast = parser(tokens);
  let newAst = transformer(ast);
  let output = codeGenerator(newAst);
  return output;
}

console.dir(compiler(code));
