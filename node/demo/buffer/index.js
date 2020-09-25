const b = Buffer.from('hello word')

const b2 = Buffer.alloc(8)
const w = b2.write('aa', 1)

const b3 = b2.slice(1, 4)

b2.write('a', 3)
console.log(b3)

const fs = require('fs')

// fs.readFile('a', (err, data) => {
//   console.log(11, data.toString())
//   fs.writeFile('b', data, () => {})
// })
copy()

function copy() {
  const BUFFER_LEN = 4
  const buf = Buffer.alloc(BUFFER_LEN)
  let pos = 0

  fs.open('./a', 'r', 0o666, (err, rfd) => {
    fs.open('./b', 'w', 0o666, (err, wfd) => {

      const next = () => {
        fs.read(rfd, buf, 0, BUFFER_LEN, pos, (err, bytesRead) => {
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