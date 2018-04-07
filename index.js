
const {promisify} = require('util')
const writeFile = promisify(require('fs').writeFile)
const readFile = promisify(require('fs').readFile)
const path = require('path')

const request = promisify(require('request'))
const cheerio = require('cheerio')
const _ = require('lodash')

const entryPoint = 'https://www.thestranger.com/events/performance'
const cachePath = './cache'

const sanitizeFilename = str => str.replace(/[<>\:\"\/\\|\?\*]/g, '-')

let filePath = path.join(cachePath, sanitizeFilename(entryPoint))

readFile( // Try to read the file from the cache.
    filePath,
    { encoding: 'utf-8' }
).catch(err => {
    if (err.code === 'ENOENT') { // If it is not in the cache, read it from the server.
        return request({
            url: entryPoint
        }).then(response => {
            return writeFile( // And write it to the cache.
                filePath, 
                response.body, 
                { encoding: 'utf-8' }
            ).then(() => response.body)
        })
    }
}).then(body => {
    let $ = cheerio.load(body, { normalizeWhitespace: true })

    // For https://www.thestranger.com/events/performance
    return
    let calendarPosts = $('.calendar-post').not('.fish-butter')
    let parsedCalendarPosts = calendarPosts.map((i, el) => {
        let $el = $(el)
        return {
            title: _.trim($el.find('.calendar-post-title > *:first-child').text()),
            location: {
                venueName: _.trim($el.find('.calendar-post-venue').text()),
                neighborhood: _.trim($el.find('.calendar-post-neighborhood').text())
            },
            dates: _.trim($el.find('.calendar-post-date').text()),
            price: _.trim($el.find('.calendar-post-event-price').text())
        }
    }).get()

    console.log(parsedCalendarPosts)

    let config1 = {
        events: '.calendar-posts',
        without: '.fish-butter',
        mapping: config2
    }

    let config2 = {
        title: '.calendar-post-title > *:first-child',
        location: {
            venueName: '.calendar-post-venue',
            neighborhood: '.calendar-post-neighborhood'
        },
        dates: '.calendar-post-date',
        price: '.calendar-post-event-price'
    }
})

