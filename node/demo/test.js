// const myRequire = require('./require')

// const pkgJson = myRequire('../package.json')

// const a = myRequire('./a')
// console.log(a)

// const axios = require('axios')

// console.log(axios)

const EventEmitter = require('events')


const myEmitter = new EventEmitter();

const fn = () => {
  console.log('触发事件');
}
myEmitter.once('event', fn);
myEmitter.off('event', fn)
myEmitter.emit('event');