let trim = require('lodash/trim')

class Extractor {
    static extract(url, $) {
        let extractorName = this.getExtractorName(url)
        return this[extractorName]($)
    }
    static getExtractorName(url) {
        let extractors = this.getExtractors()
        let found = Object.keys(extractors).find(matcher => {
            if (typeof matcher === 'string' || matcher instanceof String) {
                if (url.indexOf(matcher) === 0) { // Doesn't have to match the full url, but has to start at the beginning.
                    return true
                }
            } else {
                return false
            }
        })
        if (found) {
            return extractors[found]
        } else {
            let error = new Error(`Could not find an extractor for url '${url}'`)
            error.code = 'NOEXTRACTOR'
            throw error
        }
    }
    static getExtractors() {
        return {
            'https://www.thestranger.com/events/performance': 'theStrangerEventsPerformance'
        }
    }

    // Utility methods:
    static getText($el, query) {
        return trim($el.find(query).first().text())
    }
    static getUrl($el, query) {
        return trim($el.find(query).first().attr('href'))
    }
    static hasElement($el, query) {
        return $el.has(query).length > 0
    }
    static getCollection($el, params, parseFn) {
        if (!params.query) {
            let error = new Error('Required parameter: query.')
            throw error
        }
        let $collection = $el(params.query)
        if (params.filter) $collection = $collection.filter(params.filter)
        if (params.has) $collection = $collection.has(params.has)
        if (params.not) $collection = $collection.not(params.not)
        return $collection.map((i, child) => {
            return parseFn($el(child))
        }).get()
    }
    
    // Specific extractors for urls:
    static theStrangerEventsPerformance(params) {
        let {url, $, timestamp} = params
        let events = this.getCollection($, {
            query: '.calendar-post',
            not: '.fish-butter'
        }, $post => {
            return {
                title:         this.getText($post, '.calendar-post-title > a'),
                venue:         this.getText($post, '.calendar-post-venue'),
                dates:         this.getText($post, '.calendar-post-date'),
                price:         this.getText($post, '.calendar-post-event-price'),

                ticketsUrl:    this.getUrl($post, '.buy-tickets-button'),
                detailPageUrl: this.getUrl($post, '.calendar-post-title > a'),

                // I'm commenting these out until I decide what to do with source metadata:
                // neighborhood:  this.getText($post, '.calendar-post-neighborhood'),
                // category:      this.getText($post, '.calendar-category'),
                // isPicked:      this.hasElement($post, '.icon-picked')
            }
        })
        return {
            events,
            source: { url, accessed: timestamp, type: "NEWS_LISTING" }
        }
    }
}

module.exports = {
    Extractor
}
