## 面向对象程序设计

通过**类**可以创建多个具有相同属性和方法的对象。

JS中对象的定义： **无序属性的集合，其属性可以包含基本值、对象或者函数。**

### 创建对象的方式：
1. 创建一个Object实例并给它添加属性。
```javascript
var person = new Object();
person.name = 'hufei';
person.age = 20;

person.sayHi = function(){
    console.log('hi, I am ' + this.name );
}
console.log(person);
```

2. 对象字面量创建对象
还是创建上面的person对象
```javascript
var person = {
    name: 'hufei',
    age: 20, 
    sayHi: function(){
        console.log('hi, I am ' + this.name );        
    }
}
person.sayHi();
```

？？？问题来了，上面两种方式创建的对象有什么特点？或者说有什么优缺点？

### 对象的属性类型
属性有两种类型： **数据属性** 和 **访问器属性** 。
#### 数据属性
数据属性有4个描述其行为的特性。
[[Configurable]]: 表示能否重新定义属性；默认true
[[Enumerable]]: 能否通过for-in循环返回该属性；默认true
[[Writable]]: 能否修改属性的值，像上面那个例子使用的那样；默认true
[[Value]]: 包含这个属性的数据，读取属性的时候从这个位置获取；修改属性指的时候，也是将新值保存在这个位置。默认为undefined

要修改属性的默认属性，可以使用Object.defineProperty();
这个方法接受三个参数：
要定义的对象；
要修改的属性；
属性描述符对象；
```javascript
var person = {
    name : 'hufei'
}
console.log(person.name); // hufei

Object.defineProperty(person, 'name', {value: 'new hufei'});
console.log(person.name); // new hufei

// writable的使用
Object.defineProperty(person, 'name', {value: 'can not modified', writable: false })
console.log(person.name);// can not modified

person.name = 'set a new name';
console.log(person.name);  // can not modified

// enumerable的使用
Object.defineProperty(person, 'newName', {value: 'new Name', enumerable: true, configurable: true});
for(key in person){
    console.log(key + ' : ' + person[key]); 
}
Object.defineProperty(person, 'name', {enumerable: false});
console.log('下面的输出不会包含name的值')
for(key in person){
    console.log(key + ' : ' + person[key]);
}

// configurable的使用
Object.defineProperty(person, 'name', {configurable: false});
console.log(person); // {newName: "new Name", name: "hufei"}
delete person.name;
delete person.newName;
console.log(person); // {name: "hufei"}
Object.defineProperty(person, 'name', {configurable: true});
delete person.name;
console.log(person); // {name: "hufei"}   因为person的name属性已经是configurable：false的了，故而不可以再修改configurable的值了。
```
【拓展一下】
Object.getOwnPropertyDescriptor() 方法可以获取某个属性的描述符。
```javascript
// 获取上例中person.name的属性描述符
console.log(Object.getOwnPropertyDescriptor(person, 'name'));
// {value: "hufei", writable: true, enumerable: false, configurable: false}
```
> 关于Object.defineProperty，IE8 是第一个实现该法的特性，但是又存在诸多限制，故而IE8对其支持并不是很完美。这也是Vue.js不支持IE8的原因。

#### 访问器属性
访问器属性的使用跟数据属性类似，跟数据属性同级关系。
```javascript
var person = {
    _name: 'hufei'
};

Object.defineProperty(person, 'name', {
    configurable: true,
    enumerable: true,
    get: function(){
        return this._name;
    }, 
    set: function(val){
        this._name = val;
    }
});

console.log(person.name); // hufei
person._name = 'new hufei';
console.log(person.name); // new hufei
person.name = 'new new hufei';
console.log(person.name); // new new hufei
console.log(person._name); // new new hufei
```
？？？问题来了，访问器属性中的getter和setter方法是闭包吗？

-----

