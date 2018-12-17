import {ELogs, getLogger} from '../../util/log'
import {Query} from './query'

const log: any = getLogger(ELogs.TEST)

describe('query', function () {
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
})

interface Schema {
  readonly hsk: string
  readonly rgk: number
}
interface StringSchema {
  readonly hsk: string
  readonly rgk: string
}
