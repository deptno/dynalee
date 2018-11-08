import {dynamodbDoc} from './dynamodb-document'

describe('util', function () {
  describe('cleanDoc', function () {
    it('should omit empty values', function () {
      const params = {
        validValue: 0,
        validString: '1',
        validSet: new Set([1]),
        validList: [1],
        emptyString: '',
        emptySet: new Set(),
        emptyList: [],
        undefined: undefined,
        null: null,
      }
      expect(dynamodbDoc(params)).toEqual({
        validValue: 0,
        validString: '1',
        validSet: new Set([1]),
        validList: [1],
      })
    })
  })
  it('should not put at dynamodb local', function () {
    const params = {
      validValue: 0,
      emptyString: '',
      emptySet: new Set(),
      emptyList: [],
      undefined: undefined,
      null: null,
    }
    expect(dynamodbDoc(params)).toEqual({validValue: 0})
  })
})