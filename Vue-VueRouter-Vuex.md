## Vue


### Vue LifeCycle Hooks
> 
> - beforeCreate
> - created
> - beforeMount
> - mounted
> - beforeUpdate
> - updated
> - activated: keep-alive下的组件，当作为当前视图时
> - deactivated: keep-alive下的组件，从当前移除时；
> - beforeDestroy
> - destroyed
> - errorCaptured
> 


keep-alive下的组件不会被Vue destroy



## Vue-Router


**Vue-router的本质还是 Vue Components**
```js
// define reacitve data 
// name is "_router"
Vue.util.defineReactive(this, '_route', this._router.history.current)

// ......
// ......

// change the value of "_route"
// then trigger view update
app._route = route; 
```

如何把`<router-view>` 与 `_router`的关联起来的？

RouterView是一个函数式组件，在Vue中，`updateComponent`会调用函数式组件的`render`的方法。


## Vuex
Vuex用于多组件之间的状态共享。

如果多个组件共享多个状态，那么这些组件之间的关系存在以下几种情况：

1. 父子关系
2. 兄弟关系
3. 堂（堂堂...）兄弟关系
4. 祖先后台（多级嵌套）关系

那么，在这些组件之间进行状态变更，则程序极有可能变得无比混乱。

### 1.先看vue的一个基本模式

这是vue的组件中，state、view、action三者之间的基本关系

![vue-state-flow](https://vuex.vuejs.org/flow.png)

1. 状态驱动视图渲染
2. 视图提供行为窗口
3. 行为触发状态变更

这就是一个**数据单向流动**的模式。

### 2. 若两个组件之间有关联
如何处理两个组件之间有关联的case呢？Vue提供的组件通信方式：

1. 父组件通过props向子组件传递state;
2. 子组件通过event触发父组件更新state;

这个模式本质上还是遵循上图中数据单向流动的模式。只是将范围扩大到了两个组件之间，这两个组件共享一个状态。

``` js

const Parent = Vue.component("com-parent", {
    template: `<div><p>current level {{leve}} </p><com-child :level="level" @addlevel="addLevel"></com-child></div>`,
    data(){
        return {
            level: 1
        }
    },
    methods: {
        addLevel(){
            this.level++;
        }
    }
})
const Child = Vue.component("com-child", {
    template: `<div><p>current level {{leve}} </p><p>Alway less 1 </p><button @addOne>addOne</button></div>`,
    props: ['level'], 
    methods: {
        addOne(){
            this.$emit('addlevel');
        }
    }
})
```

### 3. 如果组件嵌套层级变深

如果嵌套层级数增加，则会产生如下case:

1. 某个组件共享其祖先组件的状态；
2. 两个有共同祖先的组件之间，共享同一个状态；

在第一种情况下，若组件借助于props/event的方式进行通信，则在两个组件之间的组件，仅仅只是做一些透传工作，跟组件自身的业务没有关系。
在第二种情况下，两个组件之间通信，都要绕道祖先组件进行通信；

当应用程序稍微复杂一些，便会使程序的可维护性变得微乎其微。


### 4. 一个补丁方案：事件总线
为解决以上问题， Vue提供了一种基于事件总线模式的方案 **$emit/$on**。

``` js
const Event = new Vue()
Event.$on('eventName', handler);
Event.$emit('eventName', data);
```
这种方案本质上是借助一个第三方组件， 把所有的通信帮到该组件上然后进行业务处理，免去了在组件间进行不必要的状态传递。
但是把业务逻辑一个单独的第三方组件上，这种方式合适吗？
如果通信业务复杂，那么这个第三方组件也难免要变得臃肿和杂乱。而且打乱了Vue的基本模式——**数据单向流动**。

### 5. 一个比较普适的方案

为了应对复杂的状态共享场景，Vuex出现。与Vue结合后的模式：

![vue-vuex-flow](https://vuex.vuejs.org/vuex.png)

在这种模式下，对Vue的单向数据流动可以概括为：

1. vuex state驱动视图更新
2. 视图提供action
3. action调用mutation
4. mutation更改state

vuex限制了非mutation渠道对state的更改，同时带了一个附加收益，mutation的存在为debug提供了可能。

#### 为什么使用了vuex，可以在vue组件中直接访问`this.$store.state`?
vuex借助vue的生命周期钩子`beforeCreate`，在每个vue组件实例化时，都添加了`$store`属性，它的值就是vuex实例自己。

#### vuex如何解决上面的问题
添加mutation，所有的数据变更都必需通过mutation。这样就把数据变更都收缩到一个口子上，便于数据的管控。


### 6. 简单场景下的跨级通信也要引入vuex吗

对于跨级通信的场景，如果只是简单的状态传递，就引入vuex，似乎有些杀鸡焉用牛刀的感jiao。其实vue从v2.4开始，提供了`$attrs/$listeners`两个新的属性，用于处理这种简单场景下的跨级通信。

### 7. 另外一种方案 provide/inject

除了`$attrs/$listeners`， Vue还提供了 `provide/inject` 做数据通信。



### 这就完了吗

上面说了这些，到底选择哪种数据通信方式，具体还要看实际业务场景。不管怎样，都是要考虑性价比的。
