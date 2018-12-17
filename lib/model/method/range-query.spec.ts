import {ELogs, getLogger} from '../../util/log'
import {RangeQuery} from './range-query'

const log: any = getLogger(ELogs.TEST)

describe('query', function () {

  describe('.range', function () {
    describe('.()', function () {
      it('.eq() should includes RangeKey condition in KeyConditionExpression', async done => {
        const expected = {
          KeyConditionExpression   : '#HSK = :HSK AND #RGK = :RGK',
          ExpressionAttributeNames : {'#HSK': 'hsk', '#RGK': 'rgk'},
          ExpressionAttributeValues: {':HSK': 'hello', ':RGK': 5945},
        }
        const query = new RangeQuery<Schema, 'hsk', 'rgk'>(log, 'hsk', 'hello', 'rgk')
        const actual = await query
          .eq(5945)
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
        const query = new RangeQuery<Schema, 'hsk', 'rgk'>(log, 'hsk', 'hello', 'rgk')
        const actual = await query
          .lt(5945)
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
        const query = new RangeQuery<Schema, 'hsk', 'rgk'>(log, 'hsk', 'hello', 'rgk')
        const actual = await query
          .le(5945)
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
        const query = new RangeQuery<Schema, 'hsk', 'rgk'>(log, 'hsk', 'hello', 'rgk')
        const actual = await query
          .gt(5945)
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
        const query = new RangeQuery<Schema, 'hsk', 'rgk'>(log, 'hsk', 'hello', 'rgk')
        const actual = await query
          .ge(5945)
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
        const query = new RangeQuery<Schema, 'hsk', 'rgk'>(log, 'hsk', 'hello', 'rgk')
        const actual = await query
          .between(5944, 5946)
          .out()
        expect(actual).toEqual(expected)
        done()
      })
      it('.beginsWith() should includes RangeKey condition in KeyConditionExpression', async done => {
        const expected = {
          KeyConditionExpression   : '#HSK = :HSK AND begins_with(#RGK, :RGK)',
          ExpressionAttributeNames : {'#HSK': 'hsk', '#RGK': 'rgk'},
          ExpressionAttributeValues: {':HSK': 'hello', ':RGK': '123'},
        }
        const query = new RangeQuery<StringSchema, 'hsk', 'rgk'>(log, 'hsk', 'hello', 'rgk')
        const actual = await query
          .beginsWith('123')
          .out()
        expect(actual).toEqual(expected)
        done()
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
