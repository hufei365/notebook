title: Javascript中的严格模式
date: 2018-4-8 21:12:19
tags: JavaScript,严格模式, Strict mode
<!--title-->

JavaScript 严格模式（strict mode）即在严格的条件下执行js程序的模式。这是在ES5中引进来的。
严格模式通过在**脚本**或**函数**的头部添加 `"use strict";` 表达式来声明。
> 注意：**`"use strict";` 指令只允许出现在脚本或函数的开头，否则无效**
但是，ES6 的模块自动采用严格模式，不管你有没有在模块头部加上”use strict;”
单独说一下，在node中，如果文件开头未添加严格模式的声明，可以在执行程序时，通过node --use_strict启用严格模式

#### 为什么使用严格模式？
> 1. 消除Javascript语法的一些不合理、不严谨之处，减少一些怪异行为;
> 1. 消除代码运行的一些不安全之处，保证代码运行的安全；例如禁止this指向全局对象；
> 1. 提高编译器效率，增加运行速度；例如禁止使用with语句，限制了一些动态绑定特性；

### 严格模式下的一些变动

#### 规范语法行为
- 不可以使用未声明的变量
这样做主要是为了避免全局变量污染。因为变量如果不事先声明直接使用，默认其作用域是全局。
所以，结合之前讲过的ES6，建议使用变量前都是用let/const声明。
```javascript
"use strict";
a = 1;  // 报错
b = {k:1}; // 报错

//正确写法
var a = 1;
var b = {k:1};
```
- 不允许使用八进制表示法
主要是因为以0开头表示八进制没啥特别有说服力的理由，而且有些场景中可能会用0xx表示十进制数。
但是在ES6中，可以使用"0o"表示八进制
```javascript
"use strict";
var a =  010;// 报错
var b = 0o10; // ES6支持
console.log(b); // 8
```

#### 显式报错
在非严格模式下，有些语句不会生效，但也不会抛错，这并不利于程序的debug；
所以在严格模式下，有些问题程序会显示的抛出异常。
- 不允许删除声明变量和函数 
```javascript
"use strict";
var a = 1;
delete a; // 报错；

function b(){}
delete b; // 报错
```

- 不允许修改不可写属性的值 && 不允许给只读属性赋值 && 不允许给不可扩展对象添加新属性 && 删除不可删除的属性时会抛出异常；
```javascript
"use strict";
var obj1 = {};
Object.defineProperty(obj1, "x", { value: 42, writable: false });
obj1.x = 9; // 给不可写属性赋值，抛出TypeError错误
 
// 给只读属性赋值
var obj2 = { get x() { return 17; } };
obj2.x = 5; // 抛出TypeError错误
 
// 给不可扩展对象的新属性赋值
var fixed = {};
Object.preventExtensions(fixed);
fixed.newProp = "ohai"; // 抛出TypeError错误
 
// 删除不可删除的属性时会抛出异常
delete Object.prototype; // 抛出TypeError错误
```

- ES6中的严格模式，不允许设置primitive值的属性
PS: js中，变量类型是String、Number、Boolean、null、undefined、Symbol的都属于primitive值
```javascript
(function() {
"use strict";
 
false.true = "";              //TypeError
(14).sailing = "home";        //TypeError
"with".you = "far away";      //TypeError
 
})();
```

### 静态绑定，更快的编译速度

- 不允许使用with语句
with语句是在代码运行的时候才能确定当前的this指向，无法在编译时就确定属性到底归属哪个对象。
为了编译性能上的考虑，js在严格模式下严格限制with的使用；同时这样也更利于代码阅读。
```javascript
"use strict";
with (Math){x = cos(2)}; // 报错
```

- 严格模式下，eval语句会创建一个新的作用域
在严格模式下eval语句本身就是一个作用域，它所生成的变量只能用于eval内部 ，不会对eval本身所处的作用域产生影响。这个同样属于变量污染的问题。
```javascript
"use strict";
var x = 17;
var evalX = eval("'use strict'; var x = 42; x");
console.log(x === 17);   // true
console.log(evalX === 42); // true
```

### 安全原因
**简单版的this**

