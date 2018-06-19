---
layout: post
title: JS中的设计模式
date: 2018-04-30
tags: JavaScript,设计模式
categories: JavaScript
---

*什么是设计模式？*
> 设计模式是解决实际问题的一种固定思路，这些思路通常是从实际经验中总结而来。大部分问题的解决之道是有相同模式的，这些模式总结出来就是我们通常所讲的设计模式。

### 工厂模式
JS中创建对象的一种模式，可以理解为批量生产具有类似属性和行为的对象。
```javascript
// again factory pattern
function factory(name){
    var o = new Object();
    o.name = name;
    o.type = 'factory';
    o.can = function(){
        console.log('My name is ' + this.name);
    }
}
var o1 = factory('o1');
var o2 = factory('o2');

o1.can(); // My name is o1
o2.can(); // My name is o2
```
工厂模式具有问题就是不知道对象是那个工厂函数创建的。

看一下下面的代码，复杂的工厂模式
```javascript
function Factory(){
    this.name = 'factory';
    this.can = function(){
        console.log('I can produce the product');
    }
}
Factory.prototype.produce = function(){
    // 下面实现子类中重复性的业务
    console.log('I start work at 8 clock');
    // throw new Error('fn: produce has to be define by Sub');
}

function extend(Sub, Sup){
    Sub.prototype = new Sup();
    Sub.prototype.constructor = Sub;
    Sub.prototype.sup = Sup.prototype;
}

// another extend func (just inherit the Sup's prototype)
function extend2(Sub, Sup){
    var F = function(){};
    F.prototype = Sup.prototype;

    Sub.prototype = new F(); // ?? 为什么要借助一个中间函数F
    Sub.prototype.constructor = Sub;
    Sub.sup = Sup.prototype;
}

function CarFactory(){
    this.type = 'car';
    Factory.call(this);
}
CarFactory.prototype.produce=function(){
    PhoneFactory.sup.produce.call(this);
    console.log('I produce the car');
}


function PhoneFactory(){
    this.type = 'phone';
    Factory.call(this);
}

extend2(PhoneFactory, Factory);
PhoneFactory.prototype.produce=function(){
    PhoneFactory.sup.produce.call(this);
    console.log('I produce the phone');
}
var phone = new PhoneFactory();
var sub = new CarFactory();
```

### 单体模式
单体模式的特点使实例只会被实例化一次。虽然，对象字面量也可以看做是实现单体模式的一种方式，但它不能实例化。
```javascript
function SinglePattern(name){
    if(SinglePattern.instance){
        return SinglePattern.instance;
    }
    this.name = name;
    this.say = function(){
        console.log(this.name);
    }
    SinglePattern.instance = this;
}

var a = new SinglePattern('aaaaa');
var b = new SinglePattern('bbbbb');

a.say(); // aaaaa
b.say(); // aaaaa
a === b; // true  因为单体模式下，只能被实例化一次，当第二次new的时候，返回的是第一次生成的实例

```
？？？那么问题来了，页面弹窗是否可以考虑使用单体模式？

单体模式的高级写法：
```javascript
var getSingleInstance = function(fn){
    var o = null;

    return function(){
        return o || (o = fn.apply(this, arguments));
    }
}

// 创建一个弹窗实例的方法
function createDlg(html){
    console.log(arguments);
    var div = document.createElement('div');
    div.innerHTML = html;
    div.style.display = 'none';
    return div;
}
// 创建iframe实例的方法
function createIframe(html){    
    var iframe = document.createElement('iframe');
    iframe.innerHTML = html;
    iframe.style.display = 'none';
    return iframe;
}

var createSingeDlg = getSingleInstance(createDlg);
var createSingeIframe = getSingleInstance(createIframe);

var dlg1 = createSingeDlg( 'dlg1');
var dlg2 = createSingeDlg( 'dlg2');
var iframe1 = createSingeIframe('iframe1');
var iframe2 = createSingeIframe('iframe2');

console.log(dlg1.innerHTML); // dlg1
console.log(dlg2.innerHTML); // dlg1
console.log(iframe1.innerHTML); // iframe1
console.log(iframe2.innerHTML); // iframe1

```
代码示例中最终输出结果证明了只有一个实例被生成

### 模块模式
还没弄懂这种模式的使用场景，留个坑先

