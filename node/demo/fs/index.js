const fs = require('fs')

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

// readFile('../a.js', (err, data) => {console.log(111, data)})
// fs.readFile('../a.js', {encoding: 'utf-8'},function(err, file){console.log(123123, file)})

const writeFile = (file, data, options, cb) => {
  cb = maybeCallback(cb || options)
  options = getOptions(options, {
    encoding: 'utf8',
    mode: 0o666,
    flag: 'w'
  })

  // 打开文件
  fs.open(file, options.flag, fs.mode, (err, fd) => {
    if (err) {
      fs.mkdir(file, err => {
        if (err) {
          return cb(err)
        }

        fs.open(file, options.flag, fs.mode, (err, fd) => {
          if (err) {
            return cb(err)
          }
          _writeFile(fd, data, cb)
        })
      })
    }

    _writeFile(fd, data, cb)
  })
}

const _writeFile = (fd, data, cb) => {
  const buf = Buffer.from(data)
  const writtenLen = buf.length < 4 ? buf.length : 4
  let pos = 0

  const next = () => {
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
}



// writeFile('./w-test2.js', '221111f', (err) => {console.log(err)})
// fs.writeFile('./w-test3.js', Buffer.from('123'), (err) => {console.log(err)})

const appendFile = (path, data, options, cb) => {
  cb = maybeCallback(cb || options)
  options = getOptions(options, {
    encoding: 'utf8',
    mode: 0o666,
    flag: 'a'
  })

  writeFile(path, data, options, cb)
}

// appendFile('./w-test2.js', '1', (err) => {console.log(err)})
// fs.appendFile('./w-test2.js', '1', (err) => {console.log(err)})

const copyFile = (target, source, cb) => {
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

// copyFile('./w-test.js', './w-test1.js', (err) => consoler.error(err))

const a = fs.openSync('./w-test.js', 'w', 0o666)

console.log(111, a)
fs.open('./w-test.js', 0o666, (err, fd) => {
  console.log(err)
  console.log(fd)
})
