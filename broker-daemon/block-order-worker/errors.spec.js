const { expect } = require('test/test-helper')

const { BlockOrderError, BlockOrderNotFoundError } = require('./errors')

describe('errors', () => {
  describe('BlockOrderError', () => {
    let blockOrderError
    let err
    let message

    beforeEach(() => {
      err = new Error('test error')
      message = 'Internal error'

      blockOrderError = new BlockOrderError(message, err)
    })

    it('inherits from Error', () => {
      expect(blockOrderError).to.be.an('error')
    })

    it('is a BlockOrderError', () => {
      expect(blockOrderError.name).to.be.eql('BlockOrderError')
    })

    it('throws an error if no message is provided', () => {
      expect(() => new BlockOrderError()).to.throw()
    })

    it('sets a stack on the public error referencing the error argument', () => {
      expect(blockOrderError.stack).to.eql(err.stack)
    })

    it('defaults to the caller stack if no error argument exists', () => {
      expect(new BlockOrderError(message).stack).to.not.eql(err.stack)
    })
  })

  describe('BlockOrderNotFoundError', () => {
    let blockOrderError
    let err
    let id

    beforeEach(() => {
      err = new Error('test error')
      id = 'fakeID'

      blockOrderError = new BlockOrderNotFoundError(id, err)
    })

    it('inherits from BlockOrderError', () => {
      expect(blockOrderError).to.be.an('error')
    })

    it('is a BlockOrderNotFoundError', () => {
      expect(blockOrderError.name).to.be.eql('BlockOrderNotFoundError')
    })

    it('sets a stack on the public error referencing the error argument', () => {
      expect(blockOrderError.stack).to.eql(err.stack)
    })

    it('defaults to the caller stack if no error argument exists', () => {
      expect(new BlockOrderNotFoundError(id).stack).to.not.eql(err.stack)
    })

    it('provides an error message using the ID', () => {
      expect(blockOrderError.message).to.be.eql('Block Order with ID fakeID was not found.')
    })

    it('sets a notFound parameter for easy checking', () => {
      return expect(blockOrderError.notFound).to.be.true
    })
  })
})
