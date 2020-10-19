const fs = require('fs')
const path = require('path')
const http= require('http')

const server= http.createServer((req, res) => {
  if (req.url === '/') {
    res.setHeader('Content-Type', 'text/html;charset=utf-8')
    fs
      .createReadStream(path.resolve(__dirname, './index.html'))
      .pipe(res)
  }
  if (req.url === '/file') {
    const separator = `--${req.headers['content-type'].split('boundary=')[1]}`
    let data = Buffer.alloc(0)
    req.on('data', (chunk) => {
      data = Buffer.concat([data, chunk])
    })
    req.on('end', () => {
      parseFile(data, separator)
      res.end()
    })
  }
})

server.listen(3000, () => {
  console.log('server start up 3000')
})

function parseFile(data, separator) {
  const bufArr = split(data, separator).slice(1, -1)
  bufArr.forEach(item => {
    const [head, body] = split(item, '\r\n\r\n')
    const headArr = split(head, '\r\n').slice(1)
    const headerVal = parseHeader(headArr[0].toString())
    if (headerVal.filename) {
      console.log(body.toString()) 
      fs.writeFile(path.resolve(__dirname, `./public/${headerVal.filename}`), body.slice(0, -2), (err) => {
        if (err) {
          console.log(err)
        }
      })
    }
  })
}

function parseHeader(header) {
  const [name, value] = header.split(': ')
  const valueObj = {}
  value.split('; ').forEach(item => {
    const [key, val = ''] = item.split('=')
    valueObj[key] = val && JSON.parse(val)
  })

  return valueObj
}

function split(buffer, separator) {
  const res = []
  let offset = 0;
  let index = buffer.indexOf(separator, 0)
  while (index != -1) {
    res.push(buffer.slice(offset, index))
    offset = index + separator.length
    index = buffer.indexOf(separator, index + separator.length)
  }

  res.push(buffer.slice(offset))

  return res
}