# Promise 所有方法实现

## 前言

上次我们手写了一个promise，相信大家已经对 Promise 有了深度的理解，这次我们再把 Promise 的所有相关方法都实现一下。

## Promise.prototype.catch

```javaScript
Promise.prototype.catch = function(onRejected) {
  return this.then(null, onRejected)
}
```
catch 方法相对简单，就是调用 promise 自身的 then 方法，只传入失败的回调。因为 then 方法本身具有值的传递性，所以我们只需传入失败的回调即可，即使没有成功的回调，也会将值自动的传递下去。

## Promise.prototype.finally
无论成功还是失败都会执行 finally

```javaScript
Promise.prototype.finally = function(onFinished) {
  return this.then(val => {
    onFinished()
    return val
  }).catch((err) => {
    onFinished()
    return err
  })
}
```
finally 需要注意
1. finally 的回调没有参数
2. promise 如果成功，则将成功的值正常传递下去，不会因 finally 而断掉，举例：
3. promise 如果失败，同上
```javaScript
Promise
  .resolve(1)
  .finally(val => console.log(val)) // undefind
  .then(val => console.log(val)) // 1

Promise
  .reject('error')
  .finally(val => console.log(val)) // undefind
  .catch(err => console.log(err)) // error
```

## Promise.resolve

返回一个成功的 promise

```javaScript
Promise.resolve = function(val) {
  return new Promise(resolve => {
    resolve(val)
  })
}
```
emmm 一眼就懂

![](https://dss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=3053220104,2107184161&fm=26&gp=0.jpg)


## Promise.reject

返回一个失败的 promise

```javaScript
Promise.reject = function(val) {
  return new Promise((resolve, reject) => {
    reject(val)
  })
}
```
啥也不说了。。。

![](https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=3742683430,1588986635&fm=26&gp=0.jpg)

## Promise.all

返回一个 promise 实例。接受一个可迭代的对象，会等 iterable 参数内所有的 promise 都 resolved 时被 reslove，如果有一个 rejected，则此实例被 reject。

如果 iterable 没有 promise，则此实例直接被 resolve。

返回值是一个数组，数组的值按照 iterable 的迭代顺序排列。
```javaScript
Promise.all = function(ps) {
  let resolve
  let reject
  const promise = new Promise((r, j) => {
    resolve = r
    reject = j
  })

  let fufilledCount = 0
  let index = 0;
  const ret = [];
  const wrapFufilled = i => {
    return val => {
      fufilledCount += 1
      ret[i] = val
      if (fufilledCount >= index) {
        resolve(ret)
      }
    } 
  }
  const wrapRejected = i => {
    return err => {
      reject(err)
    }
  }

  for (let p of ps) {
    Promise.resolve(p).then(wrapFufilled(index), wrapRejected(index))
    index += 1
  }

  return promise
}
```
注意几个要点
1. 因为接受的是一个可迭代对象（iterable），所以我们用 for of 遍历。
2. 这里我们用 Promise.resolve() 包装一下所有的 promise。
3. wrapFufilled 的目的是为了记录当前遍历的 index。

## Promise.race

返回一个 promise，一旦迭代器中的某个promise解决或拒绝，返回的 promise就会解决或拒绝。

```javsScript
Promise.race = function(ps) {
  let resolve
  let reject
  const promise = new Promise((r, j) => {
    resolve = r
    reject = j
  })

  for (let p of ps) {
    Promise.resolve(p).then(
      val => resolve(val),
      err => reject(err)
    )
  }

  return promise
}
```

## Promise.any

只要其中的一个 promise 成功，就返回那个已经成功的 promise 。如果可迭代对象中没有一个 promise 成功（即所有的 promises 都失败/拒绝），就返回一个失败的 promise 和AggregateError类型的实例，它是 Error 的一个子类，用于把单一的错误集合在一起。

本质上，这个方法和Promise.all()是相反的

``` javaScript
Promise.any = function(ps) {
  let resolve
  let reject
  const promise = new Promise((r, j) => {
    resolve = r
    reject = j
  })

  let errCount = 0
  let pCount = 0
  for (let p of ps) {
    pCount += 1
    Promise.resolve(p).then(
      val => resolve(val),
      err => {
        errCount += 1
        if (errCount >= pCount) {
          reject(new AggregateError('All promises were rejected'))
        }
      }
    )
  }

  return promise
}
```

## Promise.allSettled

返回一个在所有给定的promise都已经fulfilled或rejected后的promise，并带有一个对象数组，每个对象表示对应的promise结果。

这里举一个例子：

```javaScript
const promise1 = Promise.resolve(3);
const promise2 = new Promise((resolve, reject) => setTimeout(reject, 100, 'foo'));
const promises = [promise1, promise2];

Promise.allSettled(promises).
  then((results) => results.forEach((result) => console.log(result)));
  
// 输出结果
// Object { status: "fulfilled", value: 3 }
// Object { status: "rejected", reason: "foo" }
```

具体实现：

```javaScript
Promise.allSettled = function(ps) {
  let resolve
  let reject
  const promise = new Promise((r, j) => {
    resolve = r
    reject = j
  })

  let finishedCount = 0
  let index = 0;
  const ret = [];
  const wrapFufilled = i => {
    return val => {
      finishedCount += 1
      ret[i] = {
        status: 'fufilled',
        value: val
      }
      if (finishedCount >= index) {
        resolve(ret)
      }
    } 
  }
  const wrapRejected = i => {
    return err => {
      finishedCount += 1
      ret[i] = {
        status: 'rejected',
        value: err
      }
      if (finishedCount >= index) {
        resolve(ret)
      }
    }
  }

  for (let p of ps) {
    Promise.resolve(p).then(wrapFufilled(index), wrapRejected(index))
    index += 1
  }

  return promise
}
```