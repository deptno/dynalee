import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import R, {Omit} from 'ramda'
import {TScalar} from '../../engine'
import {$between, $eq, $ge, $gt, $le, $lt} from '../../engine/expression/comparator'
import {$beginsWith} from '../../engine/expression/function'
import {replacementKeyGenerator, replacementValueGenerator} from '../../engine/expression/helper'
import {TConnector} from '../../engine/expression/type'
import {FilterOperator} from '../../engine/operator/filter'
import {mergeByTypes} from '../../util'
import debug from 'debug'
import {Document} from '../document'

export class Query<S, H extends TScalar, RKey extends TScalar> {
  params = {
    KeyConditionExpression   : `#HSK = :HSK`,
    ExpressionAttributeNames : {
      '#HSK': this.hashKeyName,
    },
    ExpressionAttributeValues: {
      ':HSK': this.hashKey
    }
  } as DxQueryInput
  constructor(
    protected runner: (params: DxQueryInput) => Document<S, H>[],
    protected hashKeyName,
    protected hashKey: H) {
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
  from(params) {
    this.params = R.pick(['Key'], params)
    return this
  }

  out() {
    return R.omit(['Key'], this.params)
  }

//  run(): Document<S, H>[] {
//    return this.runner(this.params)
//  }

  observer(observer: (observer) => void) {

  }

//  next(lastEvaluatedKey) {
//    return this
//      .startAt(lastEvaluatedKey)
//      .run()
//  }

  protected merge(target: DxQueryInput, connector: TConnector = 'AND'): void {
    this.params = mergeByTypes(connector, this.params, target)
  }

  range(rangeKeyName: keyof S): RKey extends number
  ? RangeKeyNumberConditionOperator<S, H, RKey>
  : RangeKeyConditionOperator<S, H, RKey> {
    const genKey = R.always('#RGK')
    const genValue = R.always(':RGK')
    const _$eq = $eq('KeyConditionExpression', genKey, genValue, rangeKeyName)
    const _$lt = $lt('KeyConditionExpression', genKey, genValue, rangeKeyName)
    const _$le = $le('KeyConditionExpression', genKey, genValue, rangeKeyName)
    const _$gt = $gt('KeyConditionExpression', genKey, genValue, rangeKeyName)
    const _$ge = $ge('KeyConditionExpression', genKey, genValue, rangeKeyName)
    const _$between = $between('KeyConditionExpression', genKey, this.genValue, rangeKeyName)
    const _$beginsWith = $beginsWith('KeyConditionExpression', genKey, genValue, rangeKeyName)
    const withRangeKey = (rangeKey: RKey | null, params): Omit<Query<S, H, RKey>, 'range'>=> {
      this.merge(params)
      this.merge({ExpressionAttributeNames: {'#RGK': rangeKeyName as string}})
      if (rangeKey !== null) {
        this.merge({ExpressionAttributeValues: {':RGK': rangeKey}})
      }
      return this
    }

    return {
      eq        : R.converge(withRangeKey, [R.identity, _$eq]),
      lt        : R.converge(withRangeKey, [R.identity, _$lt]),
      le        : R.converge(withRangeKey, [R.identity, _$le]),
      gt        : R.converge(withRangeKey, [R.identity, _$gt]),
      ge        : R.converge(withRangeKey, [R.identity, _$ge]),
      between   : (a: RKey, b: RKey) => withRangeKey(null, _$between(a, b)),
      beginsWith: (value: string) => withRangeKey(null, _$beginsWith(value))
    } as any
  }

  run(): Document<S, H, RKey>[] {
    return this.runner(this.params)
  }
}
const logger = debug(['dynalee', __filename].join(':'))
//
//interface Query<S> {
//  //  range?(...operators: Operator[]): this
//  project(expression: string): this
//  filter(func: (and: FilterOperator<S>, or: FilterOperator<S>) => void): this
//  limit(limit: number): this
//  desc(): this
//  consistent(): this
//  startAt(lastEvaluatedKey): this
//
////  run(): Promise<Document<S, >>
//  from(precompiled: DxQueryInput): this
//  out(): DxQueryInput
//}
interface RangeKeyCondition<S, H extends TScalar, R extends TScalar> {
  (a: R): Query<S, H, R>,
}
interface RangeKeyConditionOperator<S, H extends TScalar, R extends TScalar> {
  eq: RangeKeyCondition<S, H, R>
  lt: RangeKeyCondition<S, H, R>
  le: RangeKeyCondition<S, H, R>
  gt: RangeKeyCondition<S, H, R>
  ge: RangeKeyCondition<S, H, R>
  between: (a: R, b: R) => Query<S, H, R>
  beginsWith: RangeKeyCondition<S, H, R>
}
type RangeKeyNumberConditionOperator<S, H extends TScalar, R extends TScalar> = Omit<RangeKeyConditionOperator<S, H, R>, 'beginsWith'>

type DxQueryInput = Omit<DocumentClient.QueryInput, 'TableName'>
