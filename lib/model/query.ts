import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import {Omit, always, cond, is, mergeWith, T, converge, identity, omit} from 'ramda'
import {$between, $eq, $ge, $gt, $le, $lt, $ne} from '../operator/expression/comparison-operator'
import {beginsWith} from '../operator/expression/comparison-function'
import {replacementIdGenerator} from '../operator/expression/helper'
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

  protected generator = replacementIdGenerator()

  project(...operators) {
    console.warn('@todo implement project')
    return this
  }

  filter(setter: (operator) => {}) {
    /**
     * @todo remove RGK only
     */
    setter({
      eq: $eq(this.generator),
      ne: $ne(this.generator),
      lt: $lt(this.generator),
      le: $le(this.generator),
      gt: $gt(this.generator),
      ge: $ge(this.generator)
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
export class CompositeQuery<S, H extends TScalar, R extends TScalar> extends HashQuery<S, H> implements Query<S> {
  range(rangeKeyName: R extends TScalar ? keyof S : never) {
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
      ge        : converge(withRangeKey, [identity, _$ge]) as (value: R) => Query<S>,
      between   : (a: R, b: R): Query<S> => withRangeKey(null, $between(this.generator, a, b)),
      beginsWith: (value: string): Query<S> => withRangeKey(null, _beginsWith(value))
    }
  }
}

const rangeKeyReplacer = always(':RGK')
const _$eq = $eq(rangeKeyReplacer)
const _$ne = $ne(rangeKeyReplacer)
const _$lt = $lt(rangeKeyReplacer)
const _$le = $le(rangeKeyReplacer)
const _$gt = $gt(rangeKeyReplacer)
const _$ge = $ge(rangeKeyReplacer)
const _beginsWith = beginsWith(rangeKeyReplacer)

const logger = getLogger(__filename)

interface Query<S> {
  //  range?(...operators: Operator[]): this
  project(...operators: Operator[]): this
  filter(operators: (operator: Operator) => any): this
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
type Operator = {
  eq(value): any
  ne(value): any
  lt(value): any
  le(value): any
  gt(value): any
  ge(value): any
}
