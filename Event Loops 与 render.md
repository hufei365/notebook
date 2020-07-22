# Event Loops 与渲染

在浏览器中，存在一个Event Loops用于协调`用户输入`，`网络请求`，`脚本执行`等任务。

通常情况下，这些任务分为 **宏任务** 和 **微任务**。浏览器先从宏任务队列中选中一个任务执行；执行完之后，再检查微任务队列。如果微任务队列不为空，则逐个执行，直到清空微任务队列。然后再执行下一个宏任务。

OK？ 那么就有问题了，浏览器的渲染发生在哪一步？或者说如果js操作了DOM或者改变了窗口大小或者滚动了页面，那么渲染是在什么时候？在上面的宏任务/微任务处理流程中，并没有提到跟渲染有关的case，那么是在什么时候进行渲染的？

实际在执行完微任务后，Event Loops还会检查是否需要进行渲染。不过这一步并不是在每次微任务执行完之后都一定会执行。原因有如下：
1. 屏幕刷新率一般是`60fps`，大概是没16.7ms进行一次刷新；Event Loops执行完一轮的时间实际上一般远比16.7ms小，所以Event Loops一般会在屏幕要刷新时，进行**渲染处理**；
2. 屏幕大小和内容没有变动，实际也不需要执行渲染；

我们用一些例子进行验证。

1. ### MutationObserver

``` js
const p = document.querySelector('p')

window.setInterval( ()=>{
    p.innerText = Date.now()
}, 0)
const config = { subtree: true }

const observer = new MutationObserver(()=>{
    console.log( Date.now() )
})

observer.observe( p, config )

```

2. ## 任务队列实际是集合，而非数据结构中的队列
Event Loops中，任务队列实际上是个任务集合，并不是传统意义上满足 FIFO 的队列结构。因为**任务有优先级属性，优先级高的会被先取出来执行**。

3. ## task queue
宏任务队列可能不只有一个，实际上一般会要求 把不同的任务定义出不同的优先级，Event Loop以此判断那个优先级高，先去执行那个队列的任务。
```js
// 这里的主体是浏览器，而非JS引擎
{
    events: [], // UI events from native GUI framework
    parser: [], // HTML/CSS parser
    callbacks: [], // setTimeout, requestIdleTask
    resources: [], // image loading
    domManipulation:[] // DOM mainpulation
}
```

