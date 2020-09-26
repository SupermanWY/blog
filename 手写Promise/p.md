## 前言
都 2020 年了，Promise 大家肯定都在用了，但是估计很多人对其原理还是一知半解，今天就让我们一起实现一个符合 PromiseA+ 规范的 Promise。

## 简单版
我们都知道 Promise 的调用方式，**new Promise(executor)**， executor 两个参数，resolve，reject。所以现在我们的代码长这样
```javaScript
class Promise {
    constructor(executor) {
       const resolve = () => {}
       const reject = () => {}
       executor(resolve, rejcet)
    }
}
Promise 内部有三个状态，pending、fulfilled、rejected，初始是 pending，调用 resolve 后变为 fulfilled,，调用 reject 后变为 rejected。fulfilled 时会调用 then 注册的成功的回调，rejected 时会调用 then 注册的失败的回调。

// Promise 内部状态
const STATUS = { PENDING: 'PENDING', FUFILLED: 'FUFILLED', REJECTED: 'REJECTED' }

class Promise {
    constructor(executor) {
        this.status = STATUS.PENDING;
        this.value = undefined; // 成过的值
        this.reason = undefined; // 失败的值
        const resolve = (val) => {
            if (this.status == STATUS.PENDING) {
                this.status = STATUS.FUFILLED;
                this.value = val;
            }
        }
        const reject = (reason) => {
            if (this.status == STATUS.PENDING) {
                this.status = STATUS.REJECTED;
                this.reason = reason;
            }
        }
        try {
            executor(resolve, reject);
        } catch (e) {
            // 出错走失败逻辑
            reject(e)
        }
    }
    then(onFulfilled, onRejected) {
        if (this.status == STATUS.FUFILLED) {
            onFulfilled(this.value);
        }
        if (this.status == STATUS.REJECTED) {
            onRejected(this.reason);
        }
    }
}
```
现在我们的 Promise 已经初步实现了，但还有很多问题

一个 promise 可以调用多次 then 方法，也就是说可以注册多个回调，所以我们需要一个队列来保存这些回调。同时我们没有对 pending 状态的 then 方法做处理，当 promise 为 pending 状态时，then 方法应该将回调放入到队列当中，而不是直接运行。所以改进之后的代码如下。

```javaScript
const STATUS = { PENDING: 'PENDING', FUFILLED: 'FUFILLED', REJECTED: 'REJECTED' }
class Promise {
    constructor(executor) {
        this.status = STATUS.PENDING;
        this.value = undefined; // 成过的值
        this.reason = undefined; // 失败的值
+       this.onResolvedCallbacks = []; // 存放成功的回调的 
+       this.onRejectedCallbacks = []; // 存放失败的回调的
        const resolve = (val) => {
            if (this.status == STATUS.PENDING) {
                this.status = STATUS.FUFILLED;
                this.value = val;
                // 成功时调用成功队列里的回调
+                this.onResolvedCallbacks.forEach(fn=>fn());
            }
        }
        const reject = (reason) => {
            if (this.status == STATUS.PENDING) {
                this.status = STATUS.REJECTED;
                this.reason = reason;
                // 失败时调用失败队列里的回调
+               this.onRejectedCallbacks.forEach(fn=>fn());
            }
        }
        try {
            executor(resolve, reject);
        } catch (e) {
            // 出错走失败逻辑
            reject(e)
        }
    }
    then(onFulfilled, onRejected) {
        if (this.status === STATUS.FUFILLED) {
            onFulfilled(this.value);
        }
        if (this.status === STATUS.REJECTED) {
            onRejected(this.reason);
        }
+       if (this.status === STATUS.PENDING) {
+           this.onResolvedCallbacks.push(()=>{ // todo..
+              onFulfilled(this.value);
+           })
+           this.onRejectedCallbacks.push(()=>{ // todo..
+               onRejected(this.reason);
+           })
+       }
+   }
}
```
到这一个简单 promise 80%的功能已经实现了，但是还有一个问题，promise 可以链式调用，也就是我们常看到的 promise.then().then()。所以我们得在 then 方法里去返回一个新的 promise。

