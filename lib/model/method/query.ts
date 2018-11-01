import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import {always, converge, identity, Omit} from 'ramda'
import {mergeByTypes} from '../../util/index'
import {getLogger} from '../../util/debug'
import {$between, $eq, $ge, $gt, $le, $lt} from '../../engine/expression/comparator'
import {$beginsWith} from '../../engine/expression/function'
import {replacementKeyGenerator, replacementValueGenerator} from '../../engine/expression/helper'
import {TConnector} from '../../engine/expression/type'
import {TScalar} from '../../engine/index'
import {FilterOperator} from '../../engine/operator/filter'

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

  constructor(protected runner, protected operator, protected hashKeyName, protected hashKey: H) {
  }

  protected genKey = replacementKeyGenerator()
  protected genValue = replacementValueGenerator()

  project(expression) {
    console.warn('@todo implement project, any idea?')
    this.merge({
      ProjectionExpression: expression
    })
    return this
  }

  filter(setter) {
    setter(
      FilterOperator.of(this.genKey, this.genValue, (params) => this.merge(params)),
      FilterOperator.of(this.genKey, this.genValue, (params) => this.merge(params, 'OR')),
    )
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
    return this.runner(this.params)
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

  protected merge(target: DxQueryInput, connector: TConnector = 'AND'): void {
    this.params = mergeByTypes(connector, this.params, target)
  }
}
export class CompositeQuery<S, H extends TScalar, R extends TScalar> extends HashQuery<S, H> implements Query<S> {
  range(rangeKeyName: R extends TScalar ? keyof S : never) {
    const genKey = always('#RGK')
    const genValue = always(':RGK')
    const _$eq = $eq('KeyConditionExpression', genKey, genValue, rangeKeyName)
    const _$lt = $lt('KeyConditionExpression', genKey, genValue, rangeKeyName)
    const _$le = $le('KeyConditionExpression', genKey, genValue, rangeKeyName)
    const _$gt = $gt('KeyConditionExpression', genKey, genValue, rangeKeyName)
    const _$ge = $ge('KeyConditionExpression', genKey, genValue, rangeKeyName)
    const _$between = $between('KeyConditionExpression', genKey, this.genValue, rangeKeyName)
    const _$beginsWith = $beginsWith('KeyConditionExpression', genKey, genValue, rangeKeyName)
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
      lt        : converge(withRangeKey, [identity, _$lt]),
      le        : converge(withRangeKey, [identity, _$le]),
      gt        : converge(withRangeKey, [identity, _$gt]),
      ge        : converge(withRangeKey, [identity, _$ge]),
      between   : (a: R, b: R): Query<S> => withRangeKey(null, _$between(a, b)),
      beginsWith: (value: string): Query<S> => withRangeKey(null, _$beginsWith(value))
    }
  }
}

const logger = getLogger(__filename)

interface Query<S, R = DocumentClient.QueryOutput> {
  //  range?(...operators: Operator[]): this
  project(expression: string): this
  filter(func: (and: FilterOperator<S>, or: FilterOperator<S>) => void): this
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

  run(): Promise<R>
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

