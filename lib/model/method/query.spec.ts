import {ELogs, getLogger} from '../../util/log'
import {Query} from './query'

const log: any = getLogger(ELogs.TEST)

describe('query', function () {
  describe('HashQuery', () => {
    it('should new CompositeQuery', () => {
      const expected = {
        KeyConditionExpression   : '#HSK = :HSK',
        ExpressionAttributeNames : {'#HSK': 'hsk'},
        ExpressionAttributeValues: {':HSK': 'hello'}
      }
      const query = new Query<Schema, 'hsk'>(log, 'hsk', 'hello')
      const actual = query.out()
      expect(actual).toEqual(expected)
    })
    it('should includes FilterExpression', () => {
      const expected = {
        KeyConditionExpression   : '#HSK = :HSK',
        FilterExpression         : '#a = :a AND #b = :b',
        ExpressionAttributeNames : {
          '#HSK': 'hsk',
          '#a'  : 'hsk',
          '#b'  : 'hsk'
        },
        ExpressionAttributeValues: {
          ':HSK': 'hello',
          ':a'  : 'a2',
          ':b'  : 1,
        }
      }
      const query = new Query<Schema, 'hsk'>(log, 'hsk', 'hello')
      const actual = query
        .filter(operator => {
          operator.eq('hsk', 'a2')
          operator.eq('hsk', 1)
        })
        .out()
      expect(actual).toEqual(expected)
    })
  })
  describe('CompositeQuery', () => {
    it('should sort descend', async done => {
      const expected = {
        KeyConditionExpression   : '#HSK = :HSK',
        ExpressionAttributeNames : {'#HSK': 'hsk'},
        ExpressionAttributeValues: {':HSK': 'hello'},
        ScanIndexForward         : false
      }
      const query = new Query<Schema, 'hsk'>(log, 'hsk', 'hello')
      const actual = await query
        .desc()
        .out()
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
      const query = new Query<Schema, 'hsk'>(log, 'hsk', 'hello')
      const actual = await query
        .consistent()
        .out()
      expect(actual).toEqual(expected)
      done()
    })
    it('should NOT includes RangeKey. before range() call', async done => {
      const expected = {
        KeyConditionExpression   : '#HSK = :HSK',
        ExpressionAttributeNames : {'#HSK': 'hsk'},
        ExpressionAttributeValues: {':HSK': 'hello'},
      }
      const query = new Query<Schema, 'hsk'>(log, 'hsk', 'hello')
      const actual = await query
        .out()
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
          const query = new Query<Schema, 'hsk'>(log, 'hsk', 'hello')
          const actual = await query
            .range('rgk').eq(5945)
            .out()
          expect(actual).toEqual(expected)
          done()
        })
        it('.lt() should includes RangeKey condition in KeyConditionExpression', async done => {
          const expected = {
            KeyConditionExpression   : '#HSK = :HSK AND #RGK < :RGK',
            ExpressionAttributeNames : {'#HSK': 'hsk', '#RGK': 'rgk'},
            ExpressionAttributeValues: {':HSK': 'hello', ':RGK': 5945},
          }
          const query = new Query<Schema, 'hsk'>(log, 'hsk', 'hello')
          const actual = await query
            .range('rgk').lt(5945)
            .out()
          expect(actual).toEqual(expected)
          done()
        })
        it('.le() should includes RangeKey condition in KeyConditionExpression', async done => {
          const expected = {
            KeyConditionExpression   : '#HSK = :HSK AND #RGK <= :RGK',
            ExpressionAttributeNames : {'#HSK': 'hsk', '#RGK': 'rgk'},
            ExpressionAttributeValues: {':HSK': 'hello', ':RGK': 5945},
          }
          const query = new Query<Schema, 'hsk'>(log, 'hsk', 'hello')
          const actual = await query
            .range('rgk').le(5945)
            .out()
          expect(actual).toEqual(expected)
          done()
        })
        it('.gt() should includes RangeKey condition in KeyConditionExpression', async done => {
          const expected = {
            KeyConditionExpression   : '#HSK = :HSK AND #RGK > :RGK',
            ExpressionAttributeNames : {'#HSK': 'hsk', '#RGK': 'rgk'},
            ExpressionAttributeValues: {':HSK': 'hello', ':RGK': 5945},
          }
          const query = new Query<Schema, 'hsk'>(log, 'hsk', 'hello')
          const actual = await query
            .range('rgk').gt(5945)
            .out()
          expect(actual).toEqual(expected)
          done()
        })
        it('.ge() should includes RangeKey condition in KeyConditionExpression', async done => {
          const expected = {
            KeyConditionExpression   : '#HSK = :HSK AND #RGK >= :RGK',
            ExpressionAttributeNames : {'#HSK': 'hsk', '#RGK': 'rgk'},
            ExpressionAttributeValues: {':HSK': 'hello', ':RGK': 5945},
          }
          const query = new Query<Schema, 'hsk'>(log, 'hsk', 'hello')
          const actual = await query
            .range('rgk').ge(5945)
            .out()
          expect(actual).toEqual(expected)
          done()
        })
        it('.between() should includes RangeKey condition in KeyConditionExpression', async done => {
          const expected = {
            KeyConditionExpression   : '#HSK = :HSK AND #RGK BETWEEN (:a AND :b)',
            ExpressionAttributeNames : {'#HSK': 'hsk', '#RGK': 'rgk'},
            ExpressionAttributeValues: {':HSK': 'hello', ':a': 5944, ':b': 5946},
          }
          const query = new Query<Schema, 'hsk'>(log, 'hsk', 'hello')
          const actual = await query
            .range('rgk')
            .between(5944, 5946) .out()
          expect(actual).toEqual(expected)
          done()
        })
        it('.beginsWith() should includes RangeKey condition in KeyConditionExpression', async done => {
          const expected = {
            KeyConditionExpression   : '#HSK = :HSK AND begins_with(#RGK, :RGK)',
            ExpressionAttributeNames : {'#HSK': 'hsk', '#RGK': 'rgk'},
            ExpressionAttributeValues: {':HSK': 'hello', ':RGK': '123'},
          }
          const query = new Query<StringSchema, 'hsk'>(log, 'hsk', 'hello')
          const actual = await query
            .range('rgk')
            .beginsWith('123')
            .out()
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
interface StringSchema {
  readonly hsk: string
  readonly rgk: string
}
