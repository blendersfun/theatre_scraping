const zip = require('lodash/zip')
const trim = require('lodash/trim')
const get = require('lodash/get')

class Parser {
    static parse(field, value) {
        const {tokens, handlers} = get(Fields, field)
        const tnames =  Object.keys(tokens)
        let stack = tnames.map(t => ({ tokens: [], values: [], test: t, left: value }))
        let matches = [], cur, curTest, match, next
        let iterations = 0
        while (stack.length) {
            cur = stack.pop()
            curTest = tokens[cur.test]
            if (typeof curTest === 'string' || curTest instanceof String) {
                if (cur.left.indexOf(curTest) === 0) {
                    next = {
                        tokens: cur.tokens.concat(cur.test),
                        values: cur.values.concat(curTest),
                        left: trim(cur.left.slice(curTest.length))
                    }
                    if (next.left.length === 0) {
                        delete next.left
                        matches.push(next)
                    } else {
                        stack = stack.concat(tnames.map(t => Object.assign({ test: t }, next)))
                    }
                }
            } else if (curTest instanceof RegExp) {
                match = cur.left.match(curTest)
                if (match && match.index === 0) {
                    next = {
                        tokens: cur.tokens.concat(cur.test),
                        values: cur.values.concat(trim(match[0])),
                        left: trim(cur.left.slice(match[0].length))
                    }
                    if (next.left.length === 0) {
                        delete next.left
                        matches.push(next)
                    } else {
                        stack = stack.concat(tnames.map(t => Object.assign({ test: t }, next)))
                    }
                }
            }
            if (iterations++ > 10000) {
                throw new Error('We appear to be stuck in an infinite loop. Hurray!')
            }
        }
        for (let match of matches) {
            for (let handler of handlers) {
                if (!zip(match.tokens, handler.match).filter(([i, j]) => i !== j).length) {
                    return handler.fn(match.values)
                }
            }
        }
    }
}

const Fields = {
    theStrangerEventsPerformance: {
        price: {
            tokens: {
                '$': '$',
                '#': /\d+|\d+.\d\d/,
                '-': /[–\-]/,
                '/': '/',
                'free': /free/i,
                'out': /\(sold out\)/i,
                'pwyc': /pay what you can/i
            },
            handlers: [
                { match: ['free'],              fn: ()  => ({ price: { amount: 0, currency: 'USD' } }) },
                { match: ['$','#'],             fn: (i) => ({ price: { amount: parseFloat(i[1]), currency: 'USD' } }) },
                { match: ['$','#','-','$','#'], fn: (i) => ({ priceRange: { min: parseFloat(i[1]), max: parseFloat(i[4]), currency: 'USD' } }) },
                { match: ['$','#','/','$','#'], fn: (i) => ({ prices: [ { amount: parseFloat(i[1]), currency: 'USD' },
                                                                        { amount: parseFloat(i[4]), currency: 'USD' } ] }) },
                { match: ['$','#','out'],       fn: (i) => ({ price: { amount: parseFloat(i[1]), currency: 'USD' } }) },
                { match: ['$','#','out'],       fn: (i) => ({ price: { amount: parseFloat(i[1]), currency: 'USD' } }) },
                { match: ['pwyc'],              fn: (i) => ({ price: { pwyc: true, currency: 'USD' } }) }
            ]
        },
        venue: {
            tokens: {
                'various': /various locations/i,
                '(': '(',
                ')': ')',
                'any': /[^\(\)]+/
            },
            handlers: [
                { match: ['various'], fn: () => ({}) },
                { match: ['any','(','any',')'], fn: (i) => ({ venue: { name: i[0], aliases: [i[2]] } }) },
                { match: ['any'], fn: (i) => ({ venue: { name: i[0] } }) }
            ]
        }
    }
}

module.exports = {
    Parser
}
