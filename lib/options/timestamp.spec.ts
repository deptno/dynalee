import {ETimestampType} from '../constant'
import {applyTimestamp} from './timestamp'

describe('options', function () {
  describe('applyTimestamp', () => {
    it('object extending', () => {
      {
        const actual = applyTimestamp({hashKey: 'hashKey'} as Schema, {
          timestamp: {type: ETimestampType.Iso8601}
        })
        expect(Object.keys(actual).length).toEqual(3)
      }
      {
        const actual = applyTimestamp({} as Schema, {
          timestamp: {
            type: ETimestampType.Iso8601
          }
        })
        expect(Object.keys(actual).length).toEqual(2)
      }
    })
    it('apply type: Iso8601', () => {
      const actual = applyTimestamp({} as Schema, {
        timestamp: {
          type: ETimestampType.Iso8601
        }
      })
      expect(actual).toHaveProperty('createdAt')
      expect(actual).toHaveProperty('updatedAt')
      expect(typeof actual.updatedAt).toEqual('string')
      expect(typeof actual.createdAt).toEqual('string')
    })
    it('{createdAt}, Miliseconds', () => {
      const actual = applyTimestamp({} as Schema, {
        timestamp: {
          type: ETimestampType.Milliseconds
        }
      })
      expect(actual).toHaveProperty('createdAt')
      expect(actual).toHaveProperty('updatedAt')
      expect(typeof actual.updatedAt).toEqual('number')
      expect(typeof actual.createdAt).toEqual('number')
    })
  })
})
interface Schema {
  hashKey: string
  createdAt?: string
  updatedAt?: string
}
