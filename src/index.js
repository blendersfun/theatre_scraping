
const {promisify} = require('util')
const writeFile = promisify(require('fs').writeFile)
const readFile = promisify(require('fs').readFile)
const path = require('path')

const request = promisify(require('request'))
const cheerio = require('cheerio')
const _ = require('lodash')

const {loader} = require('./loader')
const {Extractor} = require('./extractor')
const {Normalizer} = require('./normalizer')

const entryPoint = 'https://www.thestranger.com/events/performance'

loader.loadUrl(entryPoint).then($ => {
    let extracted = Extractor.extract(entryPoint, $)
    console.log(_.chain(extracted.events)
        .map(event => event.venue)
        .filter(event => event)
        .slice(0, 100)
        .value())
    return extracted
}).then(dataset => {
    console.log('---')
    let normalized = Normalizer.normalize(dataset)
    console.log(JSON.stringify(_.chain(normalized.productions)
        .map(productions => productions)
        .filter(productions => productions)
        .slice(0, 1000)
        .value(), null, 2))
    // console.log(normalized)
}).catch(e => {
    console.log('Uncaught Error: \n---\n', e)
})

/*
 Data indended for ingestion so far:
  x title
  x venue
  - dates
  - price
  x ticketsUrl
  x detailPageUrl
  x the current url

 Date intended for exclusion so far:
  - neighborhood
  - category
  - isPicked
 */
