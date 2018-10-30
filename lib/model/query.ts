import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import {$between, $eq, $ge, $gt, $le, $lt, $ne} from '../operator/expression/comparison-operator'
import {mergeOp, replacementIdGenerator} from '../operator/expression/helper'
import {TScalar} from '../operator/operator'
import {getLogger} from '../util/debug'
import {Omit, always, join, head, tap, omit, mergeWith, cond, is, T, concat} from 'ramda'

type DxQueryInput = Omit<DocumentClient.QueryInput, 'TableName'> & {
  __pages?: number
}

class HashQuery<S> implements Query<S> {
  params: DxQueryInput = {
    KeyConditionExpression   : `#HSK = :HSK`,
    ExpressionAttributeNames : {
      '#HSK': this.hashKeyName,
    },
    ExpressionAttributeValues: {
      ':HSK': this.hashKey
    }
  } as DxQueryInput
  protected replacementIdGenerator = replacementIdGenerator()

  constructor(private runner, private operator, private hashKeyName, private hashKey) {
  }

  project(...operators) {
    return this
  }

  filter(...operators) {
    return this
  }

  limit(limit: number) {
    return this
  }

  desc() {
    this.merge({
      ScanIndexForward: true
    })
    return this
  }

  consistent() {
    this.merge({
      ConsistentRead: true
    })
    return this
  }

  startAt() {
    console.warn('@todo implement startAt')
    return this
  }

  pages(pages, delay = 1000) {
    this.merge({
      __pages: pages
    })
    return this
  }

  /**
   * @todo low priority. not implement yet.
   * @deprecated
   */
  precompiled(precompiled: Precompiled) {
    return this
  }

  compile() {
    return this.params
  }

  async run() {
    return this.runner(this.params)
  }

  protected merge(target: DxQueryInput): void {
    this.params = mergeWith(
      cond([
        [is(String), (l, r) => `${r} AND ${l}`],
        [T, Object.assign],
      ]),
      target,
      this.params
    )
  }
}
class CompositeQuery<S, R extends TScalar> extends HashQuery<S> implements Query<S> {
  constructor(runner, operator, hashKeyName, hashKey, private rangeKeyName) {
    super(runner, operator, hashKeyName, hashKey)
  }

  range()
  range(value: R): this
  range(value?: R) {
    const withRangeKey = (rangeKey: R | null, params) => {
      this.merge(params)
      if (rangeKey !== null) {
        this.merge({
          ExpressionAttributeValues: {
            ':RGK': rangeKey
          }
        })
      }
      this.merge({
        ExpressionAttributeNames: {
          '#RGK': this.rangeKeyName,
        },
      })
      return this
    }
    const rangeKeyReplacer = always(':RGK')
    const operators = {
      eq     : (value: R) => {
        return withRangeKey(value, $eq(value)(rangeKeyReplacer))
      },
      ne     : (value: R) => {
        return withRangeKey(value, $ne(value)(rangeKeyReplacer))
      },
      lt     : (value: R) => {
        return withRangeKey(value, $lt(value)(rangeKeyReplacer))
      },
      le     : (value: R) => {
        return withRangeKey(value, $le(value)(rangeKeyReplacer))
      },
      gt     : (value: R) => {
        return withRangeKey(value, $gt(value)(rangeKeyReplacer))
      },
      ge     : (value: R) => {
        return withRangeKey(value, $ge(value)(rangeKeyReplacer))
      },
      between: (a: R, b: R) => {
        return withRangeKey(null, $between(a, b)(this.replacementIdGenerator))
      }
    }
    if (value !== undefined) {
      return operators.eq(value)
    }
    return operators
  }
}

export function createQuery<S, H extends TScalar, R extends TScalar>(runner, operator, hashKeyName: string, hashKey: H): HashQuery<S>
export function createQuery<S, H extends TScalar, R extends TScalar>(runner, operator, hashKeyName: string, hashKey: H, rangeKeyName: string): CompositeQuery<S, R>
export function createQuery(runner, operator, hashKeyName, hashKey, rangeKeyName?) {
  if (rangeKeyName) {
    return new CompositeQuery(runner, operator, hashKeyName, hashKey, rangeKeyName)
  }
  return new HashQuery(runner, operator, hashKeyName, hashKey)
}
const logger = getLogger(__filename)

interface Query<S> {
  //  range?(...operators: Operator[]): this
  project(...operators: Operator[]): this
  filter(...operators: Operator[]): this
  limit(limit: number): this
  desc(): this
  consistent(): this
  startAt(): this
  pages(pages: number, delay: number): this
  precompiled(precompiled: Precompiled): this

  run(): any
  compile(): Precompiled

}

type Precompiled = DxQueryInput // subset
type Operator = any
