# jQuery

jQuery是早期前端开发中占比很重的一个库。在手动操作DOM和浏览器差异较大的时代，jQuery通过统一和简化不同浏览器之间的API，为程序开发带了极大的便利。所以jQuery的设计思路也是围绕这两点展开的。

*ps: 不做特殊说明，`$`在源码示例中等效`jQuery`。*

## jQuery做的主要工作
1. DOM查询及操作
2. ajax请求
3. animation动画
4. promise(deferred)
5. event handle
6. css style
7. 兼容性问题，抹平不同浏览器的间差异

## jQuery的特点
1. 面向对象 ————> prototype
2. API设计的特点 ————> 函数重载
   1.  jQuery对于DOM的操作是命令式的，那么相对就要要求使用成本是相对较低的，没有特别复杂的API设计，数量少，参数简单。
3. 内部封装，为了实现jQuery的几大功能，做了大量的内部封装例如类型判断方法class2type
4. 选择器引擎：Sizzle， 将查找函数当做数据缓存起来，如果下次碰见相同的selector，可以跳过selector的解析过程，直接执行元素的查找工作。

## jQuery的面向对象

jQuery实际采用面向对象的方式进行程序开发。`jQuery`本身是构造函数。

``` js
jQuery('body').constructor === jQuery // true
jQuery('body').addClass === jQuery.prototype.addClass // true

// 因为 jQuery('body')的constructor和 addClass方法分别指向 jQuery本身和jQuery.prototype上的addClass方法，
// 所以jQuery('body')返回的对象实际上就是jQuery构造函数生成的实例
```

但是在js中生成实例一般使用`new`操作符，而jQuery一般的写法是`$()`。这里其实是通过某种技巧省略了`new`操作符。首先有无`new`，生成的实例都是等效的。

```js
(new jQuery('body')).constructor === jQuery('body').constructor // true
(new jQuery('body')).__proto__ === jQuery('body').__proto__ // true
// 这就证实了 有无new操作符，返回的结果是等效的。
```
这样设计有一个好处是让构造jQuery对象更加方便。

那它的实现方式呢， 看一眼`jQuery`函数的定义：

``` js
jQuery = function( selector, context ) {
	return new jQuery.fn.init( selector, context );
};
```
我们发现jQuery方法返回的实际是 `jQuery.fn.init`的实例。同时，我们为了让生成的实例继承jQuery.prototype上的方法，还需要添加一行代码：

``` js
 jQuery.fn.init.prototype = jQuery.prototype;
```
关于js中构造函数和prototype的更多内容可以查阅其它资料。

关于`new`操作符，我们都知道在构造 函数没有指定return对象的时候，会返回`this`本身。如果我们在无`new`时，显式指定return对象为this（`return this;`），是不是也等效于new呢？

答案： **不是**。

这里和函数中this的指向有关。一个函数或方法在执行时，内部的this指向分为四个来源
1. func() ： this指向全局
2. obj.func()： this指向obj
3. call/apply： this指向传给call/apply的第一个参数
4. new操作符： this指向在函数内新创建的一个Object对象

## 封装与继承
已经确定jQuery的开发采用面向对象的方式。而面向对象的两个基本要素： **封装**和**继承**。
封装定义一个实例如何组装完成，继承定义多个实例间会共享的内容（行为）。

### 封装
`$.fn.init`方法做了jQuery对象的封装工作，通过一个简单的`$()`工厂函数调用。在init方法中，将一切可能的输入源封装为jQuery对象。
有个需要特别说明的地方是，`$()`方法除了接收普通的DOM对象或HTML字符串作为输入源返回一个jQuery对象外，还支持接收函数。这也是个语法糖，意思是在document ready的时候，调用这个函数。这么没有什么特别的目的，就是为了非常方便地定义一些在document ready执行的逻辑。因为在实际业务中，你的代码执行的时候可能还有很多元素未加载。

### 继承
jQuery对象的继承基于js的原型对象完成。所有的jQuery对象都共享$.prototype对象上的方法。同时jQuery给自身添加了`extend()`方法用于对象的扩展。那么，也同样可以用于扩展自身的prototype对象，从而实现功能的扩展。这也是jQuery插件实现的基本原理。

需要预先明确的点： `jQuery.prototype === jQuery.fn` 。 这有什么用？ 手敲代码的时候快一些。

