const fs = require('fs')
const path = require('path')

module.exports = function require(filename) {
  filename = Module._resolveFilename(filename)

  const module = new Module(filename)
  module.load()

  return module.exports
}

function Module(filename) {
  this.filename = filename
  this.dirname = path.dirname(filename)
  this.exports = {}
}

Module.prototype.load = function() {
  const extension = path.extname(this.filename)
  Module._extensions[extension](this)
}

Module._extensions = {}

Module._extensions['.json'] = function(module) {
  const content = fs.readFileSync(module.filename, 'utf-8')
  module.exports = JSON.parse(content)
}

Module._extensions['.js'] = function(module) {
  const content = fs.readFileSync(module.filename, 'utf-8')
  // const wraped = Module._wrapper(content)
  const fn = new Function(
    'exports',
    'module',
    'require',
    '__filename',
    '__dirname',
    content
  )

  fn.call(module.exports, module.exports, module, require, module.filename, module.dirname)
}

Module._resolveFilename = function(filename) {
  let filepath = path.resolve(__dirname, filename)
  let isExists = fs.existsSync(filepath)

  if (isExists) {
    return filepath
  }

  const extensions = Object.keys(Module._extensions)
  for (let i = 0; i < extensions.length; i += 1) {
    let path = `${filepath}${extensions[i]}`
    isExists = fs.existsSync(path)
    if (isExists) {
      return path
    }
  }

  throw new Error('module not found')
}