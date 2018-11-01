import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import R, {Omit} from 'ramda'
import {$between, $eq, $ge, $gt, $le, $lt} from '../../engine/expression/comparator'
import {$beginsWith} from '../../engine/expression/function'
import {replacementKeyGenerator, replacementValueGenerator} from '../../engine/expression/helper'
import {TConnector} from '../../engine/expression/type'
import {TScalar} from '../../engine'
import {FilterOperator} from '../../engine/operator/filter'
import {getLogger} from '../../util/debug'
import {mergeByTypes} from '../../util'

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
  from(params) {
    this.params = R.pick(['Key'], params)
    return this
  }

  out() {
    return R.pick(['Key'], this.params)
  }

  run() {
    return this.runner(this.params)
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
export class CompositeQuery<S, H extends TScalar, R> extends HashQuery<S, H> implements Query<S> {
  range(rangeKeyName: keyof S): R extends number
  ? RangeKeyNumberConditionOperator<S, R>
  : RangeKeyConditionOperator<S, R> {
    const genKey = R.always('#RGK')
    const genValue = R.always(':RGK')
    const _$eq = $eq('KeyConditionExpression', genKey, genValue, rangeKeyName)
    const _$lt = $lt('KeyConditionExpression', genKey, genValue, rangeKeyName)
    const _$le = $le('KeyConditionExpression', genKey, genValue, rangeKeyName)
    const _$gt = $gt('KeyConditionExpression', genKey, genValue, rangeKeyName)
    const _$ge = $ge('KeyConditionExpression', genKey, genValue, rangeKeyName)
    const _$between = $between('KeyConditionExpression', genKey, this.genValue, rangeKeyName)
    const _$beginsWith = $beginsWith('KeyConditionExpression', genKey, genValue, rangeKeyName)
    const withRangeKey = (rangeKey: R | null, params): Query<S> => {
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
      between   : (a: R, b: R) => withRangeKey(null, _$between(a, b)),
      beginsWith: (value: string) => withRangeKey(null, _$beginsWith(value))
    } as any
  }
}
const logger = getLogger(__filename)

interface Query<S> {
  //  range?(...operators: Operator[]): this
  project(expression: string): this
  filter(func: (and: FilterOperator<S>, or: FilterOperator<S>) => void): this
  limit(limit: number): this
  desc(): this
  consistent(): this
  startAt(lastEvaluatedKey): this

  run(): Promise<DocumentClient.QueryOutput>
  from(precompiled: DxQueryInput): this
  out(): DxQueryInput
}
interface RangeKeyCondition<S, R = never> {
  (a: R): Query<S>,
}
interface RangeKeyConditionOperator<S, R> {
  eq: RangeKeyCondition<S, R>
  lt: RangeKeyCondition<S, R>
  le: RangeKeyCondition<S, R>
  gt: RangeKeyCondition<S, R>
  ge: RangeKeyCondition<S, R>
  between: (a: R, b: R) => Query<S>
  beginsWith: RangeKeyCondition<S, R>
}
type RangeKeyNumberConditionOperator<S, R> = Omit<RangeKeyConditionOperator<S, R>, 'beginsWith'>

type DxQueryInput = Omit<DocumentClient.QueryInput, 'TableName'>
