const http = require('http')
const url = require('url')
const fs = require('fs').promises
const path = require('path')
const { createReadStream, readFileSync } = require('fs')
const crypto = require('crypto')

const chalk = require('chalk')
const mime = require('mime')
const ejs = require('ejs')

class StaticServer {
  constructor(config) {
    this.port = config.port
    this.directory = config.directory
  }

  start() {
    const server = http.createServer(this.handleRequest.bind(this))
    server.listen(this.port, () => {
      console.log(`${chalk.yellow('Starting up super-server: ')}${this.directory}`)
      console.log(`http://localhost:${chalk.green(this.port)}`)
    })
  }

  async handleRequest(req, res) {
    const { pathname } = url.parse(req.url)
    const filePath = path.join(this.directory, pathname)
    console.log(filePath)

    try {
      const stat = await fs.stat(filePath)
      
      if (stat.isFile()) {
        this.sendFile(req, res, filePath, stat)
      } else {
        this.sendFolder(req, res, filePath, pathname)
      }
    } catch(e) {
      this.sendError(req, res, e)
    }
  }

  cache(req, res, filePath, stat) {
    res.setHeader('Expires', new Date(Date.now() + 10 * 1000).toGMTString())
    res.setHeader('Cache-Control', `max-age=${10}`)

    const ifModifiedSince = req.headers['if-modified-since']
    const ctime = stat.ctime.toGMTString()
    if (ifModifiedSince === ctime) {
      return true
    }

    const ifNoneMatch = req.headers['if-none-match']
    const etag = crypto.createHash('md5').update( readFileSync(filePath)).digest('base64')
    if (ifNoneMatch === etag) {
      return true
    }

    res.setHeader('Last-Modified', ctime)
    res.setHeader('Etag', etag)

    return false;
  }

  sendFile(req, res, filePath, stat) {
    if (this.cache(req, res, filePath, stat)) {
      res.statusCode = 304
      res.end()
      return;
    }

    res.setHeader('Content-Type', mime.getType(filePath))
    createReadStream(filePath).pipe(res)
  }

  async sendFolder(req, res, filePath, pathname) {
    let dirs = await fs.readdir(filePath)
    dirs = dirs.map(item => ({
      filename: item,
      href: path.join(pathname, item)
    }))
    console.log(dirs)
    const template = await fs.readFile(path.resolve(__dirname, './template.html'), 'utf-8')

    const html = await ejs.render(template, { dirs }, { async: true })

    res.setHeader('Content-Type', 'text/html;charset=utf-8')
    res.end(html)
  }

  sendError(req, res, e) {
    res.end(e.message)
  }
}

module.exports = StaticServer