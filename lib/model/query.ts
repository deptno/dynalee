import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import {always, cond, is, mergeWith, Omit, T, converge, identity} from 'ramda'
import {$between, $eq, $ge, $gt, $le, $lt, $ne} from '../operator/expression/comparison-operator'
import {replacementIdGenerator} from '../operator/expression/helper'
import {TScalar} from '../operator/operator'
import {getLogger} from '../util/debug'

type DxQueryInput = Omit<DocumentClient.QueryInput, 'TableName'> & {
  __pages?: number
}

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

  project(...operators) {
    console.warn('@todo implement project')
    return this
  }

  filter(...operators) {
    console.warn('@todo implement filter')
    return this
  }

  limit(limit: number) {
    this.merge({Limit: limit})
    return this
  }

  desc() {
    this.merge({ScanIndexForward: true})
    return this
  }

  consistent() {
    this.merge({ConsistentRead: true})
    return this
  }

  startAt() {
    console.warn('@todo implement startAt')
    return this
  }

  pages(pages, delay = 1000) {
    this.merge({__pages: pages})
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
export class CompositeQuery<S, H extends TScalar, R extends TScalar> extends HashQuery<S, H> implements Query<S> {
  range(rangeKeyName: keyof S) {
    const withRangeKey = (rangeKey: R | null, params) => {
      this.merge(params)
      this.merge({ExpressionAttributeNames: {'#RGK': rangeKeyName as string}})
      if (rangeKey !== null) {
        this.merge({ExpressionAttributeValues: {':RGK': rangeKey}})
      }

      return this
    }

    return {
      eq     : converge(withRangeKey, [identity, _$eq]) as (value: R) => Query<S>,
      ne     : converge(withRangeKey, [identity, _$ne]) as (value: R) => Query<S>,
      lt     : converge(withRangeKey, [identity, _$lt]) as (value: R) => Query<S>,
      le     : converge(withRangeKey, [identity, _$le]) as (value: R) => Query<S>,
      gt     : converge(withRangeKey, [identity, _$gt]) as (value: R) => Query<S>,
      ge     : converge(withRangeKey, [identity, _$ge]) as (value: R) => Query<S>,
      between: (a: R, b: R): Query<S> => withRangeKey(null, $between(replacementIdGenerator(), a, b))
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
