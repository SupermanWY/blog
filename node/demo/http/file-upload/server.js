const fs = require('fs')
const path = require('path')

const Koa = require('koa')

const app = new Koa()

app.use(ctx => {
  if (ctx.url === '/') {
    ctx.set('Content-Type', 'text/html;charset=utf-8')
    ctx.body = fs.createReadStream(path.resolve(__dirname, './index.html'))
  }
  if (ctx.url === '/file') {
    console.log(123)
    ctx.req.on('data', (chunk) => {
      console.log('data:', chunk.toString())
    })
    ctx.req.on('end', (chunk) => {
      console.log('end')
    })
    ctx.body = 1;
  }
})

app.listen(3000, () => {
  console.log('server start up 3000')
})