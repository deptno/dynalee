import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import debug from 'debug'
import R, {Omit} from 'ramda'
import {TScalar} from '../../engine'
import {$between, $eq, $ge, $gt, $le, $lt} from '../../engine/expression/comparator'
import {$beginsWith} from '../../engine/expression/function'
import {Read, Runner} from './internal/read'

const log = debug(['dynalee', __filename].join(':'))

export class Query<S, H extends TScalar, RKey extends TScalar = never> extends Read<S, H, DxQueryInput> {
  constructor(runner: Runner<S, H>, protected hashKeyName, protected hashKey: H) {
    super(runner)
    this.params = {
      KeyConditionExpression   : `#HSK = :HSK`,
      ExpressionAttributeNames : {
        '#HSK': this.hashKeyName,
      },
      ExpressionAttributeValues: {
        ':HSK': this.hashKey
      }
    }
  }

  desc() {
    return this.merge({ScanIndexForward: false})
  }

  range(rangeKeyName: keyof S)
    : RKey extends number
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
    const withRangeKey = (rangeKey: RKey | null, params): Omit<Query<S, H, RKey>, 'range'> => {
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
}

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
type DxQueryInput = Omit<DocumentClient.QueryInput, 'TableName' | 'Key'>
