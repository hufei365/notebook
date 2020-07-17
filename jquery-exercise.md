1. jQuery对象实例化后怎样返回伪数组；
设置length属性

2. nodeType = 1、3、4、9、11分别都是什么；
    1 : elementNode
    3 : textNode
    4 : cData
    9 : document
    11: fragment

3. nodeValue、textContent、innerText有什么区别；
   nodeValue是针对文本节点的元素
   textContent和innerText都可以获取元素（nodeType ==1,9,11）的文本内容

4. 举几个例子，event.special可以用作什么，用special实现一个多端事件统一的示例；
   1. 抹平浏览器对于不同事件处理的差异性
   2. 给浏览器事件添加默认行为
   3. 重新定义浏览器默认事件

5. 例出你能想到的巧妙功能设计，例如attr支持data-*；
    1. 省略new操作符
    2. access方法
    3. js eval操作符的重写
    4. $.Callback的设计，更加强大的回调管理（多个回调，值的保留，只执行一次）
    5. 动画借助requestAnimationFrame
6. 通过本次源码阅读，发现了哪些之前不清楚的用法或技巧；
   1. 无new操作符的实现，虽然知道借助prototype实现继承，但是没意识到还可以这么改变prototype的指向；
   2. 加深钩子的理解，在程序执行到特定的节点，主动调起挂在钩子上的逻辑；对比callback，callback 可以看做运行时指定的单个钩子；
   3. 函数式编程中，对无副作用和输出结果确定支持自动化测试的理解；
   4. 大量的三元操作符及逻辑操作符（`?, &&, ||`)的组合
   5. 函数执行上下文的设定，在函数定义的阶段最好明确函数执行的上下文，这样对于程序的执行更不容易有潜在问题；
   6. 元素对象可脱离当前文档而存在，且存在一些表征的值要区分是否在文档流中；
   7. 将HTML元素对象当成普通的js对象看待，只是多了一些特定属性和方法，这些属性和方法来自与浏览器的内部实现，就像将一些变量预先注入到运行环境当中
   8. 正则中 $&, $`, $'的含义
   9. swap方法的抽象， 
   10. documentElement及document.implementation