var traverer = require('./traverser');

function transformer(ast) {
  let newAst = {
    type: 'Program',
    body: []
  };

  ast._context = newAst.body;

  let visitor = {
    NumberLiteral: {
      enter(node, parent) {
        parent._context.push({
          type: 'NumberLiteral',
          value: node.value
        });
      }
    },
    StringLiteral: {
      enter(node, parent) {
        parent._context.push({
          type: 'StringLiteral',
          value: node.value
        });
      }
    },
    CallExpression: {
      enter(node, parent) {
        let expression = {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: node.name
          },
          arguments: []
        };
        node._context = expression.arguments;
        if (parent.type !== 'CallExpression') {
          expression = {
            type: 'ExpressionStatement',
            expression: expression
          };
        }
        parent._context.push(expression);
      }
    }
  };
  traverer(ast, visitor);
  return newAst;
}

module.exports = transformer;
