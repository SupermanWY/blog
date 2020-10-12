const http = require('http')
const url = require('url')
const path = require('path')
const fs = require('fs').promises
const { createReadStream } = require('fs')
const mime = require('mime')

class StaticServer {
  async handleRequest(req, res) {
    const { pathname } = url.parse(req.url, true)
    let filePath = path.join(__dirname, pathname)
    console.log(filePath)
    let stat = await fs.stat(filePath)
    try {
      if (stat.isFile()) {
        res.setHeader('Content-Type', mime.getType(filePath) + ';charset=utf-8')

        // const data = await fs.readFile(filePath)
        // res.end(data)

        createReadStream(filePath).pipe(res)
      } else {
        filePath = path.join(filePath, 'index.html')
        console.log(filePath)
        await fs.access(filePath)
        res.setHeader('Content-Type', 'text/html;charset=utf-8')
        createReadStream(filePath).pipe(res)
      }
    } catch(e) {
      this.sendError(e, req, res)
    }
  }

  sendError(e, req, res) {
    res.statusCode = 404
    res.end('Not Found')
  }

  start(port, cb) {
    const server = http.createServer((req, res) => this.handleRequest(req, res))
    server.listen(port, cb)
  }
}

new StaticServer().start(3000, () => {
  console.log('server start 3000')
})