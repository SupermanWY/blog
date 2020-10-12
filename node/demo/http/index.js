const http = require('http')
const url = require('url')

const server = http.createServer((req, res) => {
  console.log(req.method)
  console.log(req.url)
  console.log(req.headers)

  console.log(url.parse(req.url))
  // req 是一个可读流
  req.on('data', chunk => {
    console.log(chunk)
  })
  req.on('end', () => {})

  // 响应行->响应头->响应体顺序不能变

  res.statusCode = 200
  res.statusMessage = 'success'
  res.setHeader('name', 'superYue')
  res.write('ok') // 分段相应 Transfer-encoding:chunkeds
  res.end('1')
})

let port = 3000
server.listen(port, () => {
  console.log(`server start ${port}`)
})

server.on('error', err => {
  if (err.errno === 'EADDRINUSE') {
    server.listen(++port)
  }
})
