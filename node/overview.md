## Node 是什么

```javaScript
console.log(this)
function a() {
console.log(this)
}
```
这两个的 this 指向相同吗？

## Node.js 中的全局变量

全局变量是指在全局不声明直接访问的变量，global 上的属性叫全局变量

Object.keys(process)

process.cwd === curretn working directory
process.cndir // 改变工作目录
process.env // 当前系统的环境变量

windows 设置环境变量 当前工作忙 SET a = b
mac export xxx = xxx
不区分环境设置环境变量，cross-env

process.argv // 运行代码时传入的参数

commander

## process.nextTick

事件循环

## 模块规范

commjs

node中模块划分

* 核心模块
* 文件模块即自定义模块
* 第三方模块

## 核心模块 - fs

```javaScript
const fs = require('fs')
```

## path

path.reolve
path.join
path.extname
path.relative
path.dirname
path.dirname

## vm

eval // 执行时查找上下文，破坏当前上下文
new Funtion // 不依赖外部作用域，但要包一层函数
vm.runInThisContext() // 让字符串直接执行，并且在沙箱环境中

## 代码调试

浏览器调试
node --inspect-brk
chrome://inspect/#devices

....

## module 实现

## 模块查找规范

## npm

包
npm init 初始化包信息
全局包 本地宝，代码中使用的都是本地宝，全局包只能在命令好中使用
nrm (node registry manager)

