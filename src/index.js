
const {promisify} = require('util')
const writeFile = promisify(require('fs').writeFile)
const readFile = promisify(require('fs').readFile)
const path = require('path')

const request = promisify(require('request'))
const cheerio = require('cheerio')
const _ = require('lodash')

const {loader} = require('./loader')
const {Extractor} = require('./extractor')

const entryPoint = 'https://www.thestranger.com/events/performance'

loader.loadUrl(entryPoint).then($ => {
    console.log(Extractor.extract(entryPoint, $))
}).catch(e => {
    console.log('Uncaught Error: \n---\n', e)
})
