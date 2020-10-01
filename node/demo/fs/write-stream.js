const { EventEmitter } = require('events')
const fs = require('fs')

class WriteStream extends EventEmitter {
  constructor(path, options = {}) {
    super()

    this.path = path
    this.flags = options.flags ?? 'w'
    this.encoding = options.encoding ?? 'utf8'
    this.autoClose = options.autoClose ?? true
    this.highWaterMark = options.highWaterMark ?? 16 * 1024

    this.offset = 0
    this.cache = []
    this.writtenLen = 0
    this.writing = false
    this.needDrain = false

    this.open()
  }

  open() {
    fs.open(this.path, this.flags, (err, fd) => {
      if (err) {
        this.emit('error', err)
        return
      }

      this.fd = fd
      this.emit('open')
    })
  }

  clearBuffer() {
    const data = this.cache.shift()
    if (data) {
      const { chunk, cb } = data
      this._write(chunk, () => {
        cb()
        this.clearBuffer()
      })
      return
    }

    this.needDrain && this.emit('drain')
    this.writing = false
    this.needDrain = false
  }

  write(chunk, encoding, cb = () => {}) {
    chunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding)
    this.writtenLen += chunk.length
    const hasLimit = this.writtenLen >= this.highWaterMark
    this.needDrain = hasLimit

    if (!this.writing) {
      this.writing = true
      this._write(chunk, () => {
        cb()
        this.clearBuffer()
      })
    } else {
      this.cache.push({
        chunk: chunk,
        cb
      })
    }

    return !hasLimit
  }
  
  _write(chunk, cb) {
    if (typeof this.fd !== 'number') {
      this.once('open', () => this._write(chunk, cb))
      return
    }

    fs.write(this.fd, chunk, 0, chunk.length, this.offset, (err, bytesWritten) => {
      if (err) {
        this.emit('error', err)
        return
      }

      this.offset += bytesWritten
      this.writtenLen -= bytesWritten
      cb()
    })
  }
}


const ws = new WriteStream('./w-test.js', {
  flags: 'w',
  encoding: 'utf8',
  autoClose: true,
  highWaterMark: 2
})

ws.on('drain', () => console.log('drain'))

console.log(ws.write('2'))
console.log(ws.write('2'))
console.log(ws.write('2'))
console.log(ws.write('2'))
console.log(ws.write('12'))