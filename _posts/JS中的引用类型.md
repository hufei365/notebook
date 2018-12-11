/**
title: JS中的引用类型
date: 2018-04-30
tags: JavaScript,引用类型
*/

## JS中的引用类型

在JS中，引用类型虽然看起来很像传统面向对象语言中的**类**，但它跟类有很大区别。这取决于JS中实现面向对象的方式。

### Object类型
创建Object类型的两种方式：
- new Object()
- 对象字面量

【拓展一下】
> 对象字面量在函数参数中一个应用场景。当函数含有较多参数时，如果其中有一些可选参数，可以考虑将这些参数放在一个对象当中。对于必需参数，使用命名参数；而可选的则放在一个对象（Object）当中。这样看起来，会更加清楚简洁。

### Array类型
Array.prototype.length 是个可写属性，可以通过修改它的值，很便捷地在数组末尾删除或添加项。
```javascript
var a = [1,2,3];
console.log(a); // [1, 2, 3]
a.length = 1;
console.log(a); // [1]
console.log(a[2]); // udefined
a.length = 5;
console.log(a); // [1, empty × 4]
console.log(a[4]); // undefined
```

**数组检测**
本来可以利用instanceof方法，但是它的问题在于假定只有一个全局作用域。当网页中包含多个框架的时候，实际上就存在多个全局执行环境。
```javascript
// 以下代码在Chrome **DevTool下执行**
var  a = [];
document.body.appendChild(document.createElement('iframe'));

a instanceof window.frames[0].window.Array; //false
a instanceof window.Array; // true
// 这是因为
window.frames[0].window.Array === window.Array; // false
```
针对上面的问题， ES5增加Array.isArray()方法。但是这个方法有浏览器兼容性问题。支持IE9+。

**数组转换方法**
toString、toLocalString、valueOf
？？？问题来了，toString()与join()在底层实现上有区别么？

**数组中的栈和队列方法**
- 栈：后进先出（Last-In-First-Out）的结构；一般包含两中操作 **推入（push）**和 **移出（pop）**
- 队列：先进先出（First-In-First-Out）；
```javascript
// 栈操作，是在数组尾部进行
var a = [1,2,3];
a.push(4);
console.log(a); // [1, 2, 3, 4]
a.pop();
console.log(a); // [1, 2, 3]

// shift 与 unshift
a.shift();
console.log(a);  // [2, 3]
a.unshift(0);
console.log(a); // [0, 2, 3]
```

**排序方法**
- reverse() 
- sort()
**操作方法**
- concat() 复制数组
- slice()  截取数组的一段数据
- splice() 可以对数组进行删除、新增和替换操作
```javascript
var a = [1,2,3];

// 复制
var a1 = a.concat(4, [5,6]);
console.log(a); // [1, 2, 3]
console.log(a1); // [1, 2, 3, 4, 5, 6]

// 截取
var a2 = a1.slice(1,3);
console.log(a1); // [1, 2, 3, 4, 5, 6]
console.log(a2); // [2,3]

// 删除
var a3 = a1.splice(0,2);
console.log(a1); // [3, 4, 5, 6]
console.log(a3); // [1, 2]

// 新增
var a4 = a1.splice(0, 0, 1,2);
console.log(a1); // [1, 2, 3, 4, 5, 6]
console.log(a4); // []

// 替换
var a5 = a1.splice(0, 2, 'a', 'b','c');
console.log(a1); // ['a', 'b','c', 3, 4, 5, 6]
console.log(a5); // [1, 2]
```

**位置方法**
- indexOf()  从数组开头往后寻找
- lastIndexOf() 从数组的末尾开始往前寻找

浏览器支持IE9+

**迭代方法**
- filter 返回一个数组，这个数组由回调函数中返回true的项组成
- every 如果回调函数对数组中的每一项都返回true，则返回true
- some 如果回调函数对数组中的任意一项返回true，则返回true
- map 返回回调函数操作每一项后的结果
- forEach 没有任何返回
这5个方法都不会修改原数组。
```javascript
var a = [1,2,3];
console.log(a.filter(function(v){ return v > 2; })); // [3]
console.log(a.every(function(v){ return v > 0; })); // true;
console.log(a.every(function(v){ return v > 2; })); // false;
console.log(a.some(function(v){ return v > 2; })); // true
console.log(a.some(function(v){ return v > 3; })); // false
console.log(a.map(function(v){ return v+1; })); // [2, 3, 4]
console.log(a.forEach(function(v){return v})); //   undefined
```
支持浏览器IE9+。