## hooks
jQuery中许多地方用到了钩子思想，主要是用于处理浏览器的兼容性问题。在事件处理和css样式设置中的体现尤为明显。

### jQuery的事件处理
事件处理包含绑定，分发和删除三部分业务。jQuery中所有的事件（包括自定义事件）都会通过这三个方法进行处理。如果遇到自定义事件或者需要兼容性处理等特殊情况，会通过jQuery.event.special处理。

jQuery.event.special实现的基础是jQuery对浏览器的事件做了代理，所有在业务上需要绑定到元素事件的逻辑，最终都会交给一个统一的方法。这个方法通过原生API绑定到元素上，然后在事件被触发时，此方法根据事件的上下文进行业务逻辑的分发。

jQuery对事件的绑定最终都收缩到`jQuery.event.add`方法中，不论对外暴露的API是`on()`或者`one()`。 同时在模块内部也有一个`on`方法，这个方法同样起到函数重载的作用，将参数处理成规范形式然后提交给`jQuery.event.add`方法进行事件绑定操作。 

`jQuery.event.add`这个方法很有意思，它并没有直接把处理方法直接通过原生绑定方法绑定处理事件到元素上面。而是将EventHandler作为数据存到元素本身（存储的实现参考Data.js），如果元素对同一类型绑定了多个事件，这些事件会以数组的形式存在。如果没有把handler直接帮到元素的事件上面，那么如何在事件触发时，调起这些逻辑？其实是绑定了一个调度器，这个调度器会在事件触发时，将存储元素本身的方法逐一取出执行。

这是对于浏览器支持的普通事件的处理方式，如果是自定义事件呢？

答案就是 **jQuery.event.special**。 

假如在执行自定义事件`customEvent`绑定的逻辑时，jQuery首先检查`jQuery.event.special.customEvent`是否存在。如果存在的话，会走`jQuery.event.special.customEvent`中定义的逻辑。 这个对象一般包含四个方法： `setup`, `add`, `teardown`, 'remove'。作用于事件处理中不同生命周期。通过special对事件处理逻辑做拦截，在此基础上可以实现对原生事件行为的重写或者添加自定义事件。

如果不使用special，那么如何处理兼容性问题。if...else ? 写出来的逻辑成了面条式的代码。在事件处理中，包含三个基本要素： **绑定**，**解绑**和**分发**。针对同一个事件兼容性处理，可能需要在这三个处理方法中分别添加兼容性业务的处理。这样一来写出来的逻辑必然十分繁杂。如果我们以事件为单位，定义各自的三种逻辑，然后交给程序在合适的时间调起。这样一来，业务会清晰很多。

### $.fn.css()方法
关于css样式相关方法的hooks是以`jQuery.cssHooks`存在的，分为 `get` 和 `set`。

### ajax与dataType
$.ajax允许接收`dataType:jsonp`，但是我们知道`jsonp`是通过`<script>`脚本实现的跨域请求，它不能通过XMLHttpRequest发送。那么$.ajax有什么特别的处理么？ 

**prefilters**和**transports**。

这也是ajax可以自定义dataType的关键点，原理跟event.special 类似。


## jQuery.Callbacks
jQuery自己实现了一个Callbacks方法，用于管理回调，主要是为了提供给自己的defferred、ajax和animation使用。

实现基于观察者模式，对外暴露 add,remove,fire这几个API方法。 除了这三个方法，是无法在外部直接修改回调list和执行状态firing等数据的，通过闭包来实现。

同时提供了回调函数上下文的设置接口（fireWith）。

## 函数式编程与Sizzle

jQuery的设计思路就是找到页面上的一些元素并执行一些操作。其中负责“找”的便是selector。而这一部分最终成为一个独立项目Sizzle。

Sizzle作为查找器引擎，基于函数式编程的思路进行开发。基本的思路是将输入（selector字符串）转化为输出结果（与selector match的元素），不对输入数据做任何变更，通过不同的输入数据生成不同的函数然后执行最终函数获得目标数据。

Sizzle在转换selector的中间过程中，还对生成的函数进行缓存，进而在下次遇到相同的输入时，可以直接返回之前已经生成过的函数，从而获得性能的提升。