上面留的问题，使用Object或者对象字面量创建对象的优缺点是啥？
有个比较明显的不足就是，当要创建大量类似的对象时，会产生大量重复的代码。
譬如：
```javascript
var a = new Object();
a.a = 'a';
var b = new Object();
b.a = 'a';
// 还会有更多当重复代码
```
在这种情况下，工厂模式就要登场了。

-----

### 工厂模式
工厂模式，顾名思义，批量化生产当代名词。
```javascript
function factory(name, age){
    var o = new Object();
    o.name = name;
    o.age = age;

    o.sayHi = function(){
        console.log('hi, I am ' + this.name);
    }

    return o;
}

var person1 = factory('person1', 20);
var person2 = factory('person2', 22);

console.log(person1); // {name: "person1", age: 20, sayHi: ƒ}
person2.sayHi(); // hi, I am person2
```
工厂模式解决了代码重复的问题，但是还存在对象识别的问题。怎样知道这个对象的类型。虽然person1 和 person2 都是通过factory函数创建出来的，但是创建完成后，person1和person2 跟原来的factory之间并没有什么联系。 单看person1 和 person2 并不能知道它们是通过factory方法创建的，也不知道person1 和 person2是通过同一方法创建的。

so， 我们接下来就要引出构造函数模式了。

### 构造函数
```javascript
function Person(name, age){
    this.name = name;
    this.age = age;
    this.sayHi = function(){
        console.log('hi, I am ' + this.name);
    }
}
var person1 = new Person('person1', 20);
var person2 = new Person('person2', 22);

// 注意 person1的输出跟工厂模式是有区别的，请留意。
console.log(person1);  // Person {name: "person1", age: 20, sayHi: ƒ} 
person2.sayHi(); // hi, I am person2
```

new 操作符的四个步骤：
1. 创建一个新对象；
2. 将构造函数的作用域赋给新对象（构造函数中的this会指向这个新对象）；
3. 执行构造函数的代码；
4. 返回新对象；

通过这种模式创建的对象，是有对象标识符的。 对象的constructor属性指向就是该对象的构造函数。
我们通常通过instanceof来检测对象的类型。

```javascript
person1 instanceof Person; // true
person2 instanceof Person; // true
person1 instanceof Object; // true
person2 instanceof Object; // true
```

PS: 构造函数跟普通函数没有任何本质的区别。不管是什么函数，只要通过new操作符调用，都可以看作是构造函数。

用构造函数的模式创建对象相比工厂模式，能够识别对象类型，但还有一个问题，就是每个新创建的对象的方法都是一个新的方法，虽然方法内部的代码一模一样。
简单地，我们可以把方法转移到构造函数外面解决这个问题。
```javascript
function Person(name, age){
    this.name = name;
    this.age = age;
    this.sayHi = sayHi;
}

function sayHi(){
        console.log('hi, I am ' + this.name);
    }
var person1 = new Person('person1', 20);
var person2 = new Person('person2', 22);

person1.sayHi(); // hi, I am person1
person2.sayHi(); // hi, I am person2
```
但是在一个对象内调用一个外层作用域的方法，总是显得那么别扭。

So， 我们又可以引出另外一种模式了————原型模式。

### 原型模式
每个函数对象都有个prototype属性，这个属性指向一个原型对象，这个原型对象的作用就是用于创建实例时的原型。换句话说，所有的实例都共享原型对象中的方法和实例。
```javascript
function People(){}

People.prototype.name = 'hufei';
People.prototype.age = 20;
People.prototype.sayHi = function(){
    console.log('hi, I am ' + this.name);
}

var person1 = new People();
var person2 = new People();

person1.sayHi(); // hi, I am hufei
person2.sayHi(); // hi, I am hufei

// 注意下面这种情况
person1.name = 'person1';
person2.sayHi();
person1.__proto__.name = 'person1';
person2.sayHi();
```
What？ __proto__是个什么鬼？
__proto__ 是一个实例中指向构造函数原型对象prototype的指针,也就是说:

person1.__proto__ === People.prototype;
person2.__proto__ === People.prototype;