**归并方法**
- reduce 迭代数组中的每一项，它的毁掉函数有四个参数（上次回调返回的结果， 当前项， 当前项的索引， 被迭代的数组）
- reduceRight  reduce的反方向版本，从数组末尾开始迭代
```javascript
var a = [1,2,3,4];
console.log(a.reduce(function(prev, cur, index, a){
    return prev + cur;
})); // 10
```

### Date类型
两个方法：Date.parse() 和 Date.UTC(); 这两个方法用于获取传入日期的时间戳。
Date.now()方法用于获取当前时间的时间戳。但是该方法支持IE9+，因此对于不兼容Date.now()方法的浏览器，可以考虑使用`+new Date()`，也可以达到相同的效果。

Date类型继承了Object类型（Date.prototype.__proto__ === Object.prototype），但是Date重写了Object的toString、toLocalString和valueOf方法。这主要是为日期时间的显示而做的调整。

Date类型可以支持的方法：toString，toDateString，toTimeString，toISOString，toUTCString，toGMTString，getDate，setDate，getDay，getFullYear，setFullYear，getHours，setHours，getMilliseconds，setMilliseconds，getMinutes，setMinutes，getMonth，setMonth，getSeconds，setSeconds，getTime，setTime，getTimezoneOffset，getUTCDate，setUTCDate，getUTCDay，getUTCFullYear，setUTCFullYear，getUTCHours，setUTCHours，getUTCMilliseconds，setUTCMilliseconds，getUTCMinutes，setUTCMinutes，getUTCMonth，setUTCMonth，getUTCSeconds，setUTCSeconds，valueOf，getYear，setYear，toJSON，toLocaleString，toLocaleDateString，toLocaleTimeString。

tips：*如何获取Date对象支持哪些方法？答案：Object.getOwnPropertyNames(Date.prototype);*

### RegExp类型
JS使用RegExp类型来支持正则表达式。
首先记一下正则表达式中的元字符：`( [ { \ ^ $ | ? * + . } ] )`。
正则表达式中各个元字符的含义：

