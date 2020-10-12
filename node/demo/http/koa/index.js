const Koa = require('koa')

const app = new Koa()

// use 注册中间件
// ctx 上下文，
// 对原生的 req 和 res 进行封装，形成新的 requrest 和 response
app.use(ctx => {
  ctx.body = 'hello word'
})

app.listen(3010)