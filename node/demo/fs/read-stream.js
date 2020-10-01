const { EventEmitter } = require('events')
const fs = require('fs')

class ReadStream extends EventEmitter {
  constructor(path, options = {}) {
    super()

    this.path = path
    this.flags = options.flags ?? 'r'
    this.encoding = options.encoding ?? 'utf8'
    this.autoClose = options.autoClose ?? true
    this.start = options.start ?? 0
    this.end = options.end ?? undefined
    this.highWaterMark = options.highWaterMark ?? 16 * 1024
    this.offset = this.start
    this.flowing = false

    this.open()

    this.on('newListener', (type) => {
      if (type === 'data') {
        this.flowing = true
        this.read()
      }
    })
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

  pause() {
    this.flowing =false
  }

  resume() {
    if (!this.flowing) {
      this.flowing = true
      this.read()
    }
  }

  read() {
    if (typeof this.fd !== 'number') {
      this.once('open', () => this.read())
      return
    }

    const buf = Buffer.alloc(this.highWaterMark)
    // const howMuchToRead = Math.min(this.end - this.start + 1, buf.length)
    fs.read(this.fd, buf, 0, buf.length, this.offset, (err, bytesRead) => {
      this.offset += bytesRead
      if (bytesRead) {
        this.emit('data', buf.slice(0, bytesRead))
        this.flowing && this.read()
      } else {
        this.emit('end')
        this.autoClose && fs.close(this.fd, () => this.emit('close'))
      }
    })
  }
}

const rs = new ReadStream('./w-test.js', {
  flags: 'r',
  encoding: null,
  autoClose: false,
  start: 0,
  end: 2,
  highWaterMark: 2
})

rs.on('data', (chunk) => {
  console.log(chunk)
  rs.pause()
})

rs.on('close', () => {
  console.log('close')
})

setTimeout(() => {
  rs.resume()
}, 3000)
