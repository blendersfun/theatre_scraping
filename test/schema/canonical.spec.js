const {expect} = require('chai')
const schemas = require('../../src/schema/canonical')

describe('canonical.Dataset schema', function () {
    let ajv
    beforeEach(function () {
        ajv = schemas.newAjv()
    })
    it('is a valid draft-07 JSON Schema', function () {
        const validate = ajv.getSchema(schemas.Dataset.$id)
    })

    describe('canonical.Address schema', function () {
        it('validates a USA address', function () {
            const validate = ajv.getSchema(schemas.Address.$id)
            validate({
                "number": "5556",
                "street": {
                    "cardinalPre": "NE",
                    "name": "36th",
                    "suffix": "Ave"
                },
                "city": "Seattle",
                "state": "WA",
                "postalCode": "98105",
                "country": "USA"
            })
            if (validate.errors) {
                throw validate.errors
            }
        })
        it('finds an address invalid', function () {
            const validate = ajv.getSchema(schemas.Address.$id)
            validate({
                // missing "number"
                "street": {
                    "cardinalPre": "NE",
                    "name": "36th",
                    "suffix": "Ave"
                },
                "city": "Seattle",
                "state": "WA",
                "postalCode": "98105"
            })
            expect(validate.errors).to.be.an('array')
            expect(validate.errors).not.to.be.empty
        })
    })

    describe('canonical.Production schema', function () {
        describe('schedule', function () {
            it('can represent a set of weekdays from now until a end date', function () {
                const validate = ajv.getSchema(schemas.Production.$id)
                validate({
                    "schedule": {
                        "window": { "end": "2018-04-08" },
                        "weekDays": ["WED", "THU", "FRI", "SAT", "SUN"]
                    }
                })
                if (validate.errors) {
                    throw validate.errors
                }
            })
            it('can represent a set of times during the week from now until a end date', function () {
                const validate = ajv.getSchema(schemas.Production.$id)
                validate({
                    "schedule": {
                        "window": { "end": "2018-04-08" },
                        "weekTimes": [
                            { "day": "SAT", "time": "15:00:00" },
                            { "day": "SUN", "time": "15:00:00" }
                        ]
                    }
                })
                if (validate.errors) {
                    throw validate.errors
                }
            })
        })
    })
})