### 代理模式
**保护机制**： 过滤掉一些不合理的行为；下面这个例子中,from想送礼物给to, 但是to对于价格低于200的礼物不会接受，这时候它就找了个proxy，帮它甄别这些礼物。
```javascript
var to = function(){
    this.received = function(gift){ console.log("I have received the " + gift); }
}

var from = function(price, name){
    this.gift={
        price: price,
        name: name
    }
    this.sendGift = function(proxy){
        console.log('I send a gift, and its price is：' + this.gift.price);
        proxy.sendGift(this.gift);
    }
}

var proxy=function(){
    this.sendGift = function(gift){

        if(gift.price < 200){
            console.log('The gift\'s price is too low~~');
        } else {
            new to().received(gift.name);
        }
    }
}

var proxy = new proxy();

new from(100, 'book').sendGift(proxy);
new from(300, 'car').sendGift(proxy);
```

**单一原则**：对一个类而言，只做一件事；应用实例（图片预加载）
*PS: 面向对象设计的原则之一：单一原则*
```javascript
var loadingImg = 'https://loading.io/assets/img/ajax.gif';
var targetImg = 'https://bpic.588ku.com/original_origin_min_pic/18/05/31/f7c539d4b0e349d0869838920f9fc05c.jpg';
// 传统方式的加载
var loadImage=function(src){
    var imgNode = document.createElement('img');
    imgNode.src = loadingImg;
    document.body.appendChild(imgNode);
    var img = new Image();
    img.onload=function(){
        imgNode.src = src;
    }
    img.src = src;
}
loadImage(targetImg);

// 使用代理模式
var loadImg = (function(){
    var imgNode = document.createElement('img');
    document.body.appendChild(imgNode);
    return function(src){
        imgNode.src = src;
    }
})();
var proxy = (function(){
    var img = new Image();
    img.onload=function(){
       loadImg(this.src);
    }
    return function(src){
        loadImg(loadingImg);
        img.src = src;
    }
})();

proxy(targetImg);
```

**缓存代理**：对一些开销大且可能重复性的任务进行缓存处理。
下面实现有个求和函数，如果所有的参数都相同，则直接从缓存中取上一次的计算结果。
```javascript
function sum(arr){
    var sum = 0;
    sum = arr.reduce(function(pre, cur){
        return pre + cur;
    });
    return sum;
}

var proxy = function(arr){
    if(!proxy.cache){
        proxy.cache = {};
    }
    arr.sort();
    if(proxy.cache[''+arr.join('')] !== undefined){
        console.log('The result is from cache');
        return proxy.cache[arr.join('')]
    } else {
        proxy.cache[arr.join('')] = sum(arr);
        return proxy.cache[arr.join('')]
    }
}
```
**虚拟代理**：把一些开销很大 的操作延迟到真正需要的时候再进行；
文件同步的例子，比如客户端C要从服务端S下载文件。在客户端,每个文件都有个checkbox。
勾选CheckBox，则下载文件；不勾选，则不需要下载服务端的文件
```javascript
var download = function(file){ console.log('download file: ' + file);}

var Proxy = function(){
    var that = this;
    if(Proxy.o){
        return Proxy.o;
    }
    this.files = [];
    setInterval(function(){
        that.files.forEach(function(v){
            download(v);
            that.files.remove(v);
        })
    }, 5000);
    Proxy.o = this;
}

var p = new Proxy();
var ul = document.createElement('ul');
document.body.appendChild(ul);
for(let i = 0; i < 20; i++){
    let li = document.createElement('li');
    let file = (+new Date())+(Math.random(0,1)* 10000).toFixed(0);
    li.innerHTML = '<input type="checkbox" value="' + file + '">' + file;
    li.onclick=function(){
        var input = li.firstElementChild;
        if(input.checked){
            p.files.add(input.value);
        } else {
            p.files.remove(input.value);
        }
    }
    ul.appendChild(li);
}

Array.prototype.add=function(item){
    if(this.indexOf(item) == -1){
        this.push(item);
    } 
}
Array.prototype.remove=function(item){
    let i = this.indexOf(item);
    this.splice(i, 1);
}
```

### 观察者模式
下面是个开胃菜，一个很简单的例子
```javascript
// 创建对象
var o = { };

function observer(oldVal, newVal) {
    // 其他处理逻辑...
    console.info('name属性的值从 '+ ( oldVal || '' ) +' 改变为 ' + newVal);
}

Object.defineProperty(o, 'name', {
    configurable: true,
    enumerable: true,
    get: function(){
        return this.val;
    },
    set: function(n){
        observer(this.val, n);
        this.val = n;
    }
});

o.name = 1;
o.name = 2;
```