|    元字符  | 含义 |
|:------------:|:-----|
|     ()      |   标记子表达式的开始和结束位置。子表达式可以获取供以后使用。|
|     []     | 中括号表达式，用于定义匹配的字符范围 |
|     {}     | 表示匹配的长度；a{3}表示匹配3个a，a{1,3}表示匹配1到3个a |
|     \      | 将下一个字符标记为或特殊字符、或原义字符、或向后引用、或八进制转义符。例如， 'n' 匹配字符 'n'。'\n' 匹配换行符。序列 '\\' 匹配 "\"，而 '\(' 则匹配 "("。 |
|     ^      | 匹配输入字符串的开始位置，除非在方括号表达式中使用，此时它表示不接受该字符集合。 要匹配 ^ 字符本身，请使用 \^  |
|      $     | 匹配输入字符串的结尾位置。如果设置了 RegExp 对象的 Multiline 属性，则 $ 也匹配 '\n' 或 '\r'。要匹配 $ 字符本身，请使用 \\\$。 |
|      \|     |  指明两项之间的一个选择。要匹配 \|，请使用 \\\| |
|      ?     |  匹配前面的子表达式零次或一次，或指明一个非贪婪限定符。要匹配 ? 字符，请使用 \\\? |
|      *     |   匹配前面的子表达式零次或多次。要匹配 * 字符，请使用 \\\*   |
|      +     |   匹配前面的子表达式一次或多次。要匹配 + 字符，请使用 \\\+   |
|      .     |   匹配除换行符 \n 之外的任何单字符。要匹配 . ，请使用 \\\.  |

这么写下去貌似没完了，看来还是要单开一篇写正则。


**JS中的正则表达式写法**
1. 字面量的形式
`var expression = / pattern / flag ;`
其中，pattern部分是任意复杂或简单到正则表达式；
flag则用于标明正则表达式的行为。它有三个值：
- g，pattern 被用于全局字符串，并不在匹配到第一个后就停止
- i，忽略大小写，在匹配到时候不区分大小写
- m，多行模式，在匹配到一行到末尾时，会继续匹配下一行

1. RegExp构造函数模式
`var reg = new RegExp('abc', 'gi');`
这个表达式表示匹配‘ABC’，不区分大小写。

**RegExp实例的属性**
每个RegExp实例都具有下列属性：
- global：布尔值，是否设定了`g`标志；
- ignoreCase: 布尔值，是否设定了`i`标志；
- lastIndex： 整数，开始搜索下一个匹配项的字符位置，从0起算；
- multiline： 布尔值，是否设定了`m`标志；
- source： 正则表达式的字符串表示

**RegExp实例的方法**
`var r = /a/gi, s = 'a1b1a2b2';`
- exec()
对exec而言，如果正则中有`g`标志，在执行r.exec(s)时，都会从上次结束的位置继续查找码，直到最后找不到的时候返回null。此时，如果继续执行exec，则会从字符的开始位置重新匹配。

> PS：注意IE在lastIndex属性的实现上是有偏差的，具体版本号，还有待进一步测试。

- test()
用于测试输入的字符是否与正则表达式匹配；返回true 或 false；

- 其它，正则表达式中的toString、toLocalString返回正则对字符串表达式；valueOf方法返回正则表达式本身。
```javascript
var r1 = /a/gi, r2 = new RegExp('a', 'g');
r1.toString(); // "/a/gi";
r2.toLocalString(); // "/a/g"
r1.valueOf(); // /a/gi
```
**RegExp构造函数的属性**
这些属性，在真正的OO（面向对象）语言中，一般都被看作静态属性。这些属性适用于作用域内的所有正则表达式，并且基于最后一次执行的正则表达式变化。
这些属性都有两个名字（长属性名和短属性名）。
- input：最后一次匹配的字符串；
- lastMatch： 最后一次的匹配项；
- lastParen： 最后一次匹配的捕获组；
- leftContext： input字符串中lastMatch之前的字符串；
- rightContext：input字符串中lastMatch之后对字符串；
- multiline： 表示是否所有的表达式都使用多行模式；

除了上述几个属性，还有9个我们平时最常用的用于存储捕获组的属性。它们通常使用RexExp.$1、RegExp.$2···RegExp.$9表示。

RegExp的结语：RegExp并未完全正则表达式的所有特性，特别式一些高级特性。在这方面，Perl语言做的相对比较完美。

### Function类型
与其它语言不同的是，在JS中，函数也是对象。

函数重载的概念：同一作用域下，函数名相同而参数不同（个数不同或类型不同）的函数。这主要用于处理那些函数体大致相同，但是参数不同，处理过程不同的情景。

函数声明和函数表达式的区别：在什么时候可以通过变量访问函数，这是两者的区别。除此以外，没有其它区别。
```javascript
f1(); // I am f1
function(){console.log('I am f1')}

f2(); //  Uncaught TypeError: f2 is not a function
var f2 = function(){console.log('I am f2')};
```

？？？callee 和 caller 的关系？
```javascript
f1(); // null
function f1(){
    console.log(arguments.callee.caller);
};

// f2();
var f2 = function(){
    console.log(arguments.callee.caller);
    f1(); 
};

f2(); // 下面是f2的输出：
// null
// 输出f2的函数体： ƒ (){ console.log(arguments.callee.caller); f1(); }
```

**函数的属性和方法**
每个函数都包含两个非继承而来的方法：call() 和 apply()。
它们两个的作用都是在特定的作用域中调用函数，实际上就是设置函数体内的this指向。

另外，ES5中还实现了另一个方法： bind()。它的作用跟call()和apply()一样。

### 基本包装类型
Number、Boolean、String

以上三种基本类型都是可以使用如下方式声明
```javascript
var n = 1;
var b = true;
var s = 'abced';
typeof n; // number
typeof b; // boolean
typeof s; // string
```
看完以上代码，应该都没有任何问题。
那么我的问题是， 以字符变量 `s` 为例。如果typeof s === 'string'， 那么s是否会有String.prototype上的方法。

答案当然是：有。
```javascript
var s = 'abcde';
s.substring(2,4); // 'cde'
```
之所以会有，这要看JS引擎底层实现逻辑了。

其实，为了让我们实现这种直观的操作，后台已经自动完成了一系列的处理。当第二行代码访问 s 时，访问过程处于一种读取模式，也就是要
从内存中读取这个字符串的值。而在读取模式中访问字符串时，后台都会自动完成下列处理。
1. 创建 String 类型的一个实例；
2. 在实例上调用指定的方法；
3. 销毁这个实例。
可以将以上三个步骤想象成是执行了下列 ECMAScript 代码。
```javascript
var s = new String("some text");
s.substring(2,4);
s = null; 
```

```javascript
// hex 转 rgb
// #fff ==>  rgb(255,255,255)
function hex2rgb(s){
    var r = [];
    var nums = /^#([a-f\d]+)$/.exec(s)[1];

    if(nums){
        nums = nums.split('');
        if(nums.length === 3){

            nums.forEach(function(v, i){
                r[i] = parseInt('0x'+v+v);
            });
        } else if(nums.length === 6){
            nums.forEach(function(v, i){
                if(!(i%2)){
                    r.push(parseInt('0x' + v + nums[i+1]));
                } 
            })
        }
    }

    return ('rgb('+r.join(',')+')');
}

// rgb 转 hex
// rgb(255, 255, 255) ==> #ffffff
function rgb2hex(s){
    var r = [];

    var nums = /^rgb\(([\d]{1,3},[\d]{1,3},[\d]{1,3})\)$/.exec(s);
    nums = nums ? nums[1] : null;
    if(nums){
        nums = nums.split(',');
        nums.forEach(function(v, i){
            r.push( Number(v).toString(16).padStart(2, '0'));
        });


    }
    return ('#' + r.join(''));
}


console.log(hex2rgb('#ff0eff'));
console.log(rgb2hex('rgb(255,254,255)'))
```

String 对象的一些常用方法：`charAt()`、`chatCodeAt()`、`concat()`、`slice()`、`substring()`、`substr()`、`match()`
```javascript
var s = 'hello world!';

s.charAt(1); // 'e'
s.charCodeAt(1); // 101 返回字符编码
s.concat('\n Anther line.', '\n End!!'); // concat 连接方法， 与‘+’操作符功能一样
//"hello world!
// Anther line. 
// End!!"

s.slice(6,7); // 'w'
s.substring(6,7); // "w"
s.substr(6,7); // "world!"
// 上面三个字符串的截取方法在没有第二个参数的情况下，默认结束位置都是是字符串末尾

// 字符串**匹配方法**
s.match(/world(\!)/); // ["world!", "!", index: 6, input: "hello world!", groups: undefined]
// 与RegExp的exec方法 返回结果相似
/world(!)/.exec(s); // ["world!", "!", index: 6, input: "hello world!", groups: undefined]

```

**replace()** 该方法可以接受正则作为参数，使用正则的时的高级用法，看下表：

| 字符名 | 描述 |
|:------:|:-----|
|   $$   |  $   |
|   $&   |  匹配整个模式的子字符串。与RegExp.lastMatch的值相同  |
|    $`  |  匹配的子字符串之前的子字符串。与RegExp.leftContext的值相同  |
|    $'  |  匹配的子字符串之后的子字符串。与RegExp.rightContext的值相同  |
|    $n  |  匹配第n个捕获组的子字符串，其中n等于0～9。例如，$1是匹配第一个捕获组的子字符串，$2是匹配第二个捕获组的子字符串，以此类推。如果正则表达式中没有定义捕获组，则使用空字符串  |
|    $nn |  匹配第nn个捕获组的子字符串，其中nn等于01～99。例如，$01是匹配第一个捕获组的子字符串，$02是匹配第二个捕获组的子字符串，以此类推。如果正则表达式中没有定义捕获组，则使用空字符串  |

```javascript
var s = 'hello world! 58 360 Tencent!';
s.replace(/58/, '$`'); // "hello world! hello world!  360 Tencent!"
s.replace(/58/, '$\''); //"hello world!  360 Tencent! 360 Tencent!" 
// 关于 "$`" 与 "$'"的含义说明，在《JavaScript高级程序设计（第3版）》中说明写反了，在实际测试和参考其它资料均与之不符。

var text = "cat, bat, sat, fat";
result = text.replace(/(.at)/g, "word ($1)");
alert(result); //word (cat), word (bat), word (sat), word (fat) 
```
**split()** 该方法也可以接受正则表达式作为参数。

*PS: 注意 若需要替换字符串中全部子字符串，只可以使用正则*

### 单体内置对象
有**Global**和**Math**对象，虽然JS没有提供直接访问**Global**对象的方式，但是在Web浏览器中，大都通过**Window**实现了**Global**的属性。
**Math**主要提供了一些数学相关的方法。



