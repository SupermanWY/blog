const http = require('http')

class Koa {
  use() {

  }
  listen() {
    const server = http.createServer(this.handleRequres.bind(this))
  }
}