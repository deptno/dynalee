import {Operator} from '../operator/operator'
import {getLogger} from '../util/debug'
import {createQuery} from './query'

const logger = getLogger(__filename)

describe('query', function () {
  const tableName = 'dynalee'
  const hashKeyName = 'hello'
  const rangeKeyName = 'world'
  //operator 가 키 이름들을 가지고 있음
  const op = new Operator<Schema['hsk'], Schema['rgk']>(tableName, hashKeyName, rangeKeyName)
  it('should createQuery', async done => {
    const expected = {
      KeyConditionExpression   : '#HSK = :HSK',
      ExpressionAttributeNames : {'#HSK': 'hsk'},
      ExpressionAttributeValues: {':HSK': 'hello'}
    }
    const query = createQuery<Schema, Schema['hsk'], Schema['rgk']>(logger, op, 'hsk', 'hello')
    const actual = await query.compile()
    expect(actual).toEqual(expected)
    done()
  })
  it('should includes pages', async done => {
    const expected = {
      KeyConditionExpression   : '#HSK = :HSK',
      ExpressionAttributeNames : {'#HSK': 'hsk'},
      ExpressionAttributeValues: {':HSK': 'hello'},
      __pages                  : 1
    }
    const query = createQuery<Schema, Schema['hsk'], Schema['rgk']>(logger, op, 'hsk', 'hello')
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
    const query = createQuery<Schema, Schema['hsk'], Schema['rgk']>(logger, op, 'hsk', 'hello')
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
    const query = createQuery<Schema, Schema['hsk'], Schema['rgk']>(logger, op, 'hsk', 'hello')
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
    const query = createQuery<Schema, Schema['hsk'], Schema['rgk']>(logger, op, 'hsk', 'hello', 'rgk')
    const actual = await query
      .compile()
    expect(actual).toEqual(expected)
    done()
  })
  describe('.range', function () {
    it('(value) should includes RangeKey condition in KeyConditionExpression', async done => {
      const expected = {
        KeyConditionExpression   : '#HSK = :HSK AND #RGK = :RGK',
        ExpressionAttributeNames : {'#HSK': 'hsk', '#RGK': 'rgk'},
        ExpressionAttributeValues: {':HSK': 'hello', ':RGK': 5945},
      }
      const query = createQuery<Schema, Schema['hsk'], Schema['rgk']>(logger, op, 'hsk', 'hello', 'rgk')
      const actual = await query
        .range(5945)
        .compile()
      expect(actual).toEqual(expected)
      done()
    })
    describe('.()', function () {
      it('.eq() should includes RangeKey condition in KeyConditionExpression', async done => {
        const expected = {
          KeyConditionExpression   : '#HSK = :HSK AND #RGK = :RGK',
          ExpressionAttributeNames : {'#HSK': 'hsk', '#RGK': 'rgk'},
          ExpressionAttributeValues: {':HSK': 'hello', ':RGK': 5945},
        }
        const query = createQuery<Schema, Schema['hsk'], Schema['rgk']>(logger, op, 'hsk', 'hello', 'rgk')
        const actual = await query
          .range().eq(5945)
          .compile()
        logger(actual)
        expect(actual).toEqual(expected)
        done()
      })
      it('.ne() should includes RangeKey condition in KeyConditionExpression', async done => {
        const expected = {
          KeyConditionExpression   : '#HSK = :HSK AND #RGK <> :RGK',
          ExpressionAttributeNames : {'#HSK': 'hsk', '#RGK': 'rgk'},
          ExpressionAttributeValues: {':HSK': 'hello', ':RGK': 5945},
        }
        const query = createQuery<Schema, Schema['hsk'], Schema['rgk']>(logger, op, 'hsk', 'hello', 'rgk')
        const actual = await query
          .range().ne(5945)
          .compile()
        logger(actual)
        expect(actual).toEqual(expected)
        done()
      })
      it('.lt() should includes RangeKey condition in KeyConditionExpression', async done => {
        const expected = {
          KeyConditionExpression   : '#HSK = :HSK AND #RGK < :RGK',
          ExpressionAttributeNames : {'#HSK': 'hsk', '#RGK': 'rgk'},
          ExpressionAttributeValues: {':HSK': 'hello', ':RGK': 5945},
        }
        const query = createQuery<Schema, Schema['hsk'], Schema['rgk']>(logger, op, 'hsk', 'hello', 'rgk')
        const actual = await query
          .range().lt(5945)
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
        const query = createQuery<Schema, Schema['hsk'], Schema['rgk']>(logger, op, 'hsk', 'hello', 'rgk')
        const actual = await query
          .range().le(5945)
          .compile()
        logger(actual)
        expect(actual).toEqual(expected)
        done()
      })
      it('.gt() should includes RangeKey condition in KeyConditionExpression', async done => {
        const expected = {
          KeyConditionExpression   : '#HSK = :HSK AND #RGK > :RGK',
          ExpressionAttributeNames : {'#HSK': 'hsk', '#RGK': 'rgk'},
          ExpressionAttributeValues: {':HSK': 'hello', ':RGK': 5945},
        }
        const query = createQuery<Schema, Schema['hsk'], Schema['rgk']>(logger, op, 'hsk', 'hello', 'rgk')
        const actual = await query
          .range().gt(5945)
          .compile()
        logger(actual)
        expect(actual).toEqual(expected)
        done()
      })
      it('.ge() should includes RangeKey condition in KeyConditionExpression', async done => {
        const expected = {
          KeyConditionExpression   : '#HSK = :HSK AND #RGK >= :RGK',
          ExpressionAttributeNames : {'#HSK': 'hsk', '#RGK': 'rgk'},
          ExpressionAttributeValues: {':HSK': 'hello', ':RGK': 5945},
        }
        const query = createQuery<Schema, Schema['hsk'], Schema['rgk']>(logger, op, 'hsk', 'hello', 'rgk')
        const actual = await query
          .range().ge(5945)
          .compile()
        logger(actual)
        expect(actual).toEqual(expected)
        done()
      })
      it('.beetween() should includes RangeKey condition in KeyConditionExpression', async done => {
        const expected = {
          KeyConditionExpression   : '#HSK = :HSK AND #RGK BETWEEN (:a, :b)',
          ExpressionAttributeNames : {'#HSK': 'hsk', '#RGK': 'rgk'},
          ExpressionAttributeValues: {':HSK': 'hello', ':a': 5944, ':b': 5946},
        }
        const query = createQuery<Schema, Schema['hsk'], Schema['rgk']>(logger, op, 'hsk', 'hello', 'rgk')
        const actual = await query
          .range().between(5944, 5946)
          .compile()
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