```javaScript
const STATUS = { PENDING: 'PENDING', FUFILLED: 'FUFILLED', REJECTED: 'REJECTED' }
class Promise {
   // 上面逻辑省略
    ...
    then(onFulfilled, onRejected) { // swtich  作用域
+        let promise2 = new Promise((resolve, reject) => {
+            if (this.status === STATUS.FUFILLED) {
+                // to....
+                try {
+                    let x = onFulfilled(this.value);
+                    resolve(x);
+                } catch (e) {
+                    reject(e);
+                }
+            }
+            if (this.status === STATUS.REJECTED) {
+                try {
+                    let x = onRejected(this.reason);
+                    resolve(x);
+                } catch (e) {
+                    reject(e);
+                }
+            }
+            if (this.status === STATUS.PENDING) {
+                this.onResolvedCallbacks.push(() => { // todo..
+                    try {
+                        let x = onFulfilled(this.value);
+                        resolve(x);
+                    } catch (e) {
+                        reject(e);
+                    }
+                })
+                this.onRejectedCallbacks.push(() => { // todo..
+                    try {
+                        let x = onRejected(this.reason);
+                        resolve(x);
+                    } catch (e) {
+                        reject(e);
+                    }
+
+                })
+            }
+        })
+
+        return promise2;
+    }
}
```

我们注意到我们把回调的执行逻辑都放到了 promise2 的内部，之所以这样做，是因为我们需要用 onFufilled 的返回值去 resolve promise2，这也是为什么 then 回调的返回值会传给下一个 then 的原因。

## 完整版
上面的 promise 与规范有一些差距

then 注册的回调都是异步执行的

如果 then 注册回调的返回值是个函数或对象，这里处理起来会复杂一点，我们先看看规范是怎么定义的

>promise2 = promise1.then(onFulfilled, onRejected);

>x = onFulfilled 或 onRejected 的返回值

* 2.3.1 如果promise和x引用同一个对象，则用TypeError作为原因拒绝（reject）promise。
* 2.3.2 如果x是一个promise,采用promise的状态
* 2.3.2.1 如果x是请求状态(pending),promise必须保持pending直到xfulfilled或rejected
* 2.3.2.2 如果x是完成态(fulfilled)，用相同的值完成fulfillpromise
* 2.3.2.2 如果x是拒绝态(rejected)，用相同的原因rejectpromise 
* 2.3.3另外，如果x是个对象或者方法
* 2.3.3.1 让x作为x.then. 
* 2.3.3.2 如果取回的x.then属性的结果为一个异常e,用e作为原因reject promise
* 2.3.3.3 如果then是一个方法，把x当作this来调用它，第一个参数为resolvePromise，第二个参数为rejectPromise,其中:
* 2.3.3.3.1  如果/当 resolvePromise 被一个值 y 调用，运行 [[Resolve]](promise, y)
* 2.3.3.3.2  如果/当  rejectPromise 被一个原因 r 调用，用 r 拒绝（reject）promise
* 2.3.3.3.3  如果 resolvePromise 和 rejectPromise 都被调用，或者对同一个参数进行多次调用，第一次调用执行，任何进一步的调用都被忽略
* 2.3.3.3.4  如果调用 then 抛出一个异常 e 
* 2.3.3.3.4.1 如果 resolvePromise 或  rejectPromise 已被调用，忽略。
* 2.3.3.3.4.2 或者， 用 e 作为reason拒绝（reject）promise

规范可能有点复杂，需要自己慢慢消化，这里我直接把代码贴出来，我会在代码里标注每个规范的实现点。

