import {ELogs, getLogger} from '../../util/log'
import {Update} from './update'

const log: any = getLogger(ELogs.TEST)

describe('update', function () {
  it('set', () => {
    const sets = [
      {
        args    : ['hello', 'world'],
        expected: {
          UpdateExpression         : 'SET #a = :a',
          ExpressionAttributeNames : {'#a': 'hello'},
          ExpressionAttributeValues: {':a': 'world'},
          ReturnValues             : 'ALL_NEW'
        }
      }
    ]

    for (const {args, expected} of sets) {
      const update = new Update<Schema>(log)
      const actual = update
        .update(op => op.set.apply(op, args))
        .out()
      expect(actual).toEqual(expected)
    }
  })
  it('plus', () => {
    const sets = [
      {
        args    : ['propA', 3],
        expected: {
          UpdateExpression         : 'SET #a = #a + :a',
          ExpressionAttributeNames : {
            '#a': 'propA',
          },
          ExpressionAttributeValues: {':a': 3},
          ReturnValues             : 'ALL_NEW'
        }
      },
      {
        args    : ['propA', 'propB', 3],
        expected: {
          UpdateExpression         : 'SET #a = #b + :a',
          ExpressionAttributeNames : {
            '#a': 'propA',
            '#b': 'propB'
          },
          ExpressionAttributeValues: {':a': 3},
          ReturnValues             : 'ALL_NEW'
        }
      },
      {
        args    : ['propA', 'propB', 'propC'],
        expected: {
          UpdateExpression        : 'SET #a = #b + #c',
          ExpressionAttributeNames: {
            '#a': 'propA',
            '#b': 'propB',
            '#c': 'propC'
          },
          ReturnValues            : 'ALL_NEW'
        }
      },
    ]

    for (const {args, expected} of sets) {
      const update = new Update<Schema>(log)
      const actual = update
        .update(op => op.plus.apply(op, args))
        .out()
      expect(actual).toEqual(expected)
    }
  })

  it('minus', () => {
    const sets = [
      {
        args    : ['propA', 3],
        expected: {
          UpdateExpression         : 'SET #a = #a - :a',
          ExpressionAttributeNames : {
            '#a': 'propA',
          },
          ExpressionAttributeValues: {':a': 3},
          ReturnValues             : 'ALL_NEW',
        }
      },
      {
        args    : ['propA', 'propB', 3],
        expected: {
          UpdateExpression         : 'SET #a = #b - :a',
          ExpressionAttributeNames : {
            '#a': 'propA',
            '#b': 'propB'
          },
          ExpressionAttributeValues: {':a': 3},
          ReturnValues             : 'ALL_NEW'
        }
      },
      {
        args    : ['propA', 'propB', 'propC'],
        expected: {
          UpdateExpression        : 'SET #a = #b - #c',
          ExpressionAttributeNames: {
            '#a': 'propA',
            '#b': 'propB',
            '#c': 'propC'
          },
          ReturnValues            : 'ALL_NEW'
        }
      },
    ]

    for (const {args, expected} of sets) {
      const update = new Update<Schema>(log)
      const actual = update
        .update(op => op.minus.apply(op, args))
        .out()
      expect(actual).toEqual(expected)
    }
  })

  xit('append', () => {
    const sets = [
      {
        args    : ['propA', new Set(['a', 'b'])],
        expected: {
          UpdateExpression         : 'SET #a = list_append(#a, :a)',
          ExpressionAttributeNames : {
            '#a': 'propA',
          },
          ExpressionAttributeValues: {':a': 3},
          ReturnValues             : 'ALL_NEW'
        }
      },
    ]

    for (const {args, expected} of sets) {
      const update = new Update<Schema>(log)
      const actual = update
        .update(op => op.append.apply(op, args))
        .out()
      expect(actual).toEqual(expected)
    }
  })

  it('remove', () => {
    const sets = [
      {
        args    : ['propA', 'propB', 'propC'],
        expected: {
          UpdateExpression        : 'REMOVE #a, #b, #c',
          ExpressionAttributeNames: {
            '#a': 'propA',
            '#b': 'propB',
            '#c': 'propC',
          },
          ReturnValues            : 'ALL_NEW'
        }
      },
    ]

    for (const {args, expected} of sets) {
      const update = new Update<Schema>(log)
      const actual = update
        .update(op => op.remove.apply(op, args))
        .out()
      expect(actual).toEqual(expected)
    }
  })

  xit('delete', () => {
    /**
     * @todo
     */
  })
})

interface Schema {
  readonly hsk: string
  readonly rgk: number
  hello: string
  hi: number
}
interface StringSchema {
  readonly hsk: string
  readonly rgk: string
}
