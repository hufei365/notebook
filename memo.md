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
？？？（需要程序验证） 1. 使用浏览器对前进，后退键会重新发送请求，没有合理地利用缓存


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
普通对象、函数对象
构造函数、实例
原型对象
每个函数对象都有一个prototype属性，指向该函数对象的构造函数。

定律一： **每个对象都有一个__proto__属性，但函数对象还有个prototype属性。**

原型对象是构造函数的一个实例。


// TODO js内存泄漏