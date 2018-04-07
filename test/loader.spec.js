const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const {Loader} = require('../src/loader')
const moment = require('moment')

const expect = chai.expect;
chai.use(sinonChai)

describe('loader.loadUrl()', function () {
    let loader
    let sandbox
    let readdirResult
    let currentUnixTimestamp
    let fileContents
    before(function () {
        loader = new Loader(
            './testCache', // cache directory
            1000 * 60 // max age in milliseconds, 1 minute
        )
        sandbox = sinon.createSandbox()
        readdirResult = []
        currentUnixTimestamp = moment.utc('2018-04-07T08:50:12Z').valueOf()
        fileContents = '<!DOCTYPE html><body>Test html body</body>'
    })
    afterEach(function () {
        sandbox.restore()
    })
    function setupDefaultStubsExcept(skip) {
        skip = skip || []
        const inc = (name) => skip.indexOf(name) === -1 // 'include' predicate
        if (inc('readdir')) sandbox.stub(Loader, 'readdir').resolves(readdirResult)
        if (inc('request')) sandbox.stub(Loader, 'request').resolves({ body: fileContents })
        if (inc('mkdir')) sandbox.stub(Loader, 'mkdir').resolves()
        if (inc('writeFile')) sandbox.stub(Loader, 'writeFile').resolves()
        if (inc('readFile')) sandbox.stub(Loader, 'readFile').resolves(fileContents)
        if (inc('getCurrentUnixTimestamp')) sandbox.stub(Loader, 'getCurrentUnixTimestamp').returns(currentUnixTimestamp)
    }
    const setupDefaultStubs = setupDefaultStubsExcept // Alias for readability
    it('creates the cache, if no cache directory exists', function () {
        setupDefaultStubsExcept(['readdir'])
        let error = new Error('Test file system error')
        error.code = 'ENOENT'
        sandbox.stub(Loader, 'readdir').rejects(error)

        return loader.loadUrl('http://www.google.com').catch(err => {
            expect(err).to.not.exist
        }).then(() => {
            expect(Loader.mkdir).to.have.been.called
        })
    })
    it('reads from the cache, if a young enough entry exists', function () {
        readdirResult = [
            'http---www.google.com.2018-04-07T08-49-42Z' // 30 seconds ago relative to 'currentUnixTimestamp'
        ]
        setupDefaultStubs()

        return loader.loadUrl('http://www.google.com').catch(err => {
            expect(err).not.to.exist
        }).then(() => {
            expect(Loader.readFile).to.have.been.called
            expect(Loader.request).not.to.have.been.called
        })
    })
    it('fetches a new copy and caches it, if the youngest cached copy is too old', function () {
        readdirResult = [
            'http---www.google.com.2018-04-07T08-48-42Z' // 1 minute, 30 seconds ago relative to 'currentUnixTimestamp'
        ]
        setupDefaultStubs()

        return loader.loadUrl('http://www.google.com').catch(err => {
            expect(err).not.to.exist
        }).then(() => {
            expect(Loader.readFile).not.to.have.been.called
            expect(Loader.request).to.have.been.called
            expect(Loader.writeFile).to.have.been.called
        })
    })
    it('fetches it from the server, if not found in cache', function () {
        setupDefaultStubs()

        return loader.loadUrl('http://www.google.com').catch(err => {
            expect(err).not.to.exist
        }).then(() => {
            expect(Loader.readFile).not.to.have.been.called
            expect(Loader.request).to.have.been.called
            expect(Loader.writeFile).to.have.been.called
        })
    })

    // Still need to be implemented:
    xit('rejects with an error, if the server returns a non-200 code', function () {})
    xit('rejects with en error, if file system permission prevent necessary actions', function () {})
    xit('chooses the most recent cached copy out of a handful of valid ones', function () {})
    xit('chooses a cached copy with the correct url', function () {})
})
