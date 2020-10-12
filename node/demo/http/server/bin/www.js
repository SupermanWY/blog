#! /usr/bin/env node

const program = require('commander')
const StaticServer = require('../src/static-server')
console.log(process.argv)
program.name('ss')

program
  .option('-p, --port <v>', 'set your server port', 3000)
  .option('-d, --directory <v>', 'set your server start directory', process.cwd())

program.on('--help', () => {
  console.log('\nExamples:')
  console.log('ss -p 3000 / ss --port 3000')
  console.log('ss -d C: / ss --directory C:')
})

program.parse(process.argv)

const config = {}
config.port = program.port ?? process.cwd()

new StaticServer(config).start()