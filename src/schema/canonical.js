// A collection of JSON schema objects which describe the canonical
// representations of the various real-world entities being modelled.

const Ajv = require('ajv')
const metaSchema = require('ajv/lib/refs/json-schema-draft-07.json')

const AddressUSA = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "http://dreamforgers.dreamhosters.com/aaron/schemas/canon/addressUSA.json",
    "description": "A valid, complete physical or mailing address as recognized by the United States of America.",
    "type": "object",
    "required": ["number", "street", "state", "postalCode"],
    "additionalProperties": false,
    "properties": {
        "number": {
            "type": "string",
            "description": "The address number of the building or other location on the street."
        },
        "street": {
            "type": "object",
            "description": "A fully described street, recognized by local government.",
            "required": ["name", "suffix"],
            "additionalProperties": false,
            "properties": {
                "cardinalPre": {
                    "type": "string",
                    "description": "A cardinal direction prefix to the street name.",
                    "examples": ["N", "SW", "E"]
                },
                "cardinalPost": {
                    "type": "string",
                    "description": "A cardinal direction suffix to the street suffix.",
                    "examples": ["N", "SW", "E"]
                },
                "name": {
                    "type": "string",
                    "description": "The name of the street."
                },
                "suffix": {
                    "type": "string",
                    "description": "A descriptor suffix to further designate the street name, written as it would be seen on a street sign.",
                    "examples": ["Ave", "St", "Rd"]
                }
            }
        },
        "secondary": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "identifier": {
                    "type": "string",
                    "description": "A descriptor which designates what type of secondary location is being referred to.",
                    "examples": ["Apt", "Bldg", "Suite", "Unit", "Rm", "#"]
                },
                "address": {
                    "type": "string",
                    "description": "The recognized name or number of the secondary location."
                }
            }
        },
        "country": {
            "const": "USA"
        },
        "state": {
            "type": "string",
            "description": "A two letter state code."
        },
        "county": {
            "type": "string"
        },
        "city": {
            "type": "string"
        },
        "postalCode": {
            "type": "string",
            "description": "A 5 digit postal code, with or without the +4 digit extention."
        }
    }
}

const Address = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "http://dreamforgers.dreamhosters.com/aaron/schemas/canon/address.json",
    "description": "An official set of instructions for routing mail to or physically finding a particular building.",
    "type": "object",
    "oneOf": [
        { "$ref": "addressUSA.json" }
    ]
}

const Venue = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "http://dreamforgers.dreamhosters.com/aaron/schemas/canon/venue.json",
    "description": "A location with an address where live performances may be attended.",
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "name": {
            "type": "string"
        },
        "aliases": {
            "type": "array",
            "items": { "type": "string" }
        },
        "address": { "$ref": "address.json" }
    }
}

const Performance = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "http://dreamforgers.dreamhosters.com/aaron/schemas/canon/performance.json",
    "description": "A specific time and place when a performance of a production may be attended.",
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "start": {
            "date": { "format": "date" },
            "time": { "format": "time" },
            "description": "The date and time of the start of the performance in local time."
        }
    }
}

