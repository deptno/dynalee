import {dynamodbDoc} from './dynamodb-document'

describe('util', function () {
  describe('cleanDoc', function () {
    it('should omit empty values', function () {
      const params = {
        validValue    : 0,
        validString   : '1',
        validSet      : new Set([1]),
        validList     : [1],
        emptyString   : '',
        emptySet      : new Set(),
        validEmptyList: [],
        undefined     : undefined,
        null          : null,
      }
      expect(dynamodbDoc(params, Array.from)).toEqual({
        validValue    : 0,
        validString   : '1',
        validSet      : [1],
        validList     : [1],
        validEmptyList: [],
      })
    })
  })
  it('should not put at dynamodb local', function () {
    const params = {
      validValue    : 0,
      validEmptyList: [],
      emptyString   : '',
      emptySet      : new Set(),
      undefined     : undefined,
      null          : null,
    }
    expect(dynamodbDoc(params)).toEqual({validValue: 0, validEmptyList: []})
  })
  it('should care nested object', function () {
    const params = {
      nested: {
        validValue    : 0,
        validEmptyList: [],
        emptyString   : '',
        emptySet      : new Set(),
        undefined     : undefined,
        null          : null,
      }
    }
    expect(dynamodbDoc(params)).toEqual({nested: {validValue: 0, validEmptyList: []}})
  })
})