Sizzle本身实现了一个小型的compilor。为什么这么说，在早先浏览器不支持`querySelector/querySelectorAll`的时代，想一想':first', " p ~ p"等之类的元素查找。这种写法暗含了上下文相关。传统的`getElementsByTagName`方法必然包含了大量的回溯操作。这对于开发者是极为不便利的，jQuery封装了这些操作。这可能也是为什么当时可以快速流行并成为js中最流行的库的原因。

## 链式操作
在通过查找引擎Sizzle找到目标元素后，就可以对元素执行一些操作。
在jQuery中，我们都知道进行DOM操作可以采用链式写法，比如像下面这样对document.body进行操作：
``` js
$('body').addClass('foo').find('div').remove().end().addClass('bar')
```
那么如果不采用链式写法呢，会有什么样的结果，看下面
```js
$('body').addClass('foo');
$('body').find('div').remove();
$('body').addClass('bar');
```
所以，一目了然~~~

这样在进行DOM操作时，手写代码带来的便利性是显而易见的。实现这种写法的机制也很简单，就是在每一次操作之后，都返回对象自身`return this`。

但是，如果某个方法需要返回操作结果或者其它数据，那么这时候链式操作就无法满足了。

## 函数重载
jQuery中存在许多函数重载。我们知道函数重载是在函数名相同的前提下，根据参数类型或个数来区分不同的处理。那么函数重载在jQuery中有什么意义呢？

```js
$('body').css('width')
$('body').css('width', '800px')
$('body').css({
    'color': 'red',
    'border': '10px solid blue'
})
```
很明显，css()是方法是被重载的函数。那如果不对css进行重载呢，想像一下，如果实现上面的功能应该怎么设计程序。可能需要设计get/set方法或者针对每种参数类型都写一个方法。那么对外暴露的API就不仅仅是一个css()了。API的繁多是会增加使用者的学习成本的。

但是函数重载也不是只好不坏，增加了程序的复杂性。在jQuery中，存在一些单纯的normalize参数的方法。这样让开发者无法第一眼就知道最终调用的是哪个方法。这是对开发者而言，对于计算机，函数重载也可能会增加程序的消费。

关于函数重载，在jQuery的event处理中，得到了更明显的使用。绑定实践最终会调用jQuery.event.add方法，但是在这之前，会先走on()方法，这个方法主要的作用就是规范函数的参数。

函数重载最终的效果的通过参数个数或者参数类型，类区分不同的处理方案， 减少了对外暴露的API数量。但是函数重载的基础是在不同方案之间概念相近的情况下，才建议采用函数重载。这样对于使用者而言，也是清晰明确的。如果你把jQuery的find的方法重载到jQuery.css中，那谁可以一眼看出find方法在哪个API中呢。

## 收紧口子
举几个例子：
1. 所有的样式set 都走 `style()`方法；
2. 所有的样式get 都走 `css()`方法；
3. 所有的动画 都走 `animate()`方法；
4. 元素的追加和替换都走 `domManip()`方法；
什么时候该收，什么时候该放？在关键节点的上把控。

## 队列

动画都会以队列的形式执行，默认队列是`fx`，那么fx是如何实现的? 一个队列应该具有自执行的特点，将处理方法以数组的形式存储，然后再执行出栈时，给每个方法添加一个钩子，钩住下一个要执行的方法，在执行完后调用下一个方法。

这个模式跟compose很像，将多个函数合并成一个函数执行。

## 总结

jQuery从2005年发行至今（2019年11月），仍然在生产环境中占据一席之地的原因？
1. 短小精悍的API设计，上手成本低；
2. 较小的运行时负载， 足够好的性能；
3. 在API设计简单，功能强大基础上，代码量足够小；
4. 强大的扩展性，导致了非常丰富的生态；


### 关于运行时负载
运行时负载是现在React/Vue等框架随着业务功能的逐渐强大，也难以避免，最终总会有一个天花板存在。也因此，有人搞出了无运行时负载的框架。Vue3更是强调自己的运行时性能是2.x的一倍，部分提升得益于用Proxy替换了Object.defineProperty。所以对于框架或者库的设计，这也是应该考虑的方面。

## 参考
[jQuery.event实现的基本原理demo special-events](http://brandonaaron.net/blog/2009/03/26/special-events)

[~~jquery-edge-new-special-event-hooks~~](http://brandonaaron.net/blog/2009/06/4/jquery-edge-new-special-event-hooks)