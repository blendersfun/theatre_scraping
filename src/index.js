
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
    console.log(_.chain(Extractor.extract(entryPoint, $))
        .map(event => event)
        .filter(event => event)//.dates.indexOf('Second') === 0)
        .take(1000)
        .value()
    )
}).catch(e => {
    console.log('Uncaught Error: \n---\n', e)
})

/*
 Data indended for ingestion so far:
  - title
  - venue
  - dates
  - price
  - ticketsUrl
  - detailPageUrl
  - the current url

 Date intended for exclusion so far:
  - neighborhood
  - category
  - isPicked
 */
