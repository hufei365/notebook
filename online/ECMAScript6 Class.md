### 定义类
**经典式定义**
类声明：可以使用带有class关键字的类名(ES6的class只是类声明的一个语法糖，它的绝大部分功能，ES5都可以实现)
```javascript
class Animal{
    constructor(){
        this.name = 'animal';
    }
}
```
**类表达式**
一个类表达式是定义一个类的另一种方式。类表达式可以是被命名的或匿名的。赋予一个命名类表达式的名称是类的主体的本地名称。
```javascript
let Animal = class {
    constructor(){
        this.name = 'animal';
    }
}
```
**Note**: *类声明和类表达式的主体都执行在严格模式下。比如，构造函数，静态方法，原型方法，getter和setter都在严格模式下执行。*

### 构造函数
`constructor`
constructor方法是一个特殊的方法，其用于创建和初始化使用class创建的一个对象。一个类只能拥有一个名为 “constructor”的特殊方法。如果类包含多个constructor的方法，则将抛出 一个SyntaxError 。

一个构造函数可以使用 super 关键字来调用一个父类的构造函数。更多内容可以参考后续部分[继承](#inherit)介绍的内容~~


### 静态方法
`static` 关键字用来定义一个类的一个静态方法。调用静态方法不需要实例化该类，也不能通过一个类实例调用静态方法。通过类本身可以调用静态方法。
静态方法通常用于为一个应用程序创建工具函数。

```javascript
class Animal{
    static sayHi(){
        console.log('This is animal sayHi');
    }
}

Animal.sayHi(); // This is animal sayHi

let animal = new Animal();
animal.sayHi(); // Uncaught TypeError: animal.sayHi is not a function
```

### 静态属性
目前ES6还不支持静态属性，但是可以通过Class.propName实现。
```javascript
class Animal{};

Animal.typeName = 'animal';

console.log(Animal.typeName);
```
目前，只有这种写法可行，因为 ES6 明确规定，Class 内部只有静态方法，没有静态属性。

但是，已经有了一些关于静态属性的提案。


<span id="inherit"></span>
### 继承
关键词`extends`
ES5 通过修改原型链实现继承
```javascript
class Father{
    say(){
        console.log("This function is defined in Class Father!");
    }
}

class Son extends Father{ }

let son = new Son();
son.say();  //This function is defined in Class Father!
```

显式地写子类的constructor方法时，则需要在使用“this”之前首先调用 `super()`，因为ES6的继承机制是先创造父类的实例对象this，然后在子类的构造函数中修改this。
如果子类没有定义constructor方法，ES6会默认添加一个constructor，类似于下面示例代码的中的`Child`类。
```javascript
class Father{ }

class Son extends Father{
    constructor(){ }
}
let son = new Son(); // Uncaught ReferenceError: Must call super constructor......

class Child extends Father{
    constructor(){
        super();
    }
}
let child = new Child();

child instanceof Child;  // true
child instanceof Father; // true **子类实例也是父类的实例**
```

子类中如何调用父类的静态方法
```javascript
class Father{
    static say(){
        return ('father\'s say()');
    }
}

class Son extends Father{
    static say(){
        console.log(Father.say() + ' son\'s say()');
    }
}

Son.say();// father's say() son's say()
```

### super关键词
- super可以当作函数使用，作为函数时，super()只能用在子类的构造函数之中
- super也可当做对象使用，在普通方法中，指向父类的原型对象；在静态方法中，指向父类。

### Mixin的概念
这是继承多个类的时候会涉及到的概念。