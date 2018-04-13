const {Parser} = require('../src/parser')
const chai = require('chai')

describe('parser', function () {
    describe('for theStrangerEventsPerformance.price', function () {
        const somePrices = [ 'Free', '$150–$250', 'Free', '$10', '$15-$20',
          '$30', '$20-$45', '$28 (sold out)', '$30-$40', '$10/$14', '$15-$150',
          '$8/$12', '$29', 'pay what you can', '$16', '$21', '$18–$33', '$25-$45',
          '$15–$45', '$20', '$37-$187', '$20', '$18-$27', '$7-$20', 'Free', '$12',
          'free with admission', '$30/$35', 'Free' ]
        const rejects = [ 'free with admission' ]
        let result

        it('parses "free"', function () {
            result = Parser.parse('theStrangerEventsPerformance.price', 'Free')
            chai.expect(result).to.deep.equal({ price: { amount: 0, currency: 'USD' } })
        })
        it('parses "$10"', function () {
            result = Parser.parse('theStrangerEventsPerformance.price', '$10')
            chai.expect(result).to.deep.equal({ price: { amount: 10, currency: 'USD' } })
        })
        it('parses "$150–$250"', function () {
            result = Parser.parse('theStrangerEventsPerformance.price', '$150–$250')
            chai.expect(result).to.deep.equal({ priceRange: { min: 150, max: 250, currency: 'USD' } })
        })
        it('parses "$10/$14"', function () {
            result = Parser.parse('theStrangerEventsPerformance.price', '$10/$14')
            chai.expect(result).to.deep.equal({ prices: [{ amount: 10, currency: 'USD' }, { amount: 14, currency: 'USD' }] })
        })
        it('parses "$28 (sold out)"', function () {
            result = Parser.parse('theStrangerEventsPerformance.price', '$28 (sold out)')
            chai.expect(result).to.deep.equal({ price: { amount: 28, currency: 'USD' } })
        })
        it('parses "pay what you can"', function () {
            result = Parser.parse('theStrangerEventsPerformance.price', 'pay what you can')
            chai.expect(result).to.deep.equal({ price: { pwyc: true, currency: 'USD' } })
        })
        it('parses all except rejects', function () {
            for (let price of somePrices) {
                if (rejects.indexOf(price) === -1) {
                    result = Parser.parse('theStrangerEventsPerformance.price', price)
                    if (result === undefined) {
                        throw `Could not parse '${price}' which was not in rejects.`
                    }
                }
            }
        })
    })
    describe('for theStrangerEventsPerformance.venue', function () {
        it('parses "Rendezvous"', function () {
            result = Parser.parse('theStrangerEventsPerformance.venue', 'Rendezvous')
            chai.expect(result).to.deep.equal({ venue: { name: 'Rendezvous' } })
        })
        it('parses "Museum of History & Industry (MOHAI)"', function () {
            result = Parser.parse('theStrangerEventsPerformance.venue', 'Museum of History & Industry (MOHAI)')
            chai.expect(result).to.deep.equal({ venue: { name: 'Museum of History & Industry', aliases: ['MOHAI'] } })
        })
    })
})
