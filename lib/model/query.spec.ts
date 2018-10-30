import {Operator} from '../operator/operator'
import {getLogger} from '../util/debug'
import {CompositeQuery, HashQuery} from './query'

const logger = getLogger(__filename)

describe('query', function () {
  const tableName = 'dynalee'
  const hashKeyName = 'hello'
  const rangeKeyName = 'world'
  //operator 가 키 이름들을 가지고 있음
  const op = new Operator<Schema['hsk'], Schema['rgk']>(tableName, hashKeyName, rangeKeyName)

  describe('HashQuery', () => {
    it('should new CompositeQuery', async done => {
      const expected = {
        KeyConditionExpression   : '#HSK = :HSK',
        ExpressionAttributeNames : {'#HSK': 'hsk'},
        ExpressionAttributeValues: {':HSK': 'hello'}
      }
      const query = new HashQuery<Schema, Schema['hsk']>(logger, op, 'hsk', 'hello')
      const actual = await query.compile()
      expect(actual).toEqual(expected)
      done()
    })
  })
  describe('CompositeQuery', () => {
    it('should includes pages', async done => {
      const expected = {
        KeyConditionExpression   : '#HSK = :HSK',
        ExpressionAttributeNames : {'#HSK': 'hsk'},
        ExpressionAttributeValues: {':HSK': 'hello'},
        __pages                  : 1
      }
      const query = new CompositeQuery<Schema, Schema['hsk'], Schema['rgk']>(logger, op, 'hsk', 'hello')
      const actual = await query
        .pages(1)
        .compile()
      expect(actual).toEqual(expected)
      done()
    })
    it('should sort descend', async done => {
      const expected = {
        KeyConditionExpression   : '#HSK = :HSK',
        ExpressionAttributeNames : {'#HSK': 'hsk'},
        ExpressionAttributeValues: {':HSK': 'hello'},
        ScanIndexForward         : true
      }
      const query = new CompositeQuery<Schema, Schema['hsk'], Schema['rgk']>(logger, op, 'hsk', 'hello')
      const actual = await query
        .desc()
        .compile()
      expect(actual).toEqual(expected)
      done()
    })
    it('should includes consist', async done => {
      const expected = {
        KeyConditionExpression   : '#HSK = :HSK',
        ExpressionAttributeNames : {'#HSK': 'hsk'},
        ExpressionAttributeValues: {':HSK': 'hello'},
        ConsistentRead           : true
      }
      const query = new CompositeQuery<Schema, Schema['hsk'], Schema['rgk']>(logger, op, 'hsk', 'hello')
      const actual = await query
        .consistent()
        .compile()
      expect(actual).toEqual(expected)
      done()
    })
    it('should NOT includes RangeKey. before range() call', async done => {
      const expected = {
        KeyConditionExpression   : '#HSK = :HSK',
        ExpressionAttributeNames : {'#HSK': 'hsk'},
        ExpressionAttributeValues: {':HSK': 'hello'},
      }
      const query = new CompositeQuery<Schema, Schema['hsk'], Schema['rgk']>(logger, op, 'hsk', 'hello')
      const actual = await query
        .compile()
      expect(actual).toEqual(expected)
      done()
    })
    describe('.range', function () {
      describe('.()', function () {
        it('.eq() should includes RangeKey condition in KeyConditionExpression', async done => {
          const expected = {
            KeyConditionExpression   : '#HSK = :HSK AND #RGK = :RGK',
            ExpressionAttributeNames : {'#HSK': 'hsk', '#RGK': 'rgk'},
            ExpressionAttributeValues: {':HSK': 'hello', ':RGK': 5945},
          }
          const query = new CompositeQuery<Schema, Schema['hsk'], Schema['rgk']>(logger, op, 'hsk', 'hello')
          const actual = await query
            .range('rgk').eq(5945)
            .compile()
          expect(actual).toEqual(expected)
          done()
        })
        it('.ne() should includes RangeKey condition in KeyConditionExpression', async done => {
          const expected = {
            KeyConditionExpression   : '#HSK = :HSK AND #RGK <> :RGK',
            ExpressionAttributeNames : {'#HSK': 'hsk', '#RGK': 'rgk'},
            ExpressionAttributeValues: {':HSK': 'hello', ':RGK': 5945},
          }
          const query = new CompositeQuery<Schema, Schema['hsk'], Schema['rgk']>(logger, op, 'hsk', 'hello')
          const actual = await query
            .range('rgk').ne(5945)
            .compile()
          expect(actual).toEqual(expected)
          done()
        })
        it('.lt() should includes RangeKey condition in KeyConditionExpression', async done => {
          const expected = {
            KeyConditionExpression   : '#HSK = :HSK AND #RGK < :RGK',
            ExpressionAttributeNames : {'#HSK': 'hsk', '#RGK': 'rgk'},
            ExpressionAttributeValues: {':HSK': 'hello', ':RGK': 5945},
          }
          const query = new CompositeQuery<Schema, Schema['hsk'], Schema['rgk']>(logger, op, 'hsk', 'hello')
          const actual = await query
            .range('rgk').lt(5945)
            .compile()
          expect(actual).toEqual(expected)
          done()
        })
        it('.le() should includes RangeKey condition in KeyConditionExpression', async done => {
          const expected = {
            KeyConditionExpression   : '#HSK = :HSK AND #RGK <= :RGK',
            ExpressionAttributeNames : {'#HSK': 'hsk', '#RGK': 'rgk'},
            ExpressionAttributeValues: {':HSK': 'hello', ':RGK': 5945},
          }
          const query = new CompositeQuery<Schema, Schema['hsk'], Schema['rgk']>(logger, op, 'hsk', 'hello')
          const actual = await query
            .range('rgk').le(5945)
            .compile()
          expect(actual).toEqual(expected)
          done()
        })
        it('.gt() should includes RangeKey condition in KeyConditionExpression', async done => {
          const expected = {
            KeyConditionExpression   : '#HSK = :HSK AND #RGK > :RGK',
            ExpressionAttributeNames : {'#HSK': 'hsk', '#RGK': 'rgk'},
            ExpressionAttributeValues: {':HSK': 'hello', ':RGK': 5945},
          }
          const query = new CompositeQuery<Schema, Schema['hsk'], Schema['rgk']>(logger, op, 'hsk', 'hello')
          const actual = await query
            .range('rgk').gt(5945)
            .compile()
          expect(actual).toEqual(expected)
          done()
        })
        it('.ge() should includes RangeKey condition in KeyConditionExpression', async done => {
          const expected = {
            KeyConditionExpression   : '#HSK = :HSK AND #RGK >= :RGK',
            ExpressionAttributeNames : {'#HSK': 'hsk', '#RGK': 'rgk'},
            ExpressionAttributeValues: {':HSK': 'hello', ':RGK': 5945},
          }
          const query = new CompositeQuery<Schema, Schema['hsk'], Schema['rgk']>(logger, op, 'hsk', 'hello')
          const actual = await query
            .range('rgk').ge(5945)
            .compile()
          expect(actual).toEqual(expected)
          done()
        })
        it('.between() should includes RangeKey condition in KeyConditionExpression', async done => {
          const expected = {
            KeyConditionExpression   : '#HSK = :HSK AND #RGK BETWEEN (:a, :b)',
            ExpressionAttributeNames : {'#HSK': 'hsk', '#RGK': 'rgk'},
            ExpressionAttributeValues: {':HSK': 'hello', ':a': 5944, ':b': 5946},
          }
          const query = new CompositeQuery<Schema, Schema['hsk'], Schema['rgk']>(logger, op, 'hsk', 'hello')
          const actual = await query
            .range('rgk').between(5944, 5946)
            .compile()
          expect(actual).toEqual(expected)
          done()
        })
        it('.beginsWith() should includes RangeKey condition in KeyConditionExpression', async done => {
          const expected = {
            KeyConditionExpression   : '#HSK = :HSK AND begins_with(#RGK, :RGK)',
            ExpressionAttributeNames : {'#HSK': 'hsk', '#RGK': 'rgk'},
            ExpressionAttributeValues: {':HSK': 'hello', ':RGK': '123'},
          }
          const query = new CompositeQuery<Schema, Schema['hsk'], Schema['rgk']>(logger, op, 'hsk', 'hello')
          const actual = await query
            .range('rgk').beginsWith('123')
            .compile()
          expect(actual).toEqual(expected)
          done()
        })
      })
    })
  })
})

interface Schema {
  readonly hsk: string
  readonly rgk: number
}
