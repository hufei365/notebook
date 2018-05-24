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


### 闭包作用域原型链
词法作用域、动态作用域
