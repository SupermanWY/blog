const fs = require('fs')

const BUFFER_LEN = 64 * 1024
const DEFAULT_OPTS_OPEN = {
  encoding: null,
  flag: 'r'
}
const DEFAULT_OPTS_READ = {
  buffer: Buffer.alloc(16384),
  offset: 0,
  length: 16384,
  position: null
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

const readFile = (path, options, cb) => {
  cb = maybeCallback(cb || options)
  options = getOptions(options, { flag: 'r' })

  fs.open(path, options.flag, 0o222, (err, fd) => {
    if (err) {
      cb(err)
      return
    }

    const readBuf = Buffer.alloc(1)
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
readFile('../a.js', (err, data) => {console.log(data.toString())})
// fs.readFile('../a.js', function(err){console.log(123123, err)})
