# 手写 fs 核心方法

## 背景

fs 是 Node 里用来进行文件操作的核心模块，这篇文章的目的是学习并手写一些常用的 api。

这次手写的方法是 ```writeFile```、```readFile```、```appendFile```、```copyFile```，开始手写之前，我们要先了解以下几个基础 Api：

- fs.open：打开一个文件
- fs.close：关闭一个文件
- fs.read：读取文件
- fs.write：写入文件

为什么要先了解这些 Api 呢，这就好比把大象放进冰箱需要几步？

1. 打开冰箱 （打开文件）
2. 把大象放进冰箱 （读取文件/写入文件）
3. 关闭冰箱 （关闭文件）


## fs.open

> fs.open(path[, flags[, mode]], callback)

打开一个文件。对文件进行操作之前都要先打开文件。

**参数解读：**

- path：文件路径
- flags：文件系统标志，**默认值：'r'**。意思是要对文件进行什么操作，常见的有以下几种：
- - r：打开文件用于读取
- - w：打开文件用于写入
- - a：打开文件用于追加
- mode：文件操作权限，默认值：0o666（可读写）。
- callback：回调函数。函数上携带的参数如下：
- - err：如果失败，则值为错误原因
- - fd（number）：文件描述符，读取、写入文件时都要用到这个值

## fs.close

> fs.close(fd, callback)

关闭一个文件。文件打开并操作完成后都要关闭文件，以释放内存。

**参数解读**

- fd：要关闭的文件描述符
- callback：文件关闭时的回调
- - err

## fs.read

> fs.read(fd, buffer, offset, length, position, callback)

读取文件。readFile 就是基于此方法实现的。

**参数解读**

- fd：要读取的文件描述符
- buffer：数据要被写入的 buffer（将读取到的文件内容写入到此 buffer 内）
- offset：buffer 中开始写入的偏移量（从 buffer 的第几个索引开始写入）
- length：读取的字节数（从文件中读取几个字节）
- postion：指定从文件中开始读取的位置（从文件的第几个字节开始读）
- callback：回调函数
- - err
- - bytesRead：实际读取的字节数

## fs.write

写入文件。writeFile 基于此方法实现。

> fs.write(fd, buffer[, offset[, length[, position]]], callback)

- fd：要被写入的文件描述符
- buffer：将指定 buffer 的内容写入到文件中去
- offset：指定 buffer 的写入位置（从 buffer 的第 offset 个索引读取内容写入到文件中去）
- length：指定要写入的字节数
- postion：文件的偏移量（从文件的第 position 个字节开始写入）

## 淦

划水完毕，进入正题。

### readFile 方法实现

我们先看以下原生方法的使用

```javaScript
fs.readFile('../a.js', function(err, file) {
  console.log(file) // 输出的是一个存储文件二进制的 buffer 对象
})

fs.readFile('../a.js', { encoding: 'utf8' }, function(err, file) {
  console.log(file) // 输出的是一个字符串
})
```
第一个参数是文件路径，第二个参数是读取完成后的回调，回调内可以获取文件内容。

然后开始实现这个方法。

按照把大象装进冰箱的步骤来实现：

#### 1. 打开冰箱

```javaScript
const readFile = (path, options, cb) => {

  // 尝试获取 cb，如果获取不到则抛出错误
  // 由于 options 是非必填参数，所以它有可能是回调函数
  cb = maybeCallback(cb || options)
  
  // 获取 options，如果未穿 options，则取默认参数
  options = getOptions(options, { flag: 'r' })

  // 打开文件，
  // 如果打开失败则直接调用 cb，传入失败原因
  fs.open(path, options.flag, 0o666, (err, fd) => {
    if (err) {
      cb(err)
      return
    }
  })
}

const maybeCallback = cb => {
  if (typeof cb === 'function') {
    return cb
  }

  throw new TypeError('Callback must be a function')
}

const getOptions = (options, defaultOptions = null) => {
  if (
    options === null ||
    options === undefined ||
    typeof options === 'function'
  ) {
    return defaultOptions
  }

  return Object.assign({}, defaultOptions, options)
}
```

#### 2. 把大象放入冰箱（读取文件）

