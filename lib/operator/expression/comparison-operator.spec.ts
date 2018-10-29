import {$between, $eq} from '../key-condition-operator'
import {$ne} from './comparison-operator'
import {$$or, mergeOp, replacementIdGenerator} from './helper'

interface Schema {
  key: string
}
const HASH_KEY = 'hashKey'
const RANGE_KEY = 'rangeKey'

const generator = replacementIdGenerator()
class MockUser {
  static query<S, K = keyof S>(hashKey: S, rangeKey?: S) {
    return {
      pipe(...operators: any[]) {
        const ret = mergeOp(generator, operators)
        return {
          ...ret,
          ExpressionAttributeNames: rangeKey
            ? {
              [HASH_KEY] : hashKey,
              [RANGE_KEY]: rangeKey,
            }
            : {
              [HASH_KEY]: hashKey,
            }
        }
      }
    }
  }
}
describe('ComparisonOperator', () => {
  beforeEach(() => {
  })
  it('query', () => {
    const ret = MockUser
      .query('hash', 'range')
      .pipe(
        $eq('a'),
        $$or(
          $ne('b'),
          $ne('c'),
        ),
        $between(1, 3)
      )
    console.log(ret)
  })
  it('eq', () => {
    const ret = $eq('a')
//    console.log(ret)
    const merged = mergeOp(generator, [ret])
//    console.log(merged)

  })
  it('ne', () => {
  })
  it('lt', () => {
  })
  it('le', () => {
  })
  it('gt', () => {
  })
  it('ge', () => {
  })
  it('between', () => {
  })
  it('in', () => {
  })
  it('attributeExists', () => {
  })
  it('attributeNotExists', () => {
  })
  it('attributeType', () => {
  })
  it('beginsWith', () => {
  })
  it('contains', () => {
  })
  describe('Helper', () => {
    it('static size', () => {
    })
  })
})
