import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import {Omit, compose, always, cond, is, mergeWith, T, converge, identity, omit, flip, bind} from 'ramda'
import {$between, $eq, $ge, $gt, $le, $lt, $ne} from '../operator/expression/comparison-operator'
import {beginsWith} from '../operator/expression/comparison-function'
import {replacementKeyGenerator, replacementValueGenerator} from '../operator/expression/helper'
import {TScalar} from '../operator/operator'
import {getLogger} from '../util/debug'

export class HashQuery<S, H extends TScalar> implements Query<S> {
  params = {
    KeyConditionExpression   : `#HSK = :HSK`,
    ExpressionAttributeNames : {
      '#HSK': this.hashKeyName,
    },
    ExpressionAttributeValues: {
      ':HSK': this.hashKey
    }
  } as DxQueryInput

  constructor(private runner, private operator, private hashKeyName, private hashKey: H) {
  }

  protected genKey = replacementKeyGenerator()
  protected genValue = replacementValueGenerator()

  project(expression) {
    console.warn('@todo implement project')
    console.warn('@todo any idea?')
    this.merge({
      ProjectionExpression: expression
    })
    return this
  }

  filter(setter) {
    /**
     * @todo remove RGK only
     */
    const mergeAnd = (params) => {
      this.merge(params)
      return this
    }
    const mergeOr = (params) => {
      this.merge(params, 'OR')
      return this
    }
    setter({
      eq: compose(mergeAnd, $eq('FilterExpression', this.genKey, this.genValue)),
      ne: compose(mergeAnd, $ne('FilterExpression', this.genKey, this.genValue)),
      lt: compose(mergeAnd, $lt('FilterExpression', this.genKey, this.genValue)),
      le: compose(mergeAnd, $le('FilterExpression', this.genKey, this.genValue)),
      gt: compose(mergeAnd, $gt('FilterExpression', this.genKey, this.genValue)),
      ge: compose(mergeAnd, $ge('FilterExpression', this.genKey, this.genValue))
    }, {
      eq: compose(mergeOr, $eq('FilterExpression', this.genKey, this.genValue)),
      ne: compose(mergeOr, $ne('FilterExpression', this.genKey, this.genValue)),
      lt: compose(mergeOr, $lt('FilterExpression', this.genKey, this.genValue)),
      le: compose(mergeOr, $le('FilterExpression', this.genKey, this.genValue)),
      gt: compose(mergeOr, $gt('FilterExpression', this.genKey, this.genValue)),
      ge: compose(mergeOr, $ge('FilterExpression', this.genKey, this.genValue))
    })
    console.warn('@todo implement filter')
    return this
  }

  limit(limit: number) {
    this.merge({Limit: limit})
    return this
  }

  desc() {
    this.merge({ScanIndexForward: false})
    return this
  }

  consistent() {
    this.merge({ConsistentRead: true})
    return this
  }

  startAt(lastEvaluatedKey: Partial<S>) {
    // @todo LastEvaluatedKey
    this.merge({
      ExclusiveStartKey: lastEvaluatedKey
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

  run() {
    this.runner(this.params)
    return this
  }

  return() {

  }

  observer(observer: (observer) => void) {

  }

  next(lastEvaluatedKey) {
    return this
      .startAt(lastEvaluatedKey)
      .run()
  }

  protected merge(target: DxQueryInput, connector: 'AND'|'OR' = 'AND'): void {
    this.params = mergeWith(
      cond([
        [is(String), (l, r) => `${r} ${connector} ${l}`],
        [T, Object.assign],
      ]),
      target,
      this.params
    )
  }
}
export class CompositeQuery<S, H extends TScalar, R extends TScalar> extends HashQuery<S, H> implements Query<S> {
  range(rangeKeyName: R extends TScalar ? keyof S : never) {
    const genKey = always('#RGK')
    const genValue = always(':RGK')
    const _$eq = $eq('KeyConditionExpression', genKey, genValue, rangeKeyName)
    const _$ne = $ne('KeyConditionExpression', genKey, genValue, rangeKeyName)
    const _$lt = $lt('KeyConditionExpression', genKey, genValue, rangeKeyName)
    const _$le = $le('KeyConditionExpression', genKey, genValue, rangeKeyName)
    const _$gt = $gt('KeyConditionExpression', genKey, genValue, rangeKeyName)
    const _$ge = $ge('KeyConditionExpression', genKey, genValue, rangeKeyName)
    const _beginsWith = beginsWith(genValue)
    const withRangeKey = (rangeKey: R | null, params) => {
      this.merge(params)
      this.merge({ExpressionAttributeNames: {'#RGK': rangeKeyName as string}})
      if (rangeKey !== null) {
        this.merge({ExpressionAttributeValues: {':RGK': rangeKey}})
      }
      return this
    }
    return {
      eq        : converge(withRangeKey, [identity, _$eq]) as (value: R) => Query<S>,
      ne        : converge(withRangeKey, [identity, _$ne]) as (value: R) => Query<S>,
      lt        : converge(withRangeKey, [identity, _$lt]) as (value: R) => Query<S>,
      le        : converge(withRangeKey, [identity, _$le]) as (value: R) => Query<S>,
      gt        : converge(withRangeKey, [identity, _$gt]) as (value: R) => Query<S>,
      ge        : converge(withRangeKey, [identity, _$ge]),
      between   : (a: R, b: R): Query<S> => withRangeKey(null, $between(genKey, this.genValue, a, b)),
      beginsWith: (value: string): Query<S> => withRangeKey(null, _beginsWith(value))
    }
  }
}

const logger = getLogger(__filename)

interface Query<S> {
  //  range?(...operators: Operator[]): this
  project(expression: string): this
  filter(func: (and: Operator<S>, or: Operator<S>) => void): this
  limit(limit: number): this
  desc(): this
  consistent(): this
  startAt(lastEvaluatedKey): this
  /**
   * iterate query
   * @param {number} pages, greater than 0
   * @param {number} delay ms
   * @returns {this}
   */
  precompiled(precompiled: Precompiled): this

  run(): any
  compile(): Precompiled
}
type DynaleeInput = {
  __page?: {
    pages: number
    delay: number
  }
}
type DxQueryInput = Omit<DocumentClient.QueryInput, 'TableName'> & DynaleeInput
type Precompiled = DxQueryInput // subset
/**
 * @todo T = S[K] and path
 */
type Operator<S, K = keyof S, T = TScalar> = {
  eq(property: K, value: T): any
  ne(property: K, value: T): any
  lt(property: K, value: T): any
  le(property: K, value: T): any
  gt(property: K, value: T): any
  ge(property: K, value: T): any
  between
  in
  attribute_exists
  attribute_not_exists
  attribute_type
  begins_with
  contains
  size
}