### 一些跟对象原型相关的方法
- isPrototypeOf: 判断目标对象是否通过自己的原型对象生成
- getPropertyOf: 获取对象的 原型对象；
- hasOwnProperty: 判断对象自身是否具有某个属性
- in 操作符： 判断某个属性是否在对象自身 或者 原型对象链（具体含义参考下面示例代码中的注释）上。
- Object.keys(): 返回对象上 所有可枚举的属性（不包括原型对象上的属性）
- Object.getOwnPropertyNames(); 通Object.keys()类似，但是会返回原型对象上的constructor属性。
```javascript
// **isPrototypeOf**
People.prototype.isPrototypeOf(person1); // true
People.prototype.isPrototypeOf(person2); // true

// getPrototypeOf
var proto = Object.getPrototypeOf(person1);
console.log(proto === People.prototype);

// hasOwnProperty
// 判断对象的一个属性是否自实例本身
person2.hasOwnProperty('name'); // false 不来自于实例自身
person2.name = 'person2'; 
person2.hasOwnProperty('name'); // true 来自于实例自身
// 这里有个前提就是，每当读取对象的某个属性时，都会执行一次搜索。首先从对象自身查找，如果未曾找到，则在该对象的原型对象（__proto__指向的对象）上寻找；如果其原型对象上也未曾找到，则继续去原型对象的原型对象上寻找。就这么一直找下去，如果找不到则返回undefined。
// 这个搜索的路径就自然而然地形成了一条链，也就是原型链。
// 这个搜索的过程就是沿着原型链搜索的。
// 那要是 对象本身和原型对象具有同名的属性，那么当然是以对象本身的属性为准啦，因为搜索程序的规则是在对象本身查到以后，就不会再去原型对象上的查找了。

// in 操作符
alert('name' in person2) // true
alert(person2.hasOwnProperty('name')); // true name位于对象本身
delete person2.name;
alert('name' in person2) // true
alert(person2.hasOwnProperty('name')); // false  name位于对象的原型对象上

person2.age = 33；
Object.keys(person2); // ['age']
Object.keys(People.prototype) // ['name', 'age', 'sayHi']
Object.getPrototypeNames(People.prototype); // ['constructor', 'name', 'age', 'sayHi']

```

### 原型对象具有的问题
问题根源就在于所有实例对象都共享原型对象上的内容。如果原型对象上的属性有引用类型的值，name就会出现问题了。看例子：
```javascript
function People(){}
People.prototype.skills = ['say', 'sing'];

var p1 = new People();
var p2 = new People();

console.log(p2.skills); // ['say', 'sing']
p1.skills.push('walk'); 
console.log(p1.skills); // ['say', 'sing', 'walk'];
console.log(p2.skills); // ['say', 'sing', 'walk'];
```
要解决这个问题，可以组合使用构造函数和原型对象

### 构造函数和原型对象组合使用
```javascript
function People(){
    this.skills = ['say', 'sing'];
}
People.prototype.Ican = function(){
    console.log(this.skills);
}
var p1 = new People();
var p2 = new People();

p2.Ican(); // ['say', 'sing']
p1.skills.push('walk');
p1.Ican();// ['say', 'sing', 'walk']
p2.Ican();// ['say', 'sing']
```

### 其它模式
- 寄生构造函数模式
- 动态原型模式
- 稳妥构造函数模式



### 继承
？？？许多OO语言都有两种继承模式：**接口继承** 和 **实现继承**

JS只能使用实现继承方式，借助原型链。

#### 原型链
```javascript
function A(){
    this.skills = ['say'];
}
function B(){
    this.name = 'B';
}
```
#### 借用构造函数
#### 组合继承
#### 原型式继承
#### 寄生式继承
#### 寄生组合式继承

原型链的构建是通过将一个构造函数的实例赋给另一个构造函数的原型实现的。子类型就能访问父类型中的属性和方法。
原型链继承的问题在于所有的实例都共享原型链上的属性和方法，这会导致