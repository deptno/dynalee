import * as R from 'ramda'
import {Omit} from 'ramda'
import {$between, $eq, $ge, $gt, $le, $lt} from '../../engine/expression/comparator'
import {$beginsWith} from '../../engine/expression/function'
import {ELogs, getLogger} from '../../util/log'
import {Runner} from './internal/printable'
import {Query} from './query'

const log = getLogger(ELogs.MODEL_METHOD_QUERY)

export class RangeQuery<S, HK extends keyof S, RK extends keyof S> extends Query<S, HK> {
  constructor(
    runner: Runner<S>,
    protected hashKey: HK,
    protected hashVal: S[HK],
    private rangeKey: RK,
  ) {
    super(runner, hashKey, hashVal)
  }

  private withRangeKey(range: S[RK] | null, params): Omit<Query<S, HK>, 'range'> {
    this.merge(params)
    this.merge({ExpressionAttributeNames: {'#RGK': this.rangeKey}})
    if (range !== null) {
      this.merge({ExpressionAttributeValues: {':RGK': range}})
    }
    return this
  }

  /**
   * =
   * @param {S[RK]} range
   * @returns {R.Omit<Query<S, HK>, "range">}
   */
  eq(range: S[RK]) {
    return this.withRangeKey(range, _$eq(this.rangeKey, range))
  }

  /**
   * <
   * @param {S[RK]} range
   * @returns {R.Omit<Query<S, HK>, "range">}
   */
  lt(range: S[RK]) {
    return this.withRangeKey(range, _$lt(this.rangeKey, range))
  }

  /**
   * <=
   * @param {S[RK]} range
   * @returns {R.Omit<Query<S, HK>, "range">}
   */
  le(range: S[RK]) {
    return this.withRangeKey(range, _$le(this.rangeKey, range))
  }

  /**
   * >
   * @param {S[RK]} range
   * @returns {R.Omit<Query<S, HK>, "range">}
   */
  gt(range: S[RK]) {
    return this.withRangeKey(range, _$gt(this.rangeKey, range))
  }

  /**
   * >=
   * @param {S[RK]} range
   * @returns {R.Omit<Query<S, HK>, "range">}
   */
  ge(range: S[RK]) {
    return this.withRangeKey(range, _$ge(this.rangeKey, range))
  }

  /**
   * a ~ b
   * @param {S[RK]} a
   * @param {S[RK]} b
   * @returns {R.Omit<Query<S, HK>, "range">}
   */
  between(a: S[RK], b: S[RK]) {
    return this.withRangeKey(null, _$between(this.genValue, this.rangeKey, a, b))
  }

  /**
   * startsWith
   * @param {Extract<S[RK], string>} range
   * @returns {R.Omit<Query<S, HK>, "range">}
   */
  beginsWith(range: Extract<S[RK], string>) {
    return this.withRangeKey(null, _$beginsWith(this.rangeKey, range))
  }
}

const genKey = R.always('#RGK')
const genValue = R.always(':RGK')
const _$eq = $eq('KeyConditionExpression', genKey, genValue)
const _$lt = $lt('KeyConditionExpression', genKey, genValue)
const _$le = $le('KeyConditionExpression', genKey, genValue)
const _$gt = $gt('KeyConditionExpression', genKey, genValue)
const _$ge = $ge('KeyConditionExpression', genKey, genValue)
const _$between = $between('KeyConditionExpression', genKey)
const _$beginsWith = $beginsWith('KeyConditionExpression', genKey, genValue)

interface RangeKeyOperator<S, HK extends keyof S, HKT = S[HK], RangedQuery = Omit<Query<S, HK>, 'range'>> {
  eq(a: HKT): RangedQuery
  lt(a: HKT): RangedQuery
  le(a: HKT): RangedQuery
  gt(a: HKT): RangedQuery
  ge(a: HKT): RangedQuery
  between(a: HKT, b: HKT): RangedQuery
  beginsWith(a: string): RangedQuery
}
