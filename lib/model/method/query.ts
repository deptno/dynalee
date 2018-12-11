import * as R from 'ramda'
import {Omit} from 'ramda'
import {$between, $eq, $ge, $gt, $le, $lt} from '../../engine/expression/comparator'
import {$beginsWith} from '../../engine/expression/function'
import {ELogs, getLogger} from '../../util/log'
import {Runner} from './internal/printable'
import {Read} from './internal/read'

const log = getLogger(ELogs.MODEL_METHOD_QUERY)

export class Query<S, HK extends keyof S> extends Read<S> {
  constructor(runner: Runner<S>, protected hashKey: HK, protected hash: S[HK]) {
    super(runner)
    this.params = {
      KeyConditionExpression   : `#HSK = :HSK`,
      ExpressionAttributeNames : {
        '#HSK': this.hashKey,
      },
      ExpressionAttributeValues: {
        ':HSK': this.hash
      }
    }
  }

  desc() {
    return this.merge({ScanIndexForward: false})
  }

  range<RK extends keyof S, RKT = S[RK]>(rangeKey: RK): RangeKeyOperator<S, HK> {
    const genKey = R.always('#RGK')
    const genValue = R.always(':RGK')
    const _$eq = $eq('KeyConditionExpression', genKey, genValue, rangeKey)
    const _$lt = $lt('KeyConditionExpression', genKey, genValue, rangeKey)
    const _$le = $le('KeyConditionExpression', genKey, genValue, rangeKey)
    const _$gt = $gt('KeyConditionExpression', genKey, genValue, rangeKey)
    const _$ge = $ge('KeyConditionExpression', genKey, genValue, rangeKey)
    const _$between = $between('KeyConditionExpression', genKey, this.genValue, rangeKey)
    const _$beginsWith = $beginsWith('KeyConditionExpression', genKey, genValue, rangeKey)
    const withRangeKey = (range: RKT | null, params): Omit<Query<S, HK>, 'range'> => {
      this.merge(params)
      this.merge({ExpressionAttributeNames: {'#RGK': rangeKey}})
      if (range !== null) {
        this.merge({ExpressionAttributeValues: {':RGK': range}})
      }
      return this
    }

    return {
      eq        : R.converge(withRangeKey, [R.identity, _$eq]),
      lt        : R.converge(withRangeKey, [R.identity, _$lt]),
      le        : R.converge(withRangeKey, [R.identity, _$le]),
      gt        : R.converge(withRangeKey, [R.identity, _$gt]),
      ge        : R.converge(withRangeKey, [R.identity, _$ge]),
      between   : (a, b) => withRangeKey(null, _$between(a, b)),
      beginsWith: (value) => withRangeKey(null, _$beginsWith(value))
    }
  }
}

interface RangeKeyOperator<S, HK extends keyof S, HKT = S[HK], RangedQuery = Omit<Query<S, HK>, 'range'>> {
  eq(a: HKT): RangedQuery
  lt(a: HKT): RangedQuery
  le(a: HKT): RangedQuery
  gt(a: HKT): RangedQuery
  ge(a: HKT): RangedQuery
  between(a: HKT, b: HKT): RangedQuery
  beginsWith(a: string): RangedQuery
}
