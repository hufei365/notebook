## ES6中的Promise

### Promise出现的背景
先抛出一个概念：**回调地狱**。如果你知道回调地狱的意思，那么你可能就不需要看下面的这段内容了。

众所周知JavaScript是单线程语言，So～，它不具有实现异步编程的先天基础。但这并不是意味它无法实现异步编程，**回调函数**就是早期的一种方案。但是，如果在一个回调函数当中，再形成一个回调，如此反复，一层层嵌套下去，就会形成一个很长的回调链。这样的代码不具有可读性也不利于维护，就形成了回调地狱。特别典型的例子，这是某打车公司之前写过的代码
[callback-hell](http://p9jftl6n6.bkt.clouddn.com/callback-hell.jpg)

在这种情况，Promise就出现了。**它让异步编程可以以同步的方式来编写**。
它是有社区最早提出和实现，ES6将其写进语言标准，统一用法，提供了原生的Promise对象。

### Promise中基本概念

**promise**:  一个带有`then`方法的对象或者方法，其行为符合基本规范；
**thenable**: 定义了`then`方法的对象或函数；
**value**: 一个合法的JavaScript值（包括基础类型undefined, Number以及引用类型 function, promise等）；
**exception**: 异常，是程序执行中不可预知的错误信息；
**reason**: 拒绝的原因，通常是promise拒绝（没有按照正常运行）的原因；


来源：[Promises/A+](https://promisesaplus.com/)

### Promise状态
Promise 只可能有三种状态： **等待中（Pending）**、**成功（Fulfilled）**、**失败（Rejected）**。

处于`pending`态时，只能向 `fulfilled` 或 `rejected` 转变，且 **过程不可逆**。

转变成`fulfilled`后，`then`方法被执行。下面是关于then方法 的介绍。

### then()方法
`then`方法接受两个参数，都是可选的。先来看一个Promise的例子：
``` javascript
const promise = new Promise((resolve, reject)=>{
    window.setTimeout(()=>{
        resolve(new Date());
    },1000)
});

promise.then((data)=>{
    console.log(data);
}, (error)=>{
    console.log(error);
})
```
上面的例子中，先不要关心 new Promise 语句，只看then方法。 then方法接受两个方法作为参数。
第一个方法，是promise 状态 由 `pending` 变成 `fulfilled`后，被执行的。这个方法接受一个参数，就是 `new Promise`语句中， resolve给出的日期。

第二个方法，是promise 状态 由 `pending` 变成 `rejected`后，被执行的。这个方法接受一个参数，就是 `new Promise`语句中， reject 给出的(示例代码中没有给出演示)。

PS：`then`方法的两个参数必须是function； 如果不是function，会被自动忽略。

`then`方法可以链式的写，像这样`promise.then(fn).then(fn).then();`
``` javascript
const promise = new Promise((resolve, reject)=>{
    window.setTimeout(()=>{
        resolve({a:0});
    },1000)
});
promise.then((data)=>{
    console.log(data.a++);
    return data;
}
, (error)=>{
    console.log(error);
}
).then((data)=>{
    console.log(data.a++);
    return data;
}).then((data)=>{
    console.log(data.a)
});
```
输出结果
> 0 
> 1
> 2

### resolve 和 reject
说白了，这俩方法就是用来改变promise状态的。
- resolve 将 promise 的状态 由 `pending` 变成 `fulfilled`；
- reject 将 promise 的状态 由 `pending` 变成 `rejected`；

resolve只能接受一个参数，它就是promise的终值（last value）。这个值最终会传给then方法中第一个参数）。

promise中的终值可以是JavaScript中任何类型的值。在实际场景中，这个值一般是异步操作结束后，获得的并将要给下一步操作的值。

reject同resolve方法一样，接受一个参数，不同是，它接受的这个参数会被then方法的第二个参数调用。


### race()方法
`race ` 适用于多个异步操作的场景。当有多个promise时，哪个promise先返回结果（状态发生变化），就接受哪个promise的返回值。假设我们如下两个promsie： p1 和 p2。

``` javascript
const p1 = new Promise((resolve)=>{ setTimeout(()=>{resolve('p1')}, 1000);});
const p2 = new Promise((resolve)=>{ setTimeout(()=>{resolve('p2')}, 2000);});

Promise.race([p1, p2]).then((data)=>{
    console.log(data);
});
```
不出意外的话，上面的代码输出结果是‘p1’，因为p1的返回结果比p2快。

### all()方法
`all`方法也用于处理多个异步操作的场景，与`race`方法不同的是，`all`方法会等待所有的promise返回结果，所有的返回结果会以数组的形式传递给接下来的处理逻辑。

``` javascript
const p1 = new Promise((resolve)=>{ setTimeout(()=>{resolve('p1')}, 1000);});
const p2 = new Promise((resolve)=>{ setTimeout(()=>{resolve('p2')}, 2000);});

Promise.all([p1, p2]).then((data)=>{
    console.log(data);
});
```

有一点需要说明的是，如果这些promise中，只要有一个的状态变化是从`pending`变成`rejected`，那么`all`方法就会立马结束等待，并按rejected进行处理。

### Promise与 async/await的关系
Promise 很好的解决了 **回调地域**的问题，但是在实际使用中，也还有些不完美，比如必须写 `new Promise`、异常处理等。

``` javascript
const p1 = new Promise((resolve, reject)=>{
    setTimeout(()=>{
        // reject('Error'); // 这样的异常处理，我们可以通过then方法的第二个参数捕捉到
        throw('tese Error catch'); // 那如果这样呢???
        reject('1');
    },1000)
})

p1.then(()=>{}, (err)=>{
    console.log(err);
}).catch((err)=>{
    console.log('catch the ERROR');
})
```

**async/await**的出现，是为了解决Promise存在的一些问题，它使异步代码看起来更像同步代码

``` javascript
const p1 = new Promise((resolve)=>{ setTimeout(()=>{resolve('p1')}, 1000);});
const func = async ()=>{
    console.log(await p1)
}
func(); // p1
```
这个例子中，借用了上一步写的p1，实际上`await`后面跟的是一个异步操作即可。

关于异常处理，在async/await中的写法。
``` javascript
const p1 = new Promise((resolve)=>{ throw new Error('test error handle');});
const func = async ()=>{
    try{
        console.log(await p1);
    } catch(err){
        console.log(err)
    }
}
func(); // 输出错误信息
```
这种写法，跟普通的同步程序没有差别。

有一点需要明确，async/await看上去比Promise好很多，但是它只是一种语法糖。它的实现基础依然是基于Promise。

### 市面上其它相关解决方案
- async/await: 本质上可以看作Promise 的语法糖，以同步的方式写异步代码，可以应用try catch 语句捕获异常；需要注意的是如果使用不当，会造成代码阻塞。
- jQuery中的`Deferred`

### 补充内容，自己实现一个简单的Promise

``` javascript
var p = new Promise((resolve, reject)=>{
    window.setTimeout(function(){
        resolve(1);
    }, 1000);
});

p.then((data)=>{console.log(data);})
function MyPromise(fn){
    var self = this;
    var callbacks = [];
    this.then=function(fn){
        callbacks.push(fn);
    }
    function resolve(data){
        callbacks.map((f)=>{
            f.call(self, data);
        });
    }
    fn(resolve, reject)
}

var mp = new MyPromise(function(resolve, reject){
    window.setTimeout(function(){
        resolve(2);
    }, 1000);
});
mp.then((data)=>{
    console.log(data);
});
```