```javaScript

// 申请一个 10 字节的 buffer
const readBuf = Buffer.alloc(10)

// 文件读取的位置
let pos = 0

// 读取 fs.open 打开的文件（fd）
// 将文件内容读取到 readBuf 内 （buffer）
// 从 readBuf 的第 0 个字节开始读入 （offset）
// 读取的长度为 readBuf.length （length）
// 从文件的第 pos 个字节开始读取 （postion）
fs.read(fd, readBuf, 0, readBuf.length, pos, (err, bytesRead) => {
  if (err) {
    cb(err)
    return
  }
  
  console.log(readBuf) // 文件里的内容已写入到 readBuf
  cb(readBuf)
})
```
现在我们已经将内容读取到 readBuf 内，并通过 cb 传给函数调用者，但是存在这一个严重的问题，那就是我们只读取了 10 字节的内容，显然文件的内容是非常有可能比 10 字节要多。

那有没有办法一次性将文件的内容全部读取出来呢？

I'm sorry~~~ 木有办法，因为我们并拿不到文件的长度，所以就老老实实一点一点的将内容读出来吧

所以我们改进代码如下：

```javaScript
// 申请一个 10 字节的 buffer
const readBuf = Buffer.alloc(10)
// 文件读取的位置
let pos = 0
// 返回值，读取到的文件内容
let retBuf = Buffer.alloc(0)

const next = () => {
  // 读取 fs.open 打开的文件（fd）
  // 将文件内容读取到 readBuf 内 （buffer）
  // 从 readBuf 的第 0 个字节开始读入 （offset）
  // 读取的长度为 readBuf.length （length）
  // 从文件的第 pos 个字节开始读取 （postion）
  fs.read(fd, readBuf, 0, readBuf.length, pos, (err, bytesRead) => {
    if (err) {
      cb(err)
      return
    }
    // bytesRead 为实际读取到的文件字节数
    // 当读取不到内容时（bytesRead = 0），则代表文件读取完毕
    if (!bytesRead) {
      cb(
        null,
        options.encoding ?
          retBuf.toString(options.encoding) :
          retBuf
      )
      return;
    }
    
    // 计算下次读取文件的位置
    pos += bytesRead
    // 将读取到的内容合并到 retBuf 内
    retBuf = Buffer.concat([retBuf, readBuf])
    // 递归调用
    next()
  })
}
next()
```

我们将读取文件的操作封装成一个方法，然后递归调用，直到读取不到内容为止。

#### 3. 关闭冰箱

这一步超简单

```javaScript
if (!bytesRead) {
  fs.close(fd, () => {})
  cb(
    null,
    options.encoding ?
      retBuf.toString(options.encoding) :
      retBuf
  )
  return;
}
```

#### 完整代码

```javaScript
const readFile = (path, options, cb) => {
  // 尝试获取 cb，如果获取不到则抛出错误
  // 由于 options 是非必填参数，所以它有可能是回调函数
  cb = maybeCallback(cb || options)

  // 获取 options，如果未穿 options，则取默认参数
  options = getOptions(options, { flag: 'r' })

  // 打开文件，
  // 如果打开失败则直接调用 cb，传入失败原因
  fs.open(path, options.flag, 0o666, (err, fd) => {
    if (err) {
      cb(err)
      return
    }

    // 申请一个 10 字节的 buffer
    const readBuf = Buffer.alloc(10)
    // 文件读取的位置
    let pos = 0
    // 返回值，读取到的文件内容
    let retBuf = Buffer.alloc(0)

    // 读取 fs.open 打开的文件（fd）
    // 将文件内容读取到 readBuf 内 （buffer）
    // 从 readBuf 的第 0 个字节开始读入 （offset）
    // 读取的长度为 readBuf.length （length）
    // 从文件的第 pos 个字节开始读取 （postion）
    const next = () => {
      fs.read(fd, readBuf, 0, readBuf.length, pos, (err, bytesRead) => {
        if (err) {
          cb(err)
          return
        }

        // bytesRead 为实际读取到的文件字节数
        // 当读取不到内容时（bytesRead = 0），则代表文件读取完毕
        if (!bytesRead) {
          fs.close(fd, () => {})
          cb(
            null,
            options.encoding ?
              retBuf.toString(options.encoding) :
              retBuf
          )
          return;
        }

        // 计算下次读取文件的位置
        pos += bytesRead
        // 将读取到的内容合并到 retBuf 内
        retBuf = Buffer.concat([retBuf, readBuf])
        // 递归调用
        next()
      })
    }
    next()
  })
}
```

