import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import {Omit} from 'ramda'
import {replacementKeyGenerator, replacementValueGenerator} from '../../engine/expression/helper'
import {TConnector} from '../../engine/expression/type'
import {TScalar} from '../../engine'
import {FilterOperator} from '../../engine/operator/filter'
import {getLogger} from '../../util/debug'
import {mergeByTypes} from '../../util'
import R from 'ramda'

export class Scan<S, H extends TScalar> {
  params = {
  } as DxScanInput

  constructor(protected runner, protected operator, protected hashKeyName) {
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

  out() {
    return R.pick(['Key'], this.params)
  }

  from(params: DxPreScanInput) {
    this.params = R.pick(['Key'], params)
    return this
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

  protected merge(target: DxScanInput, connector: TConnector = 'AND'): void {
    this.params = mergeByTypes(connector, this.params, target)
  }
}

const logger = getLogger(__filename)

type DxScanInput = Omit<DocumentClient.ScanInput, 'TableName'>
type DxPreScanInput = Omit<DxScanInput, 'Key'>