const Production = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "http://dreamforgers.dreamhosters.com/aaron/schemas/canon/production.json",
    "description": "A work of theatre or dance performance which may be performed at certain times and locations.",
    "type": "object",
    "definitions": {
        "weekDay": {
            "enum": ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
        },
        "currency": {
            "enum": ["USD"]
        },
        "price": {
            "type": "object",
            "required": ["currency"],
            "additionalProperties": false,
            "properties": {
                "currency": { "$ref": "#/definitions/currency" },
                "amount": { "type": "number" },
                "pwyc": { "type": "boolean" }
            }
        }
    },
    "additionalProperties": false,
    "properties": {
        "title": {
            "type": "string",
            "description": "The title of the production, as described by whomever is producing it."
        },
        "venue": { "$ref": "venue.json" },
        "duration": {
            "type": "number",
            "description": "The estimated duration of the production in minutes."
        },
        "performances": {
            "type": "array",
            "items": { "$ref": "performance.json" }
        },
        "schedule": {
            "type": "object",
            "description": "A set of descriptors for the performance schedule in local time, as it may not be possible to determine the timezone.",
            "additionalProperties": false,
            "properties": {
                "window": {
                    "type": "object",
                    "description": "A window of time between two dates as observed in the local timezone in which all performances will occur. If there is no start, it is assumed to already be underway.",
                    "required": ["end"],
                    "additionalProperties": false,
                    "properties": {
                        "start": { "format": "date" },
                        "end": { "format": "date" }
                    }
                },
                "weekDays": {
                    "type": "array",
                    "items": { "$ref": "#/definitions/weekDay" },
                    "maxItems": 7
                },
                "weekTimes": {
                    "type": "array",
                    "description": "A list of days and times during the week when performances will start.",
                    "items": {
                        "type": "object",
                        "required": ["day", "time"],
                        "additionalProperties": false,
                        "properties": {
                            "day": { "$ref": "#/definitions/weekDay" },
                            "time": { "format": "time" }
                        }
                    }
                },
                "time": {
                    "format": "time",
                    "description": "The single time of day that all performances start at."
                }
            }
        },
        "price": { "$ref": "#/definitions/price" },
        "prices": {
            "type": "array",
            "items": { "$ref": "#/definitions/price" }
        },
        "priceRange": {
            "type": "object",
            "required": ["currency", "min", "max"],
            "additionalProperties": false,
            "properties": {
                "currency": { "$ref": "#/definitions/currency" },
                "min": { "type": "number" },
                "max": { "type": "number" }
            }
        },
        "ticketsUrl": {
            "format": "uri"
        }
    }
}

const SourceURL = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "http://dreamforgers.dreamhosters.com/aaron/schemas/canon/sourceURL.json",
    "description": "A url where data that contributed to this dataset has been acquired.",
    "type": "object",
    "required": ["url", "type"], // Accessed is not required because this could be a potential source.
    "additionalProperties": false,
    "properties": {
        "url": { "format": "uri" },
        "accessed": {
            "format": "date-time",
            "description": "The date-time in UTC when the URL was accessed."
        },
        "type": {
            "description": "How this source is classified for the purposes of dataset priority.",
            "enum": [
                "NEWS_LISTING",
                "NEWS_EVENT_PAGE"
            ]
        }
    }
}

const Source = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "http://dreamforgers.dreamhosters.com/aaron/schemas/canon/source.json",
    "description": "A source where data that contributed to this dataset has been acquired.",
    "type": "object",
    "oneOf": [
        { "$ref": "sourceURL.json" }
    ]
}

const Dataset = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "http://dreamforgers.dreamhosters.com/aaron/schemas/canon/dataset.json",
    "description": "A collection of data which describes theatre performances.",
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "productions": {
            "type": "array",
            "items": { "$ref": "production.json" }
        },
        "sources": {
            "type": "array",
            "description": "A list of sources where this dataset came from. If there are multiple, they are listed in the order of descending signficance, where more significant source's data overrides less signficant source's data.",
            "items": { "$ref": "source.json" }
        },
        "potentialSources": {
            "type": "array",
            "description": "A list of potential sources discovered within the sources of this dataset.",
            "items": { "$ref": "source.json" }
        }
    }
}

function newAjv() {
    ajv = new Ajv({ meta: false })
    ajv.addMetaSchema(metaSchema) // Explicit, for future proofing
    ajv.addSchema(Dataset)
    ajv.addSchema(Source)
    ajv.addSchema(SourceURL)
    ajv.addSchema(Production)
    ajv.addSchema(Performance)
    ajv.addSchema(Venue)
    ajv.addSchema(Address)
    ajv.addSchema(AddressUSA)
    return ajv
}

module.exports = {
    Dataset,
    Source,
    SourceURL,
    Production,
    Performance,
    Venue,
    Address,
    AddressUSA,
    newAjv
}