不允许this关键字指向全局对象
全局对象： 
在浏览器中，一般指window对象；
在Node中，是global;
```javascript
function f(){
　　return !this;
}
// 返回false，因为"this"指向全局对象，"!this"就是false
function f(){
　　"use strict";
　　return !this;
}
// 返回true，因为严格模式下，this的值为undefined，所以"!this"为true
```
**复杂版的this**

在严格模式下通过this传递给一个函数的值不会被强制转换为一个对象。对一个普通的函数来说，this总会是一个对象：不管调用时this它本来就是一个对象；还是用布尔值，字符串或者数字调用函数时函数里面被封装成对象的this；还是使用undefined或者null调用函数式this代表的全局对象（使用call, apply或者bind方法来指定一个确定的this）。这种自动转化为对象的过程不仅是一种性能上的损耗，同时在浏览器中暴露出全局对象也会成为安全隐患，因为全局对象提供了访问那些所谓安全的JavaScript环境必须限制的功能的途径。所以对于一个开启严格模式的函数，指定的this不再被封装为对象，而且如果没有指定this的话它值是undefined
```javascript
"use strict";
function fun() { return this; }
console.assert(fun() === undefined);
console.assert(fun.call(2) === 2);
console.assert(fun.apply(null) === null);
console.assert(fun.call(undefined) === undefined);
console.assert(fun.bind(true)() === true);
```

- 不再支持function.caller属性

在严格模式中再也不能通过广泛实现的ECMAScript扩展“游走于”JavaScript的栈中。在普通模式下用这些扩展的话，当一个叫fun的函数正在被调用的时候，fun.caller是最后一个调用fun的函数，而且fun.arguments包含调用fun时用的形参。这两个扩展接口对于“安全”JavaScript而言都是有问题的，因为他们允许“安全的”代码访问"专有"函数和他们的（通常是没有经过保护的）形参。如果fun在严格模式下，那么fun.caller和fun.arguments都是不可删除的属性而且在存值、取值时都会报错：
```javascript
function restricted()
{
  "use strict";
  restricted.caller;    // 抛出类型错误
  restricted.arguments; // 抛出类型错误
}
function privilegedInvoker()
{
  return restricted();
}
privilegedInvoker();
```

- 参数的值不会随 arguments 对象的值的改变而变化

在正常模式下，对于第一个参数是 arg 的函数，对 arg 赋值时会同时赋值给 arguments[0]，反之亦然（除非没有参数，或者 arguments[0] 被删除）。
严格模式下，函数的 arguments 对象会保存函数被调用时的原始参数。arguments[i] 的值不会随与之相应的参数的值的改变而变化，同名参数的值也不会随与之相应的 arguments[i] 的值的改变而变化。
```javascript
function f(a){
  "use strict";
  a = 42;
  return [a, arguments[0]];
}
var pair = f(17);
console.log(pair[0] === 42); // true
console.log(pair[1] === 17); // true
```

出于编译优化的原因：
- 不再支持 arguments.callee。

正常模式下，arguments.callee 指向当前正在执行的函数。这个作用很小：直接给执行函数命名就可以了！此外，arguments.callee 十分不利于优化，例如内联函数，因为 arguments.callee 会依赖对非内联函数的引用。
在严格模式下，arguments.callee 是一个不可删除属性，而且赋值和读取时都会抛出异常
```javascript
"use strict";
var f = function() { return arguments.callee; };
f(); // 抛出类型错误
```



- 不允许函数有重名参数
避免后面的参数覆盖前面的参数，导致低级错误
```javascript
"use strict";
function c(a,a){} // 报错
```

- 不允许对象的属性重名
在Gecko版本34之前，严格模式要求一个对象内的所有属性名在对象内必须唯一。
```javascript
"use strict";
var o = { p: 1, p: 2 }; // ES5下会有语法错误
```

##### 补充说明一点：
为了向将来Javascript的新版本过渡，严格模式新增了一些保留字：
> implements, interface, let, package, private, protected, public, static, yield

##### 最后说一下：
不论是严格模式还是ES6，都在一定程度上限制了js的灵活性。也许会觉得这样是在向其他语言考虑，失去了js的特性。但我觉得还是先了解透严格模式，在这个基础上可以在研究js灵活性的问题。

### 参考文章：
[严格模式](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Strict_mode)
[Javascript 严格模式详解](http://www.ruanyifeng.com/blog/2013/01/javascript_strict_mode)