### 发布订阅模式
这种模式跟**观察者模式**很类似，他们都实现了不同组件间的解耦。
```javascript
Array.prototype.add=function(item){
    if(this.indexOf(item) == -1){
        this.push(item);
    } 
}
Array.prototype.remove=function(item){
    let i = this.indexOf(item);
    this.splice(i, 1);
}

function Com(name){
    this.name = name;
}
Com.prototype = (function () {
            var events = {};
            return {
                on: function (e, fn) {
                    events[e] = events[e] || [];
                    events[e].add(fn);
                },

                off: function (e, fn) {
                    events[e] = events[e] || [];
                    if (fn) {
                        events[e].remove(fn);
                    } else {
                        events[e] = null;
                    }
                },

                fire:function(e, data){
                    if(events[e]){
                        events[e].forEach(function(fn){
                            fn(data)
                        });
                    }
                }
            }
        })();

Com.prototype.constructor = Com;

var a = new Com('a');
a.on('e.a', function(d){console.log(d)});

var b = new Com('b');
b.fire('e.a', 'b')

// 多写了一个深度复制的方法
Object.defineProperty(Object.prototype, 'extend', {
    confiugrable: true,
    enumerable: false,
    writable: false,
    value: function(){
        var source = null;

        while(source  = Array.prototype.shift.call(arguments)){
            for(key in source){
                if(typeof source[key] === 'object'){
                    this[key] = this[key] || Array.isArray(source[key]) ? [] : {} ;
                    this[key].extend(source[key]);
                } else {
                    this[key] = source[key];
                }
            }
        }
    }
});

```

### 迭代器模式
```javascript
var Iterator = function() {
    this.index = 0;
    this.items = [1,2,,3,4,5];
}

Iterator.prototype={
    next: function(){
        if(this.index >= this.items.length){
            this.index = this.index - this.items.length;
        }
        return this.items[this.index++];
    },
    hasNext: function(){
        return this.index < this.items.length;
    },

    rewind: function(){
        this.index = 0;
    },

    current: function(){
        return this.items[this.index]
    }
}
Iterator.prototype.constructor = Iterator;

var a = new Iterator();
var b = new Iterator();

console.log(a.next());
console.log(a.next());
console.log(b.next());

```

利用迭代器模式，重写了Array.prototype.reduce方法
```javascript
(function(){
    function Array1(a){
        var values = new Array();
        values.push.apply(values, arguments);
        values.next = 1;
        values.cur = 0;
        return values;
}

Array.prototype.reduce1=function(fn){ 
    if(this.length==0){
        return null;
    }
    if(this.length == 1){
        return fn(this[0], '', 0, this);
    }
    if(this.length == 2){
        return fn(this[0], this[1], 1, this);
    }
    var that = this, pre = that[0];
    while(this[this.next]){
        pre = fn(pre, that[that.next], that.next, that);
        this.cur++;
        this.next++;
    }
    return pre;
}

var a = new Array1(1,2,3,4);
var r = a.reduce1(function(pre, cur, index, arr){
    return pre * cur;
});

console.log(r);

})()
```

### 装饰者模式
在不改变原有对象基础上，丰富原对象的功能。
```javascript
function A(){
    this.name = 'A';
}
A.prototype.say=function(){console.log(this.name)}

var say1 = A.prototype.say;

A.prototype.say=function(){
    say1.call(this);
    console.log("I am new say fn ");
}
var a = new A();
a.say();
```
装饰者模式的一个应用场景有哪些？
面向切面编程 Aspect Oriented Programming（AOP）

下面的例子中一个前置装饰，一个后置装饰。
```javascript
Function.prototype.before=function(beforeFn){
    var that = this;
    return function(){
        beforeFn.apply(this, arguments);
        return that.apply(this, arguments);
    }
}
Function.prototype.after=function(afterFn){
    var that = this;
    return function(){
        var result = that.apply(this, arguments);
        afterFn.apply(this, arguments);
        return result;
    }
}
function foobar(x, y){
    console.log(x, y)
}

function foo(x, y){
    console.log(x/10, y/10);
}

function bar(x, y){
    console.log(x*10, y*10);
}

foobar = foobar.before(foo).after(bar);

foobar(2,3);
// 0.2 0.3
// 2 3
// 20 30
```

AOP的应用场景相对而言，还是比较广泛的。日志系统、安全控制/访问控制、性能监测以及缓存等，这些都是AOP的典型应用场景。
