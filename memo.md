# notebook

### Chrome离线版下载方法
基本格式还是上面方法里面的那个，但稍稍有些修改：

在 chrome 首页的链接 https://www.google.com/chrome/browser/thankyou.html 后

加上「 ?standalone=1&platform=win&installdataindex=defaultbrowser」然后回车就行。

standalone=1 ：确认下载离线安装包 

platform=win ：适用平台为windows

installdataindex=defaultbrowser  ：安装后设chrome为当前默认浏览器

extra=stablechannel  ：指定版本为稳定版（版本有stablechannel、betachannel、devchannel、canarychannel）

[参考链接](https://www.zhihu.com/question/19981495/answer/83273865)


**webpack-dev-server**
- host:
- port:
- open:

### 2018-5-14
主要项目教师空间：
涉及到的技术主要有svg、vue.js、web编辑器、web路由、单页app等
项目采用前后端分离的结构，前端代码的编译和构建通过基于百度fis3研发自有构建工具进行。
解决了资源加载、模块化开发、代码部署等问题。
另外在项目实践中，注重产品交互等方面的问题，积极参与研发开始前的工作内容

做过一段时间系统运维层面的一些工作，涉及到Linux（主要是CentOS）、shell、nginx等；
后来专职做js开发，当时的项目是云计算系统的后台管理项目。正式来讲，这可以算是前端职业生涯的开始。


### 传统的绑定事件方法
onclick
addEventListener/attachEvent

### jsonp的原理
script标签src属性中的链接却可以访问跨域的js脚本
but: jsonp只能实现get方式的请求。

### 左右两栏布局的方式
`display:table; display:table-cell;`


### 跨域的方式
- jsonp
- document.domain + iframe(这种方式只适用于顶级域名一致的情况)
- nginx转发


### vue的运行时构建和独立构建

### Server Side Rendering(服务端渲染)
- 更好的SEO
- 更好的内容到达时间(time-to-content)

### 服务器端渲染 vs 预渲染(SSR vs Prerendering)

### vue全家桶
vue-router、vuex、vue


### vue常用指令
- v-model 
双向数据绑定，一般用于表单元素

- v-for 
对数组或对象进行循环操作，使用的是v-for，不是v-repeat 
注：在vue1.0中提供了隐式变量，如index、key 
在vue2.0中去除了隐式变量，已被废除

- v-on 
用来绑定事件，用法：v-on:事件=”函数”

- v-show/v-if 

### vue组件通信
父子节点通信：prop 和 $emit
兄弟节点通信：借助父节点转播或者使用总线模式 `var bus = new Vue(); bus.on('eventa',cb); bus.$emit('eventa');`


### vue-hackernews-2.0
https://github.com/vuejs/vue-hackernews-2.0

### fis3的打包机制


### 作用域
[作用域](http://hubidankan.cn/post/5b0e1cd25963ea40b18e2e7b)

### `eval`和`with`
这俩语句会降低js性能的原因是js引擎在编译阶段遇到这俩二货会基本上停止**编译阶段**的性能优化工作，因为它俩提供的是**动态作用域**，这会影响词法解析器生成词法作用域的过程，导致不能优化代码。


### 事件委托的优缺点
优点：
- 减少事件注册，节省内存
- 简化dom节点更新时，相应的事件更新
    - 不用在新添加的节点上绑定事件
    - 删除某个dom时，不用移除绑定的事件

缺点：
- 事件委托基于冒泡，对不冒泡对事件不支持委托绑定；
- 如果层级过多，冒泡过程中，可能会被某层阻止掉；
- 理论上会导致浏览器频繁调用处理函数，建议就近委托；
- 所有的事件都用代理可能会出现事件误判；

**原生js实现对事件委托**
```javascript
function delegateEvent(interfaceEle, selector, type, fn){

    if(interfaceEle,addEventListener){
        interfaceEle.addEventListener(type, eventfn);
    } else {
        interfaceEle.attachEvent('on'+type, eventfn);
    }

    function eventfn(e){
        var e = e || window.event;
        var target = e.target || e.srcElement;

        if(matchSelector(target, selector)){
            if(fn){
                fn.call(target, e);
            }
        }
    }
}

function matchSelector(ele, selector){
    if(selector.charAt(0) === '#'){
        return ele.id === selector.slice(1);
    }

    if(selector.charAt(0) === '.'){
        return ('' + ele.className + '').indexOf('' + selector.slice(1) + '') != -1
    }

    return ele.tagName.toLowerCase() === seleclor.toLowerCase();
}

var odiv = document.getElementById('oDiv');
delegateEvent(odiv, 'a', 'click', function(){
    alert(1);
})
```


### 变量提升和函数提升
```javascript
function a(){
    console.log(b);  // undefined
    var b = 1;
}
a();
```
上面的方法输出undefined，它等价于
```javascript

function a(){
    var b;
    console.log(b);
    b = 1;
}
a();
```

### 变量提升
在一个作用域中，变量的声明位置是**无关紧要**的。
在ES6中，使用let声明的变量不存在变量提升。

### typeof和instanceOf
js判断变量类型的方法，最常用的一种方法是toString
```javascript
function isFunction(o){
    // return Object.prototype.toString.call(o) === '[object Function]';
    // another way (use RegExp)
    return Object.prototype.toString.call(o).match(/\[object (.*?)\]/)[1] === 'Function';
}

// 进阶版
// 获取变量对象类型
function getType(o){
    return Object.prototype.toString.call(o).match(/\[object (.*?)\]/)[1];
}

getType(1); // Number
getType(''); // String
getType(true); // Boolean
getType(Boolean(false)); // Boolean
```
### js中String.prototype.match的使用
String.prototype.match(regexp);
根据正则表达式regexp对字符串进行匹配。
```javascript
'abc'.match(/a/); // ["a", index: 0, input: "abc", groups: undefined]
```
如果正则表达式不包含 g 标志，则 str.match() 会返回和 RegExp.exec() 相同的结果。而且返回的 Array 拥有一个额外的 input 属性，该属性包含被解析的原始字符串。另外，还拥有一个 index 属性，该属性表示匹配结果在原字符串中的索引（以0开始）。

如果正则表达式包含 g 标志，则该方法返回一个 Array ，它包含所有匹配的子字符串而不是匹配对象。捕获组不会被返回(即不返回index属性和input属性)。如果没有匹配到，则返回  null 。
```javascript
// 带 g 标志对使用
'abcdefg'.match(/[a-d]/g); //["a", "b", "c", "d"]
```


### 前端路由
前端路由的实现原理：
1. location的hash
2. H5的history API

前端路由的适用场景一般是SPA（单页面应用），这种情境下，页面一般多是更新部分页面。在这种情况下，可以充分利用现有的页面，而只是向服务端请求需要更新地数据。

优点：
1. 不用重新跳页，用户体验更加舒服，同时后端服务压力更小；

缺点：
1. 使用浏览器对前进，后退键会重新发送请求，没有合理地利用缓存


### HTML5的history中的pushState()和replaceState()
可以理解为window.location.hash美丽版本，这两个方法可以在不刷新页面的前提下更改页面地URL，并修改浏览历史记录。
对于window.location.hash来说，它的的变化也不会引起页面刷新，但是URL后面总跟着一个“#”，对于有重度洁癖的人来说，并不是很舒服。
但是，pushState和replaceState并不只是用来实现SPA的，他还有更加本质的用法。SPA只是它的特性刚好适用罢了。



### MVC、MVP 和 MVVM
- MVC（Model View Controller）：三者当中最早被提出来，初步解决了View（视图层）同Model（数据模型层）的分离问题，使得展示独立于数据和业务逻辑，便于产品更快的迭代更新；
- MVP（Model View Presenter）：MVC的一个变种，在MVP中，将大量的处理逻辑放在了Presenter中，View和Model在理论设计上，不再追求完全关联（虽然MVC也是这么想的，但是也要看各家的具体实现标准）。
- MVVM（Model View ViewModel）：将原来设计模式中，View和Model关联的部分放到了ViewModel层中，View和Model完全分离。ViewModel除了承担了原来Controller层的功能，还作为View和Model间的缓冲区。必然的，数据和试图的之间的业务逻辑也就放在了ViewModel中。


### PWA && 异步交互的最高级体验
PWA, Progressive Web App，渐进式网页应用。
也可以称作谷歌版的小程序，它是一种利用离线缓存技术，让Web应用的使用具有Native App的感觉。
具体原理是利用浏览器的缓存技术，通过ServiceWorker实现。
ServicerWorker会拦截网络请求，并根据网络是否可用判断是否使用缓存数据或者更新数据。


### 利用正则查询URL中参数
```javascript
function queryParam(key, url){
    var reg = new RegExp(key + '=([\\d|a-z|A-Z]+)&?');
    return String(url).match(reg) ? url.match(reg)[1] : '';
}
```

// TODO
### js的原型链
首先，js中的对象分为**普通对象**和**函数对象**。
任意函数都可以作为构造函数，它们都是函数对象。
通过构造函数new出来的对象叫做实例，它是普通对象。

函数对象都有一个`prototype`属性，这个属性指向该构造函数的原型对象。
那么原型对象有什么用呢？通过构造函数生成的实例，都会有一个`__proto__`属性，该属性指向其构造函数的原型对象，也就是构造函数的prototype 属性。通过`__proto__`，实例会获取构造函数的原型对象上的属性。这时，便也就形成了原型链。

构造函数生成实例是通过new操作符实现的，那么new操作符的具体原理可以参考下面的介绍。

每个函数对象都有一个prototype属性，指向该函数对象的构造函数。

定律一： **每个对象都有一个__proto__属性，但函数对象还有个prototype属性。**

原型对象是构造函数的一个实例。


参考文章
[最详尽的 JS 原型与原型链终极详解，没有「可能是」。（一）](https://www.jianshu.com/p/dee9f8b14771)
[最详尽的 JS 原型与原型链终极详解，没有「可能是」。（二）](https://www.jianshu.com/p/652991a67186)
[最详尽的 JS 原型与原型链终极详解，没有「可能是」。（三）](https://www.jianshu.com/p/a4e1e7b6f4f8)


通过原型链实现继承
```javascript
function A(){
    this.name = 'a';
}

function B(){
    this.type = 'b';
}

B.prototype = new A;

let b = new B();

console.log(b);
// {
//     type: "b",
//     __proto__: {
//         name: "a",
//         __proto__: Object
//     }
// }


```

 *A instanceof B 的原理*
**查看对象B的prototype属性指向的原型对象是否在对象A的原型链上，若在则返回true，若不在则返回false。**


*new运算符的原理*

1. 一个新对象被创建。它继承自foo.prototype。
2. 构造函数返回一个对象。在执行的时候，相应的传参会被传入，同时上下文(this)会被指定为这个新的实例。
3. new foo等同于new foo(), 只能用在不传递任何参数的情况
4. 如果构造函数反悔了一个对象，那个这个对象会取代整个new出来的结果。如果构造函数没有返回对象，那个new出来的结果为步骤1创建的对象。
下面根据new的工作原理通过代码手动实现一下new运算符:
```javascript
var new2 = function (func) {
    var o = Object.create(func.prototype); 　　 //创建对象
    var k = func.call(o);　　　　　　　　　　　　　//改变this指向，把结果付给k
    if (typeof k === 'object') {　　　　　　　　　//判断k的类型是不是对象
        return k;　　　　　　　　　　　　　　　　　 //是，返回k
    } else {
        return o;　　　　　　　　　　　　　　　　　 //不是返回返回构造函数的执行结果
    }
}
```

### JS执行机制
*灵魂三问：*
1. JS为什么是单线程的？
2. 为什么需要异步？
3. 单线程又是如何实现异步的？

*答案：*
1. JS最初被设计用在浏览器中
> 场景描述:
> 现在有2个进程,process1 process2,由于是多进程的JS,所以他们对同一个dom,同时进行操作
> process1 删除了该dom,而process2 编辑了该dom,同时下达2个矛盾的命令,浏览器究竟该如何执行呢?
2. JS为什么需要异步
如果JS中不存在异步,只能自上而下执行,如果上一行解析时间很长,那么下面的代码就会被阻塞。
对于用户而言,阻塞就意味着"卡死",这样就导致了很差的用户体验
3. 单线程的JS如何实现异步
通过Event Loop事件循环，理解了Event Loop 机制，也就理解了JS的执行机制


首先明确两个概念：任务分为**同步任务**和**异步任务**。
ps:*因为有些任务(比如超清图片加载)消耗时间较长，故而会有异步任务。*

另外一个比较重要的概念：**Event Loop(事件循环)**。

什么是Event Loop?
1. 首先判断JS是同步还是异步,同步就进入主进程,异步就进入event table。
2. 异步任务在event table中注册函数,当满足触发条件后,被推入event queue。
3. 同步任务进入主线程后一直执行,直到主线程空闲时,才会去event queue中查看是否有可执行的异步任务,如果有就推入主进程中
4. 主线程不断重复上面的三步。（事件循环）


同步任务和异步任务都是广义概念，有更精细的任务定义：
- macro-task（宏任务）：包括整体代码script，setTimeout，setInterval，setImmediate, I/O, UI rendering*
- micro-task（微任务）：process.nextTick, Promises, Object.observe, MutationObserver

在ES6中，microtask被称作job

按照这种分类方式，JS的执行机制是：
- 执行一个宏任务,过程中如果遇到微任务,就将其放到微任务的【事件队列】里
- 当前宏任务执行完成后,会查看微任务的【事件队列】,并将里面全部的微任务依次执行完

参考图：
![宏任务微任务模式下的事件循环](http://p9jftl6n6.bkt.clouddn.com/event%20loop.png)

另一个PS: *js中事件队列的维护是由浏览器维护的*

### Promise
js是单线程程序，对于网络请求、浏览器事件处理等不得不采用异步方法。
Promise 是异步编程的一种解决方案，相对比较传统的回调函数和事件，Promise更加强大。
它是有社区最早提出和实现，ES6将其写进语言标准，统一用法，提供了原声的Promise对象。

Promise的三个状态：pending、fulfilled、rejetched。
pending: 进行中；
fulfilled： 已成功；
rejected：已失败

状态变化关系只存在两种：
- pending ————> fulfilled
- pending ————> rejected
而且，这三个状态不受外界影响。  怎么理解这句话？？为什么说这三个状态不受外界影响呢？处于何种目的，如何确保它不受外界影响。
而且，状态一旦变成fulfilled 或 rejected，就再也无法改变，这个又是怎么做到的。

Promise的优势在于链式调用。

Promise.prototype.all()
Promise.prototype.race()
Promise.prototype.resolve();
Promise.prototype.reject();

参考文章
[阮一峰的ES6 Promise部分](http://es6.ruanyifeng.com/#docs/promise)


// TODO js内存泄漏

// 前端性能优化

// JS的设计模式

// 水平垂直布局

// 盒模型内部机理

// BFC（块级上下文）及其内部机制

// jQuery 绑定事件的几种方式及区别

// jQuery 插件编写方式及原理

// Object.defineProperty()

// setTimeout 和 setInterval的区别（底层机理）

// FIS3打包慢的问题