### fs.writeFile 实现

原生方法的使用：

```javaScript
// 将字符串 1 以 utf8 编码的形式写入 w-test1.js 内
fs.writeFile('./w-test1.js', '1', { encoding: 'utf8' },(err) => {})

// 直接写入二进制数据，即将 buffer 写入到文件
fs.writeFile('./w-test1.js', Buffer.from('1'), (err) => {})
```

不多解释了，想象着大象就搞得定，这里直接把代码贴出来（代码里的注释还是很详细的）。

```javaScript
const writeFile = (path, data, options, cb) => {
  cb = maybeCallback(cb || options)
  options = getOptions(options, {
    encoding: 'utf8',
    mode: 0o666, // 可读写的文件权限
    flag: 'w'  // 以写文件的形式打开文件
  })

  // 打开文件
  fs.open(path, options.flag, fs.mode, (err, fd) => {
    // 判断下写入的类型是否为 buffer
    // 如果是字符串则转成 buffer
    const buf = Buffer.isBuffer(data) ?
      data :
      Buffer.from(data, options.encoding)
    
    // 这里我们假设一次只写入 4 个字节
    // 如果要写入的字节少于 4 个，则取最小值
    const writtenLen = buf.length < 4 ? buf.length : 4
    // 文件写入的位置
    let pos = 0

    const next = () => {
      // 将内容写入到 fs 打开的文件（fd）
      // 要被写入的 buffer 为 buf
      // 从 buffer 的第 pos 个文章开始写入
      // 写入的长度 为 writtenLen
      // 从文件的第 pos 个文章开始写入
      fs.write(fd, buf, pos, writtenLen, pos, (err, bytesWritten) => {
        if (err) {
          return cb(err)
        }

        if (!bytesWritten) {
          next()
        }
        pos += bytesWritten
      })
    }
    next()
  })
}
```

#### fs.appendFile

追加文件

与 writeFile 不同的是，writeFile 会覆盖之前的内容，而 appendFile 是追加内容。

###### 原生方法的使用方式如下：

```javaScript
fs.appendFile('./w-test2.js', '1', (err) => {console.log(err)})
```

实现原理很简单，改变 flags 的属性为追加状态即可

```javaScript
const appendFile = (path, data, options, cb) => {
  cb = maybeCallback(cb || options)
  options = getOptions(options, {
    encoding: 'utf8',
    mode: 0o666,
    flag: 'a'
  })

  writeFile(path, data, options, cb)
}
```

### 最后一个方法 copyFile

###### 原生方法的使用方式如下：
```javaScript
fs.copyFile('源文件.txt', '目标文件.txt', callback);
```

#### 代码先不解释了 xdm，已经快一点了，我得先睡了，先贴代码，有时间再补解释

```javaScript
const copyFile = (source, target, cb) => {
  cb = maybeCallback(cb)

  const BUFFER_LEN = 4
  const buf = Buffer.alloc(BUFFER_LEN)
  let pos = 0

  fs.open(target, 'r', 0o666, (err, rfd) => {
    if (err) {
      return cb(err)
    }
    fs.open(source, 'w', 0o666, (err, wfd) => {
      if (err) {
        return cb(err)
      }

      const next = () => {
        fs.read(rfd, buf, 0, BUFFER_LEN, pos, (err, bytesRead) => {
          if (err) {
            return cb(err)
          }

          fs.write(wfd, buf, 0, bytesRead, pos, () => {
            console.log('写入')
            pos += bytesRead
            if (!bytesRead) {
              return
            }
            next()
          })
        })
      }

      next()
    })

  })
}
```

## 最后

下一期会手写**文件流（ReadStream/WriteStream）**，敬请期待。

如果这篇文章对你有帮助，希望点赞鼓励一下笔者~~~