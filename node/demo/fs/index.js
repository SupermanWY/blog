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
  cb = maybeCallback(cb || options)
  options = getOptions(options, { flag: 'r' })

  fs.open(path, options.flag, 0o222, (err, fd) => {
    if (err) {
      cb(err)
      return
    }

    const readBuf = Buffer.alloc(10)
    let pos = 0
    let retBuf = Buffer.alloc(0)

    const next = () => {
      fs.read(fd, readBuf, 0, readBuf.length, pos, (err, bytesRead) => {
        if (err) {
          cb(err)
          return
        }
        if (!bytesRead) {
          cb(null, retBuf)
          return;
        }
        pos += bytesRead
        retBuf = Buffer.concat([retBuf, readBuf])
        next()
      })
    }
    next()
  })
}

// readFile('../a.js', (err, data) => {console.log(data.toString())})
// fs.readFile('../a.js', function(err){console.log(123123, err)})

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

// writeFile('./w-test2.js', '2211', (err) => {console.log(err)})
// fs.writeFile('./w-test1.js', '1', (err) => {console.log(err)})

const appendFile = (path, data, options, cb) => {
  cb = maybeCallback(cb || options)
  options = getOptions(options, {
    encoding: 'utf8',
    mode: 0o666,
    flag: 'a'
  })

  writeFile(path, data, options, cb)
}

appendFile('./w-test2.js', '1', (err) => {console.log(err)})
fs.appendFile('./w-test2.js', '1', (err) => {console.log(err)})