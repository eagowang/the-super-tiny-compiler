# the-super-tiny-compiler

通过这个及其简单的 compiler 来了解 compiler 的工作过程。

## 编译阶段

大多数 compiler 分为三个主要的阶段：Parsing，Transformation，Code Generation

1. Parsing 将源代码转为抽象表示
2. Transformation 根据编译器的需要，转换抽象表示
3. Code Generation 将转换后的抽象表示转换为新代码

### Parsing

Parsing 分为词法分析和语法分析

词法分析通过 tokenizer 把代码拆分成词法单元（tokens）,Tokens 是有很多小对象组成的数组，用来描述一段独立的语法。可以是 numbers，labels，punctuation，operaors，whatever

语法分析将词法单元（tokens）格式化成描述语法的每个部分和其相互关系的表示。这被称为中间表示或**抽象语法树**

一个抽象语法树（AST）,是一个深层嵌套的对象，它以易于使用的方式表示代码并告诉我们大量信息。

例如下面的语法：

```
(add 2 (substract 4 2))
```

Tokens 可能像下面这样：

```
[
  { type: 'paren',  value: '('        },
  { type: 'name',   value: 'add'      },
  { type: 'number', value: '2'        },
  { type: 'paren',  value: '('        },
  { type: 'name',   value: 'subtract' },
  { type: 'number', value: '4'        },
  { type: 'number', value: '2'        },
  { type: 'paren',  value: ')'        },
  { type: 'paren',  value: ')'        },
]
And an
```

抽象语法树可能是这样：

```
{
  type: 'Program',
  body: [{
    type: 'CallExpression',
    name: 'add',
    params: [{
      type: 'NumberLiteral',
      value: '2',
    }, {
      type: 'CallExpression',
      name: 'subtract',
      params: [{
        type: 'NumberLiteral',
        value: '4',
      }, {
        type: 'NumberLiteral',
        value: '2',
      }]
    }]
  }]
}
```

### Transformation

只对最后一步中的 AST 修改。它可以用同一种语言处理 AST，也可以将 AST 转换成一种全新的语言

看看是怎么转换 AST 的

你可能注意到，AST 中的元素看起来很像。这些对象具有类型属性。每一个都叫做 AST 节点。这些节点在它们上定义了描述树的一个孤立部分的属性。

数值节点

```
{
  type: 'NumberLiteral',
  value: '2',
}
```

调用表达式节点

```
{
  type: 'CallExpression',
  name: 'subtract',
  params: [
    // nested nodes go here...
  ],
}
```

当转换 AST 我们可以通过 adding/removing/replacing 等属性来操作节点，可以添加新节点，移除节点，或者可以不适用现有的 AST，在它的基础上创建一个全新的。

既然我们目标是一个新语言，我们将重点创建一个针对目标语言的全新 AST。

### Traversal

为了浏览所有这些节点，我们需要能够遍历它们。深度优先遍历 AST 中的每一个节点。

```
{
  type: 'Program',
  body: [{
    type: 'CallExpression',
    name: 'add',
    params: [{
      type: 'NumberLiteral',
      value: '2'
    }, {
      type: 'CallExpression',
      name: 'subtract',
      params: [{
        type: 'NumberLiteral',
        value: '4'
      }, {
        type: 'NumberLiteral',
        value: '2'
      }]
    }]
  }]
}
```

所以上面 AST 将会：

1. Program
2. CallExpression(add)
3. NumberLiteral(2)
4. CallExpression(substract)
5. NumberLiteral(4)
6. NumberLiteral(2)
   如果我们直接操作 AST，而不是创建一个单独的 AST，我们可能会在这里介绍各种抽象。但只是访问 AST 中的每个节点就够了

使用“visiting”一词的原因是因为存在如何在对象结构的元素上表示操作的这种模式。

#### Visitors

基本思想是创建一个“Visitor”对象，可以接受不同的 node 节点

```
var visitor = {
  NumberLiteral(){}
  CallExpression(){}
}
```

当遍历 AST，当我们进入一个匹配类型的节点，就调用 visitor 上对应的方法

为了使其有用，我们还将传递节点和引用传递给父节点。

```
var visitor = {
  NumberLiteral(node, parent) {},
  CallExpression(node, parent) {},
};
```

然而，这也存在调用 exit 的可能。

当我们向下走时，我们会到达一些没有尽头的分支。当我们完成树的每个分支时，我们“退出”它。因此，沿着树向下，我们“进入”每个节点，然后向上，我们“退出”。

```
→ Program (enter)
  → CallExpression (enter)
    → NumberLiteral (enter)
    ← NumberLiteral (exit)
    → CallExpression (enter)
      → NumberLiteral (enter)
      ← NumberLiteral (exit)
      → NumberLiteral (enter)
      ← NumberLiteral (exit)
    ← CallExpression (exit)
  ← CallExpression (exit)
← Program (exit)
```

为了支持这个，visitor 的最终形式是这样的

```
var visitor = {
  NumberLiteral: {
    enter(node, parent) {},
    exit(node, parent) {},
  }
};
```

## Code Generation

compiler 的最后阶段。有时，compiler 会做与 transformation 重叠的事情。大多数情况下，Code Generator 意味着取出 AST 和 sting-ify 代码。

Code Generator 有几种不同的工作方式，一些编译器将重用前面的 tokens，其他编译器将创建一个单独的代码表示，以便它们可以线性打印节点，但从我能说的最多将使用我们刚创建的相同的 AST， 这是我们将要关注的内容。

实际上，我们的代码生成器将知道如何“打印”AST 的所有不同节点类型，并且它将递归调用自己来打印嵌套节点，直到所有内容都打印成一个长字符串代码为止
