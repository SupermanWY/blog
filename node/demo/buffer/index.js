const b = Buffer.from('hello word')

const b2 = Buffer.alloc(8)
const w = b2.write('aa', 1)

const b3 = b2.slice(1, 4)

b2.write('a', 3)
console.log(b3)