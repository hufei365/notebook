---
layout: post
title: Koa2学习笔记
date: 2016-05-30
categories: JavaScript
tags: Koa2,Node.js
---

如果不想看这些概念性的东西，可以直接跳到下一篇：[Koa2简单上手](/);
先来看看来自官网的一句话介绍自己 :smile: (=^ ^=)。
> Koa -- 基于 Node.js 平台的下一代 web 开发框架。
下面这段话也是

> koa 是由 Express 原班人马打造的，致力于成为一个更小、更富有表现力、更健壮的 Web 框架。 使用 koa 编写 web 应用，通过组合不同的 generator，可以免除重复繁琐的回调函数嵌套， 并极大地提升错误处理的效率。koa 不在内核方法中绑定任何中间件， 它仅仅提供了一个轻量优雅的函数库，使得编写 Web 应用变得得心应手。
之所以抄录是因为官方对自己定位和认知很明确呐~<!--more-->
我们挑出几个关键词，来展开本文的内容。
1. [Web应用](#webapp)
1. [Web框架](#webframework)
1. [Express](#express)
1. [generator](#generator)
1. [中间件](#middleware)

如果不太明白官网介绍的是什么意思，可以这么理解。koa说我这儿已经把框架都搭建好了，你自己需要啥，可以很方便快捷的添加进去，不会有限制，也不会有性能损失。 一句话：Koa本身做的工作仅仅是定制了中间件的编写规范，而不内置任何中间件。话说这一直是我们设计框架追求的极致思想呐。不过换到具体业务场景中，我们可以根据实际需要，适当的放宽或限制出入口。这样对生产效率反而有更大帮助。

<span id='webapp' ></span>
#### 什么是Web应用
Web应用一般指通过浏览器提供服务的应用程序。 直白的说，可以认为Web应用是一堆网页的集合。用户通过网页，来与应用程序互动。网页是由部署到服务器上的应用程序产生的，用户通过互联网访问相应的URL获取相应的网页。在这里，我们说的网页可以简单理解为html代码（其他类型的数据比如json等在某种意义上也是一样的）， web应用就是根据不同的url,产生不同的html数据返回给用户端的浏览器，再有浏览器解析html数据展示成用户最终看到的样子。目前的Web应用包括电商网站、论坛、博客、门户网站等。
而Koa 就是用来开发Web应用的东西。

<span id="webframework"></span>
#### 什么是Web框架
知道了什么是web应用，接下来就说说web框架是用来做啥的。简单来说，不论开发什么样的web应用程序，总有一些工作是相同的；比如数据缓存、数据库访问、数据安全校验等。web框架出现的目的就是把这些相同的工作全都处理好了，你只需要在框架的基础上写实际场景的业务逻辑就好了。这样一来可以快速地创建web应用，同时也不必做重复性的工作。常见的web框架，java语言的有ssm(spring spring-mvc和mybatis)或ssh(spring struts hibernate), python语言的有Django 和Flask, 而在Node.js上，则有express, koa目前正在快速发展中， 目前有取代express的趋势。

<span id="express"></span>
#### Koa 与 Express 的关系
要讲Koa 与 Express的关系，那网上的文章就海了去了，可以演好几集电视剧呢~~。先声明，不站队，保平安。
Express和Koa最明显的差别就是处理HTTP请求的方式，一个通过callback，一个是利用Generator（）。
上一张图：
<center>![Express 和Koa的区别](http://7xlxb6.com1.z0.glb.clouddn.com/Express%20VS%20Koa2.JPG)</center>

**Koa**
优点：
> - 借助 promise 和 generator 解决了 callback hell，
- 更轻量化，不绑定router、view等组件
缺点：
> - 需要自己组合不同的中间件，对于小白来说，门槛较高；
- 社区生态比不上Express丰富；

**Express**
优点：
> - 社区活跃，资料丰富，利于学习使用；
- 线性逻辑，通过中间件形式把业务逻辑细分、简化，一个请求进来经过一系列中间件处理后再响应给用户，清晰明了
- 内置功能比较完善，可以很方便的进行业务逻辑开发；
缺点：
> - 基于 callback 组合业务逻辑，业务逻辑复杂时嵌套过多，异常捕获困难（Callback Hell！）
- 灵活性比不上Koa

<span id="generator"></span>
#### Koa中的generator
还不知道设计者当初设计generator的初衷是啥，但是目前来看，generator多数时候被用在了异步问题的解决上。使用generator可以近似地以同步的方式编写代码。之前javascript对于异步的实现主要就是**回调函数**，**事件监听**，**promise**等。

在Koa1中，处理中间件主要靠的就是Generator。这个在Koa2中换成了async/await,但是官方依然支持generator的写法。但在v3中，可能不再做支持。
详情可以参考Koa2的源码以及文档[Migrating from Koa v1.x to v2.x](https://github.com/koajs/koa/blob/master/docs/migration.md)
```javascript
if (isGeneratorFunction(fn)) {
    deprecate('Support for generators will be removed in v3. ' +
            'See the documentation for examples of how to convert old middleware ' +
            'https://github.com/koajs/koa/blob/master/docs/migration.md');
    fn = convert(fn);
}
```

既然聊到了Generator,我们在发散一下，了解下
**和`generator`有关联的几个关键词**：       
"**\***":  生成器函数在声明的时候，function和函数名之间有一个**\***号；
**yield**:  生成器函数体内部可以使用yield；
**yield\***:  yield* 后面的跟的只能是一个generator实例；
**next**:  属于迭代器的方法，next方法会执行函数体，直到遇到第一个yield语句，然后挂起函数执行，等待后续调用
**Iterator（迭代器）**:  ES6的特性，具有一些专门为迭代过程设计的专有接口，例如next
**`…`运算符**:  展开运算符，ES6的特性


由于node支持了async/await, 所以在Koa2中，抛弃了传统的co库，转而使用async/await。
Koa1.x中间件的写法
```javascript
// 注意function后面跟着的“*”
app.use(function *(next) {
  const start = Date.now();
  yield next;
  const ms = Date.now() - start;
  console.log(`${this.method} ${this.url} - ${ms}ms`);
});
```
Koa2.x中间件的写法
```javascript
// 注意async和await的写法
app.use(async (ctx, next) => {
  const user = await Users.getById(this.session.user_id);
  await next();
  ctx.body = { message: 'some message' };
})
```
在这里简单说一下`generator`、`co库`、`async/await`三者的关系。
**`generator`,`co库`,`async/await`三者的关系**

**Generator**:  使用next()执行generator代码，每次遇到yield就返回一个对象{ value: x, done: true/false }， 如果done为true，则value就是return的返回值，没有return就返回undefined，如果return语句后面还有yield，这个generator对象就全部执行完成，不要再继续调用next()了直接用for ... of循环迭代generator对象，这种方式不需要我们自己判断done

**co 模块**: co 模块的思路就是利用 generator 的这个特性，将异步操作跟在 yield 后面，当异步操作完成并返回结果后，再触发下一次 next() 。当然，跟在 yield 后面的异步操作需要遵循一定的规范 thunks 和 promises。

**async/await**
1. **内置执行器**: Generator 函数的执行必须靠执行器，所以才有了 co 函数库，而 async 函数自带执行器。也就是说，async 函数的执行，与普通函数一模一样，只要一行。
1. **更好的语义**: async 和 await，比起星号和 yield，语义更清楚了。async 表示函数里有异步操作，await 表示紧跟在后面的表达式需要等待结果。
1. **更广的适用性**: co 函数库约定，yield 命令后面只能是 Thunk 函数或 Promise 对象，而 async 函数的 await 命令后面，可以跟 Promise 对象和原始类型的值（数值、字符串和布尔值，但这时等同于同步操作）。

<span id="middleware"></span>
#### Koa中的中间件
常用的中间件：
- koa-router 路由
- koa-views 页面渲染相关
- koa-bodyparser POST数据处理
- koa-session session相关
- koa-static 静态资源



#### 参考资料
[js-ES6学习笔记-Iterator](https://www.cnblogs.com/zczhangcui/p/6502836.html)

下一篇：[Koa2简单上手](/post/5acdd4bb5963ea40b182013c)