![](https://imgkr2.cn-bj.ufileos.com/20ea9280-9642-43e1-9a79-7d315c0e6bf1.png?UCloudPublicKey=TOKEN_8d8b72be-579a-4e83-bfd0-5f6ce1546f13&Signature=9yshgjOYoB5bB7mhLN49dt2APcw%253D&Expires=1600068567)

npm link

bin


![](https://imgkr2.cn-bj.ufileos.com/3d7f29fb-b41c-4442-a627-dea1d9b93d27.png?UCloudPublicKey=TOKEN_8d8b72be-579a-4e83-bfd0-5f6ce1546f13&Signature=cbmRBidxBc7pw1jywz9VLENQ8Oc%253D&Expires=1600068754)

安装模块（第三方模块）
1. 开发依赖 -D --save-dev
2. 项目依赖  -S --save
3. 同版本依赖 
4. 捆绑依赖 bundleDep
5. 可选依赖

package-lock.json

npm pack 打包

## 版本号

* 正式版
* alpht
* beta
* rc

major.minor.patch

大版本.小版本.补丁版本

^ 只限定大版本
~ 锁定大版本 小版本
>=
<=
1.1.1 - 2.1.1

npm version major
npm verdion minor
npm version patch  会自动打 tag

## scripts
```json
{
  "scripts": {
    "mime": "mime a.js"
  }
}
```
会默认将当前node_modules下的bin目录放到全局变量下

## npx

与 scripts 类似，如果模块不存在会自动安装，安装后模块会被销毁

如果命令与包不一样怎么办？？？

## 发包

.npmignore

## Events

## Buffer

## 前端的文件下载

```javaScript
const str = '<div>aa</div>'
const blob = new Blob([str], { type: 'text/html' })
const a = document.createELement('a')
a.setAttribute('download', 'index.html')
a.click()
```

## 读文件

```html
<input type="file" id="fileDom" />

<script>
  fileDom.addEventListener('chage' e => {
    const file = e.target.files[0];
    const fileReader = new FileReader();
  
    fileReader.onload = () => {
      const img = document.createElement('img')
      img.src = fileReader.result
      document.body.appendChild(img)
    }
    fileReader.readAdDataURL(file)
  })
</script>
```

## ArrayBuffer


![](https://imgkr2.cn-bj.ufileos.com/bfc743e7-794c-427c-b8ae-142239133e26.png?UCloudPublicKey=TOKEN_8d8b72be-579a-4e83-bfd0-5f6ce1546f13&Signature=5rXyE%252F%252F2dtskBX%252FbiW%252FYJhge04I%253D&Expires=1600594307)


![](https://imgkr2.cn-bj.ufileos.com/f2502022-6090-42ac-a8d7-0073d2eaed34.png?UCloudPublicKey=TOKEN_8d8b72be-579a-4e83-bfd0-5f6ce1546f13&Signature=0M9XY%252Fb%252FcR4VTo6NIbzeP0egAoc%253D&Expires=1600594564)

 
![](https://imgkr2.cn-bj.ufileos.com/f6580f49-7538-4ae1-bce9-3900aef49861.png?UCloudPublicKey=TOKEN_8d8b72be-579a-4e83-bfd0-5f6ce1546f13&Signature=otANxu%252FohdM5ILg%252BudIRgGIjguo%253D&Expires=1600595368)

## base64

3 * 8 => 4 * 6

![](https://imgkr2.cn-bj.ufileos.com/723af9c5-42ba-466d-b0c3-96b142ce8a36.png?UCloudPublicKey=TOKEN_8d8b72be-579a-4e83-bfd0-5f6ce1546f13&Signature=KmBkh0zK5hwIuLJV03PVPyEITcE%253D&Expires=1600595881)

## buffer

```javaScript
Buffer.alloc()
Buffer.from('aa')
Buffer.from([1, 2,3  ])

```

![](https://imgkr2.cn-bj.ufileos.com/f2e84816-cea4-49e2-8762-6f3785a4edd3.png?UCloudPublicKey=TOKEN_8d8b72be-579a-4e83-bfd0-5f6ce1546f13&Signature=KVvOBNTo0gLUi0%252B9OgoYYdSc0j4%253D&Expires=1600597175)


![](https://imgkr2.cn-bj.ufileos.com/bfaacf0a-4989-44c3-a709-c4531042b740.png?UCloudPublicKey=TOKEN_8d8b72be-579a-4e83-bfd0-5f6ce1546f13&Signature=J40U02mGnChI2Or55MzrkXmcbHc%253D&Expires=1600597268)

![](https://imgkr2.cn-bj.ufileos.com/b4fd231e-6c21-4de6-8ba5-94f510528b68.png?UCloudPublicKey=TOKEN_8d8b72be-579a-4e83-bfd0-5f6ce1546f13&Signature=BYwrL2lDWerB5gCnid%252BKX1%252Fgge0%253D&Expires=1600597524)

buf.slice()

buf.fill()

isBuffer()
## fs

![](https://imgkr2.cn-bj.ufileos.com/bdc8ab5e-2321-45ee-9229-b05efb02b674.png?UCloudPublicKey=TOKEN_8d8b72be-579a-4e83-bfd0-5f6ce1546f13&Signature=CT%252FFQDOoByw6FiLDxK9vVkxni8g%253D&Expires=1600600326)

## 可读流 -- 文件流

![](https://imgkr2.cn-bj.ufileos.com/c2ee269a-e4a4-4724-bab6-c53303a6e933.png?UCloudPublicKey=TOKEN_8d8b72be-579a-4e83-bfd0-5f6ce1546f13&Signature=tEnZKFOzJ2q9wQyn4%252B11uFopMPw%253D&Expires=1600601524)


## 可写流

![](https://imgkr2.cn-bj.ufileos.com/2826825e-906b-4ade-872a-f0eeaeb7130b.png?UCloudPublicKey=TOKEN_8d8b72be-579a-4e83-bfd0-5f6ce1546f13&Signature=%252FBMl6MXSjI6rRBvtqtoVtXm2ATo%253D&Expires=1600623619)

![](https://imgkr2.cn-bj.ufileos.com/1b9e621e-c55d-4ad2-b96c-45b921ed2a63.png?UCloudPublicKey=TOKEN_8d8b72be-579a-4e83-bfd0-5f6ce1546f13&Signature=i5zy0hwH0PEQkZLV2F1A%252FyjDp5I%253D&Expires=1600624012)

![](https://imgkr2.cn-bj.ufileos.com/345b4728-c65b-4944-9438-23ac260f7654.png?UCloudPublicKey=TOKEN_8d8b72be-579a-4e83-bfd0-5f6ce1546f13&Signature=ZFMj6VzfDIh80hfd6BFL4%252FPvQO4%253D&Expires=1600624661)

## 可写流实现

## 梳理

![](https://imgkr2.cn-bj.ufileos.com/a02d4650-70f1-4d4f-bf5a-e20b5a004054.png?UCloudPublicKey=TOKEN_8d8b72be-579a-4e83-bfd0-5f6ce1546f13&Signature=zViM9Et2UGIb4Ca36ym7pqQ9RPU%253D&Expires=1600653006)

## 双工流

## 转换流

## 文件操作

- mkdir
- rmdir
- unlink
- stat

![](https://imgkr2.cn-bj.ufileos.com/2fc3d52d-ecb9-49ce-9fab-29076bbed12e.png?UCloudPublicKey=TOKEN_8d8b72be-579a-4e83-bfd0-5f6ce1546f13&Signature=61vL2z6c6JZ1IA6QnuccOOo1zzI%253D&Expires=1600684632)

![](https://imgkr2.cn-bj.ufileos.com/4e4692a8-e60c-4e82-a2f7-d0e4df377fca.png?UCloudPublicKey=TOKEN_8d8b72be-579a-4e83-bfd0-5f6ce1546f13&Signature=AoF18pfCZJqbN9O7opZSbe6LBRo%253D&Expires=1600684971)


