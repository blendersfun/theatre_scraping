// Purpose: load html documents from the cache and from the network and return
// as a cheerio object.

const {promisify} = require('util')
const writeFile = promisify(require('fs').writeFile)
const readFile = promisify(require('fs').readFile)
const mkdir = promisify(require('fs').mkdir)
const readdir = promisify(require('fs').readdir)
const path = require('path')
const moment = require('moment')

const request = promisify(require('request'))
const cheerio = require('cheerio')
const _ = require('lodash')

const CACHE_PATH = './cache'
const MAX_AGE = 1000 * 60 * 60 * 24 // One day in milliseconds

class Loader {
    constructor (cachePath, maxAge) {
        this.cachePath = cachePath
        this.maxAge = maxAge
    }
    loadUrl(url) {
        return Loader.getCachedCopy(this.cachePath, this.maxAge, url).catch(err => {
            if (err.code === 'ENOENT' || err.code === 'NOTCACHED') { // If it is not in the cache, read it from the server.
                return Loader.request({
                    url
                }).then(response => {
                    let timestamp = Loader.getCurrentUtcMoment().format()
                    let filePath = path.join(this.cachePath, Loader.sanitizeFilename(url + '.' + timestamp))
                    return Loader.ensureCacheExists(this.cachePath).then(() => Loader.writeFile( // And write it to the cache.
                        filePath,
                        response.body,
                        { encoding: 'utf-8' }
                    )).then(() => {
                        return {
                            body: response.body,
                            timestamp
                        }
                    })
                })
            } else {
                throw err
            }
        }).then(({body, timestamp}) => {
            return {
                url,
                $: cheerio.load(body, { normalizeWhitespace: true }),
                timestamp
            }
        })
    }
    static sanitizeFilename(str) {
        return str.replace(/[<>\:\"\/\\|\?\*]/g, '-')
    }
    static ensureCacheExists(cachePath) {
        return Loader.mkdir(
            cachePath
        ).catch(err => {
            if (err.code !== 'EEXIST') {
                throw err
            }
        })
    }
    // Resolves to null if a copy less old than maxAge cannot be found in the cache.
    static getCachedCopy(cachePath, maxAge, url) {
        let filenameUrl = Loader.sanitizeFilename(url)
        return Loader.readdir(
            cachePath
        ).then(entries => { // Get filename of most recent cached copy younger than maxAge.
            let cacheCandidates = _.chain( // Todo: Replace with flow(), see: https://medium.com/making-internets/why-using-chain-is-a-mistake-9bc1f80d51ba
                entries
            ).map(entry => { // Split url-based filename from timestamp.
                let filename = entry
                let i = entry.lastIndexOf('.')
                let url = entry.slice(0, i)
                let timestamp = entry.slice(i + 1)
                return { filename, url, timestamp }
            }).filter(entry => { // Only select cache items that match this url.
                return entry.url === filenameUrl
            }).map(entry => { // Get a moment.utc() datetime for each cache item.
                let { filename, url, timestamp } = entry
                let i
                for (let j = 0; j < 2; j++) { // Fix filename munging of colons in timestamp:
                    i = timestamp.lastIndexOf('-')
                    timestamp =  timestamp.slice(0, i) + ':' + timestamp.slice(i + 1)
                }
                let datetime = moment.utc(timestamp)
                return { filename, url, timestamp, datetime }
            }).sort((entryA, entryB) => { // Sort them with most recent at the top.
                if (entryA.datetime > entryB.datetime) return -1;
                if (entryA.datetime < entryB.datetime) return 1;
                return 0;
            }).value()
            let mostRecent = cacheCandidates[0]
            if (mostRecent && Loader.getCurrentUnixTimestamp() - mostRecent.datetime.valueOf() < maxAge) {
                return mostRecent;
            }
            let error = new Error(`No cache entry for '${url}' could be found more recent than one day old.`)
            error.code = 'NOTCACHED'
            return Promise.reject(error);
        }).then(entry => {
            let {filename, timestamp} = entry
            return Loader.readFile( // Try to read the file from the cache.
                path.join(cachePath, filename),
                { encoding: 'utf-8' }
            ).then(body => {
                return { body, timestamp }
            })
        })
    }

    // Wrapped for testing:
    static readFile() {
        return readFile.apply(this, arguments)
    }
    static writeFile() {
        return writeFile.apply(this, arguments)
    }
    static readdir() {
        return readdir.apply(this, arguments)
    }
    static mkdir() {
        return mkdir.apply(this, arguments)
    }
    static getCurrentUnixTimestamp() { // In milliseconds
        return moment().valueOf()
    }
    static getCurrentUtcMoment() {
        return moment.utc()
    }
    static request() {
        console.log(`Warning: live request to '${arguments[0].url}'`)
        return request.apply(this, arguments)
    }
}

module.exports = {
    loader: new Loader(CACHE_PATH, MAX_AGE), // public api
    Loader // for test
}
