const schemas = require('./schema/canonical')
const get = require('lodash/get')
const merge = require('lodash/merge')
const {Parser} = require('./parser')

class Normalizer {
    static normalize(dataset) {
        if (!dataset || !dataset.source || !dataset.source.url) {
            let error = new Error('Extracted dataset must have a `source.url` defined.')
            throw error
        }
        let url = dataset.source.url
        let normalizerName = this.getNormalizerName(url)
        let normalized = this[normalizerName](dataset)

        // For now validating with canonical schema, as I have not produced the normalized schema yet.
        // The idea will be to get the data as close to canonical as possible, but with extentions
        // to represent the normalized data that still needs processing.
        let ajv = schemas.newAjv()
        let validate = ajv.getSchema(schemas.Dataset.$id)
        validate(normalized)
        if (validate.errors) {
            throw validate.errors
        }

        return normalized
    }
    static getNormalizerName(url) {
        let normalizers = this.getNormalizers()
        let found = Object.keys(normalizers).find(matcher => {
            if (typeof matcher === 'string' || matcher instanceof String) {
                if (url.indexOf(matcher) === 0) { // Doesn't have to match the full url, but has to start at the beginning.
                    return true
                }
            } else {
                return false
            }
        })
        if (found) {
            return normalizers[found]
        } else {
            let error = new Error(`Could not find an normalizer for url '${url}'`)
            error.code = 'NONORMALIZER'
            throw error
        }
    }
    static getNormalizers() {
        return {
            'https://www.thestranger.com/events/performance': 'theStrangerEventsPerformance'
        }
    }

    // Utility methods:
    static baseUrl(absoluteUrl) {
        let foundIndex = -1
        for (let i = 0; i < 3; i++) {
            foundIndex = absoluteUrl.indexOf('/', foundIndex + 1)
            if (foundIndex === -1) {
                throw new Error(`Reference url could not be parsed for base url: ${referenceUrl}`)
            }
        }
        let baseUrl = absoluteUrl.slice(0, foundIndex)
        return baseUrl
    }
    static copyIfSet(obj, propName) {
        if (obj[propName] !== undefined && obj[propName] !== '')
            return { [propName]: obj[propName] }
    }

    // Specific normalizers for urls:
    static theStrangerEventsPerformance(dataset) {
        let baseUrl = this.baseUrl(dataset.source.url)
        let normalized = {
            productions: dataset.events.map(event => {
                return merge({},
                    this.copyIfSet(event, 'title'),
                    this.copyIfSet(event, 'ticketsUrl'),
                    Parser.parse('theStrangerEventsPerformance.price', event.price),
                    Parser.parse('theStrangerEventsPerformance.venue', event.venue)
                )
            }),
            sources: [dataset.source],
            potentialSources: dataset.events.map(event => {
                return {
                    url: baseUrl + event.detailPageUrl,
                    type: "NEWS_EVENT_PAGE"
                }
            })
        }
        return normalized
    }
    static theStrangerEventsPerformance_price(price) {

    }
    static theStrangerEventsPerformance_price(price) {

    }
}

module.exports = {
    Normalizer
}
