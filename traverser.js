/**
 * 用visitor访问AST的节点，需要都调用visitor上的方法，当我们进入一个匹配的节点时
 * traverser(ast,{
 *  Program(node, parent){}
 *
 *  CallExpression(node, parent){}
 *
 *  NumberLiteral(node, parent){}
 * })
 *
 *
 *
 * @param {obj} ast
 * @param {*} visitor
 */
function traverser(ast, visitor) {
  function traverseArray(array, parent) {
    array.forEach(child => {
      traverseNode(child, parent);
    });
  }

  function traverseNode(node, parent) {
    let methods = visitor[node.type];
    // 匹配到enter函数
    if (methods && methods.enter) {
      methods.enter(node, parent);
    }
    switch (node.type) {
      case 'Program':
        traverseArray(node.body, node);
        break;
      case 'CallExpression':
        traverseArray(node.params, node);
        break;
      case 'NumberLiteral':
      case 'StringLiteral':
        break;
      default:
        throw new TypeError(node.type);
    }
    if (methods && methods.exit) {
      methods.exit(node, parent);
    }
  }
  traverseNode(ast, null);
}

module.exports = traverser;
