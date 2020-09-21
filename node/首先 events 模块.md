# 手写 events 模块

## 前言

这是系统性学习 Nodejs 的第三篇，所有文章都会收录在我的专栏里面，欢迎大家关注。

## 使用

events 模块是 Node.js 的核心模块，而大多是核心模块都继承自 events 模块，例如：net.Server、fs.ReadStream 等待。所以 events 模块非常重要。

其实 events 就是我们常见的发布订阅模式，我们看一下它 Node 里面是如果用的。

这是一个简单的示例，myEmitter.on 为一个事件注册监听器，myEmitter.emit 触发事件，从而执行监听器。on 方法可以注册多个监听器，同一个事件的监听器都会放在一个数组里。

```javaScript
const EventEmitter = require('events');

const myEmitter = new EventEmitter();
myEmitter.on('event', () => {
  console.log('触发事件');
});
myEmitter.emit('event');
```

### 传递参数

```javaScript
const myEmitter = new MyEmitter();
myEmitter.on('event', function(a, b) {
  console.log(a, b);
  // 打印：
  // a b
});
myEmitter.emit('event', 'a', 'b');

```

调用 emit 方法时，可以传入任意数量的参数。

### off

移除监听器

```javaScript
const EventEmitter = require('events');

const myEmitter = new EventEmitter();

const fn = () => {
  console.log('触发事件');
}

myEmitter.on('event', fn);
myEmitter.off('event', fn);
myEmitter.emit('event');

// 不会再打印 '触发事件'
```

### once

添加单次监听器到名为 eventName 的事件。 当 eventName 事件下次触发时，监听器会先被移除，然后再调用。

```javaScript
const EventEmitter = require('events');

const myEmitter = new EventEmitter();

const fn = () => {
  console.log('触发事件');
}

myEmitter.once('event', fn);

myEmitter.emit('event');
myEmitter.emit('event');

// 虽然触发触发了两次 event，但只打印了一次 evnet。
```

## 手写 EventEmitter

用法了解完了，我们手写吧。来吧，展示。

### 初始化

首先 EventEmitter 是个 class, 所以代码如下。

```javaScript
class EventEmitter {
  constructor() {
  
  }
}
```

每个 events 可以通过 on 来监听事件，每个事件可以注册多个监听器，所以我们要有一个东西来存储这些事件。我们可以通过这样的数据结果来存储。

```javaScript
events: {
  'eventName1': [
    function listener1() {},
    function listener2() {}
  ]
  ...
}
```

所以我们需要在 constructor 内初始化 events 属性。

```javaScript
class EventEmitter {
  constructor() {
    this._events = {}
  }
}
```

### on

on 方法是给一个事件注册一个监听器，其实就是在 events 上增加属性，通过上面分析的 events 数据结构，我们很容易写出 on 的代码。

``` javaScript
on(eventName, listeners) {
    if (this._events[eventName]){
        this._events[eventName].push(listeners)
    } else {
        this._events[eventName] = [listeners]
    }
}
```

可以看到代码是相当的简单，如果当前事件已经注册过监听器，则直接 push；如果没有注册过，则创建一个新的数组，并把监听器放进去。

### emit

emit 方法其实也特别简单，其实就是通过事件名找到对应的监听器数组，然后遍历执行即可。

```javaScript
emit(eventName,...args) {
    if(this._events[eventName]){
        this._events[eventName].forEach(fn=>fn(...args))
    }
}
```

![](https://dss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=599325949,1404246223&fm=26&gp=0.jpg)

### off

off 方法就是根据事件名从 events 内找到对应的监听器，然后删除掉。

```javaScript
off(eventName,listener) {
    if(!this._events[eventName]) return
    this._events[eventName] = this._events[eventName].filter(fn=>(fn !== listener))
}
```

### once

只绑定一次。实现起来也超简单，就是在执行监听器的时候就把当前监听器移除掉。看到代码你就懂了。

```javaScript
once(eventName,listener) {
    const wrapListener = (...args) =>{
        listener(...args);  
        // 当绑定后将自己移除掉
        this.off(eventName,once);
    }
    this.on(eventName,wrapListener)
}
```javaScript

似不似超简单，但是这样就完了吗？我们看下这个例子

```javaScript
const EventEmitter = require('events');

const fn = () => {
  console.log('触发事件');
}

myEmitter.once('event', fn);
myEmitter.off('event', fn)
myEmitter.emit('event');
```

我们先 once 绑定一个事件，然后又通过 off 移除了事件，下面 emit 的时候，理论上不应再执行 fn 了，但实际上，fn 执行了。这是为什么呢？

因为 once 时注册的监听器是我们内部自己创建的监听器（wrapListener），而不是这里的 fn，所以移除 fn 肯定时不行的。所以我们要修改下我们的 once 代码。

```javaScript
once(eventName, listener) {
    const wrapListener = (...args) =>{
        listener(...args);  
        // 当绑定后将自己移除掉
        this.off(eventName,once);
    }
    
    wrapListener.origin = listener
    this.on(eventName, wrapListener)
}
```javaScript

这里我们原本的 listener 保存到 wrapListener.origin 上面。

然后在 off 时，我们判断如果 wrapListener.origin 等于要被移除的监听器，这时候我们也就此监听器移除掉。代码如下：

```javaScript
off(eventName,listener) {
    if(!this._events[eventName]) return
    this._events[eventName] = this._events[eventName].filter(fn=>(fn !== listener && fn.origin !== listener))
}
```


