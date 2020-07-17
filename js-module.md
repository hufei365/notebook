# AMD 与 CMD


##　AMD

三个文件
1. main.js, 入口文件
2. mod1.js, 模块1
3. mod2.js, 模块2

内如如下：

``` javascript

// main.js
requirejs(["mod1", "mod2"], function(mod1, mod2) {
    // console.log(mod1);
    mod1.sayHi();

    // pause for 2 seconds
    let now = new Date();
    while( +(new Date) - now < 2000){ }

    mod2.sayHi();
});

// mod1.js
console.log(`mod1 have loaded at ${+new Date}!`)
define(function () {
    console.log(`mod1 have inited at ${new Date}!`);
    return {
        sayHi: function () {
            console.log(`Hi, I'm mod1. And The time is ${new Date}`);
        }
    };
});

// mod2.js
console.log(`mod2 have loaded at ${+new Date}!`)
define(function () {
    console.log(`mod2 have inited at ${new Date}!`)
    return {
        sayHi: function () {
            console.log(`Hi, I'm mod2. And The time is ${new Date}`);
        }
    };
});
```

程序输出结果：
``` 
mod1 have loaded at 1562119684448!
mod1 have inited at Wed Jul 03 2019 10:08:04 GMT+0800 (中国标准时间)!
mod2 have loaded at 1562119684450!
mod2 have inited at Wed Jul 03 2019 10:08:04 GMT+0800 (中国标准时间)!
Hi, I'm mod1. And The time is Wed Jul 03 2019 10:08:04 GMT+0800 (中国标准时间)
Hi, I'm mod2. And The time is Wed Jul 03 2019 10:08:06 GMT+0800 (中国标准时间)
```

由输出结果可以看出在CMD中：
1. 依赖的模块加载提前（js文件的加载）
2. 模块的定义在模块文件加载完成后便执行（inited 的输出时间）



## CMD

三个文件
1. main.js, 入口文件
2. mod1.js, 模块1
3. mod2.js, 模块2

内如如下：

``` javascript

// main.js
define(function(require,exports,module) {
    let mod2 = require('./mod2');

    // pause for 2 seconds
    let now = new Date();
    while( +(new Date) - now < 2000){ }

    let mod1 = require('./mod1');
});

// mod1.js
console.log(`mod1 have loaded at ${+new Date}!`)
define(function(){
    console.log(`mod1 have inited at ${new Date}!`)
});

// mod2.js
console.log(`mod2 have loaded at ${+new Date}!`)
define(function(){
    console.log(`mod2 have inited at ${new Date}!`)
});
```

程序输出结果：
``` 
mod2 have loaded at 1562119000274!
mod1 have loaded at 1562119000275!
mod2 have inited at Wed Jul 03 2019 09:56:40 GMT+0800 (中国标准时间)!
mod1 have inited at Wed Jul 03 2019 09:56:42 GMT+0800 (中国标准时间)!
```

由输出结果可以看出在CMD中：
1. 依赖的模块加载提前（js文件的加载）
2. 模块的定义延后执行（inited 的输出时间）




【参考资料】
玉伯在知乎的回答[AMD 和 CMD 的区别有哪些？](https://www.zhihu.com/question/20351507/answer/14859415)
