title: Koa2简单上手
date: 2017-10-13 10:19:02
tags: node,Koa2
<!--title-->

Koa 依赖 node v7.6.0 或 ES2015及更高版本和 async 方法支持.

你可以使用自己喜欢的版本管理器快速安装支持的 node 版本：
```shell
nvm install 7
npm i koa
node my-koa-app.js
```

### 经（lan）典(da)的(jie)hello world
```javascript
const Koa = require('koa');
const app = new Koa();

app.use(async ctx => {
  ctx.body = 'Hello World';
});

app.listen(3000);
```
访问服务器的3000端口就可以看到页面上的“Hello World”了。

### 在Koa2中添加中间件
添加的这个中间件会在服务端输出http请求响应时间
```javascript
const Koa = require('koa');
const app = new Koa();

/*下面的app.use中的function就是一个中间件*/
/*记录http请求响应时间*/
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}`);
});

app.use(async ctx => {
  ctx.body = 'Hello World';
});

app.listen(3000);
```

### 添加路由设置
#### 首先自己来个皮毛级别的路由
根据路径不同，页面显示不同的内容
```javascript
const Koa = require('koa');
const app = new Koa();

/*下面的就是一个路由*/
app.use(async (ctx, next) => {
  if(ctx.url == '/'){
      ctx.body = 'this router for "/"'
  } else if(ctx.url == '/home'){
      ctx.body = 'this router for "/home"'
  }
});


app.listen(3000);
```
#### 别人造的轮子koa-router
koa中比较常用的router中间件[koa-router](https://www.npmjs.com/package/koa-router)
首先安装koa-router
```shell
npm install koa-router
```
然后在项目中引入
```javascript
const Koa = require('koa');
const Router = require('koa-router');
const app = new Koa();
const router = new Router();

/*下面的就是一个koa-router实现的路由*/
router.get('/', (ctx, next) => {
  ctx.body = 'koa-router for "/"';
});
router.get('/home', (ctx, next) => {
   ctx.body = 'koa-router for "/home"';
});
router.get('/detail/:id', (ctx, next) => {
   ctx.body = 'koa-router for "/detail" \n and your id is: ' + ctx.params.id);
});
/*上面的三个get演示了基本的路由功能*/

app.use(router.routes());

app.listen(3000, function(){
    console.log('server start at port:3000');
});
```
当然，在成熟的项目中，router最好是拿出来单独一个文件，处于项目管理和代码维护的角度（一不小心用了个倒装）。



