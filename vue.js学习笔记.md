## vue.js学习笔记

### vue.js做的一些事情
设置数据监听、
编译模板、
将实例挂载到 DOM 
在数据变化时更新 DOM 等。

在这个过程中也会运行一些叫做**生命周期钩子**的函数，这给了用户在不同阶段添加自己的代码的机会。

### vue.js指令支持动态参数

``` html
<a v-on:[eventName]="doSomething"> ... </a> <!--right-->

<!-- 这会触发一个编译警告 -->
<a v-bind:['foo' + bar]="value"> ... </a>

```

### 计算属性的定位
模板内的表达式非常便利，但是设计它们的初衷是用于简单运算的。在模板中放入太多的逻辑会让模板过重且难以维护。

计算属性就是为了解决上述问题存在的。

### 计算属性其实也具有setter方法

``` javascript
// ...
computed: {
  fullName: {
    // getter
    get: function () {
      return this.firstName + ' ' + this.lastName
    },
    // setter
    set: function (newValue) {
      var names = newValue.split(' ')
      this.firstName = names[0]
      this.lastName = names[names.length - 1]
    }
  }
}
// ...
```

### 计算属性与方法的区别
两种方式的最终结果是一致的。
不同的是**计算属性是基于它们的依赖进行缓存**的，只在相关依赖发生改变时它们才会重新求值。

### 计算属性与侦听器watcher的区别
当需要在数据变化时执行异步或开销较大的操作时，这个方式是最有用的。
在watcher中可以通过命令式的风格自定义响应行为，例如设置中间状态，限制操作的频率等，这些都是计算属性无法做到的。


### Class与Style绑定
1. `v-bind:class`支持数组写法： 

``` html
<div v-bind:class="[activeClass, errorClass]"></div>
```

``` javascript
data: {
  activeClass: 'active',
  errorClass: 'text-danger'
}
```

2. `v-bind:style`支持多重值
从 2.3.0 起你可以为 style 绑定中的属性提供一个包含多个值的数组，常用于提供多个带前缀的值，例如：

``` html
<div :style="{ display: ['-webkit-box', '-ms-flexbox', 'flex'] }"></div>
```

这样写只会渲染数组中最后一个被浏览器支持的值。在本例中，如果浏览器支持不带浏览器前缀的 flexbox，那么就只会渲染 display: flex。


### 条件渲染
Vue 会尽可能高效地渲染元素，通常会复用已有元素而不是从头开始渲染。如果你不想Vue不这么做，可以使用key来区分这些元素。


### `v-if`与`v-show`的区别
`v-if` 是“真正”的条件渲染，因为它会确保在切换过程中条件块内的事件监听器和子组件适当地被销毁和重建。

`v-if` 也是惰性的：如果在初始渲染时条件为假，则什么也不做——直到条件第一次变为真时，才会开始渲染条件块。

相比之下，`v-show` 就简单得多——不管初始条件是什么，元素总是会被渲染，并且只是简单地基于 CSS 进行切换。

一般来说，`v-if` 有更高的切换开销，而 `v-show` 有更高的初始渲染开销。因此，如果需要非常频繁地切换，则使用 `v-show` 较好；如果在运行时条件很少改变，则使用 `v-if` 较好。

### `v-if`与`v-for`的区别
不推荐`v-if`与`v-for`一起使用，因为`v-for`的优先级高于`v-if`，所以先执行`v-for`。两者在一起写的会产生如下情况：

``` javascript
// <li v-for="i in arr" v-if="i<3"></li>

arr.filter(v=>v<3)
```
