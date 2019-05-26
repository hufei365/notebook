Question： Vue.js中为什么没有通过Object.defineProperty方法跟踪arr[i]的变化?

``` js
let arr = [];
let x = 1;
Object.defineProperty(arr, '0', {
    get: function(){
        return x;
    },
    set: function(v){
        x = v;
    }
});
arr[0];
arr[0] = 2;
console.log(arr[0], v);
```

参考文章： [JavaScript engine fundamentals: Shapes and Inline Caches](https://mathiasbynens.be/notes/shapes-ics)