```javaScript
const STATUS = { PENDING: 'PENDING', FUFILLED: 'FUFILLED', REJECTED: 'REJECTED' }

// 我们的promise 按照规范来写 就可以和别人的promise公用
function resolvePromise(x, promise2, resolve, reject) {
    // 规范 2.3.1
    if (promise2 == x) { // 防止自己等待自己完成
        return reject(new TypeError('出错了'))
    }
    // 规范 2.3.3
    if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
        // x可以是一个对象 或者是函数
        let called;
        try {
            // 规范 2.3.3.1
            let then = x.then;
            if (typeof then == 'function') {
                // 2.3.3.3
                then.call(x, function(y) {
                    // 规范 2.3.3.3.3
                    if (called) return
                    called = true;
                    // 规范 2.3.3.3.1
                    resolvePromise(y, promise2, resolve, reject);
                }, function(r) {
                    // 规范 2.3.3.3.3
                    if (called) return
                    called = true;
                    // 规范 2.3.3.3.2
                    reject(r);
                })
            } else {
                resolve(x); // 此时x 就是一个普通对象
            }
        } catch (e) {
            // 规范 2.3.3.3.4.1
            if (called) return
            called = true;
            // 规范 2.3.3.3.4 
            reject(e); // 取then时抛出错误了
        }
    } else {
        resolve(x); // x是一个原始数据类型 不能是promise
    }
    // 不是proimise 直接就调用resolve
}
class Promise {
    constructor(executor) {
        this.status = STATUS.PENDING;
        this.value = undefined;
        this.reason = undefined;
        this.onResolvedCallbacks = []; // 存放成功的回调的 
        this.onRejectedCallbacks = []; // 存放失败的回调的
        const resolve = (val) => {
            if(val instanceof Promise){ // 是promise 就继续递归解析
                return val.then(resolve,reject)
            }

            if (this.status == STATUS.PENDING) {
                this.status = STATUS.FUFILLED;
                this.value = val;
                // 发布
                this.onResolvedCallbacks.forEach(fn => fn());
            }
        }
        const reject = (reason) => {
            if (this.status == STATUS.PENDING) {
                this.status = STATUS.REJECTED;
                this.reason = reason;
                // 腹部
                this.onRejectedCallbacks.forEach(fn => fn());
            }
        }
        try {
            executor(resolve, reject);
        } catch (e) {
            // 出错走失败逻辑
            reject(e)
        }
    }
    then(onFulfilled, onRejected) { // swtich  作用域
        // 可选参数
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : x => x
        onRejected = typeof onRejected === 'function'? onRejected: err=> {throw err}
        let promise2 = new Promise((resolve, reject) => {
            if (this.status === STATUS.FUFILLED) {
                // to....
                setTimeout(() => {
                    try {
                        let x = onFulfilled(this.value);
                        resolvePromise(x, promise2, resolve, reject)
                    } catch (e) {
                        reject(e);
                    }
                }, 0);
            }
            if (this.status === STATUS.REJECTED) {
                setTimeout(() => {
                    try {
                        let x = onRejected(this.reason);
                        resolvePromise(x, promise2, resolve, reject)
                    } catch (e) {
                        reject(e);
                    }
                }, 0);
            }
            if (this.status === STATUS.PENDING) {
                // 装饰模式 切片编程
                this.onResolvedCallbacks.push(() => { // todo..
                    setTimeout(() => {
                        try {
                            let x = onFulfilled(this.value);
                            resolvePromise(x, promise2, resolve, reject)
                        } catch (e) {
                            reject(e);
                        }
                    }, 0);
                })
                this.onRejectedCallbacks.push(() => { // todo..
                    setTimeout(() => {
                        try {
                            let x = onRejected(this.reason);
                            resolvePromise(x, promise2, resolve, reject)
                        } catch (e) {
                            reject(e);
                        }
                    }, 0);

                })
            }
        });
        return promise2;
    }
}
```

#### 测试工具
给大家推荐一个测试 promise 是否规范的工具 --- promises-aplus-tests，使用方法如下
全局安装 promises-aplus-tests，然后添加以下代码

```javaScript
Promise.deferred = function () {
    let dfd = {};
    dfd.promise = new Promise((resolve,reject)=>{
        dfd.resolve = resolve;
        dfd.reject = reject
    })
    return dfd;
}
module.exports = Promise
```

然后直接在在控制台运行 promises-aplus-tests <当前 promise 代码地址>

可以看到我们的 promise 是顺利通过测试的。
![image.png](https://upload-images.jianshu.io/upload_images/10480647-2d749e45e19b2f50.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


## 总结
希望这篇文章可以帮助大家更深入的理解 promise
码字不易，期望得到你的赞。