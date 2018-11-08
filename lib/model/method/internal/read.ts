import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import R, {Omit} from 'ramda'
import debug from 'debug'
import {TScalar} from '../../../engine'
import {replacementKeyGenerator, replacementValueGenerator} from '../../../engine/expression/helper'
import {Document} from '../../document'
import {TConnector} from '../../../engine/expression/type'
import {FilterOperator} from '../../../engine/operator/filter'
import {mergeByTypes} from '../../../util'

const logger = debug(['dynalee', __filename].join(':'))

type ScanInput = Omit<DocumentClient.ScanInput, 'TableName' | 'Key'>
type QueryInput = Omit<DocumentClient.QueryInput, 'TableName' | 'Key'>
type Input = ScanInput|QueryInput
type Output = Omit<DocumentClient.ScanOutput | DocumentClient.QueryOutput, 'TableName'>
export type Runner<S, H extends TScalar> = (params: Input) => Promise<Omit<Output, 'Items'> & { Items: Document<S, H>[] }>

export abstract class Read<S, H extends TScalar, I extends Input> {
  protected genKey = replacementKeyGenerator()
  protected genValue = replacementValueGenerator()
  protected params = {} as Input

  protected constructor(protected runner: Runner<S, H>) {

  }

  protected merge(target: Partial<Input>, connector: TConnector = 'AND'): this {
    this.params = mergeByTypes(connector, this.params, target)
    return this
  }

  project(expression: DocumentClient.ProjectionExpression) {
    console.warn('@todo implement project, any idea?')
    return this.merge({
      ProjectionExpression: expression
    })
  }

  filter(setter: (and: FilterOperator<S>, or: FilterOperator<S>) => void) {
    setter(
      FilterOperator.of(this.genKey, this.genValue, (params) => this.merge(params)),
      FilterOperator.of(this.genKey, this.genValue, (params) => this.merge(params, 'OR')),
    )
    return this
  }

  limit(limit: number) {
    return this.merge({Limit: limit})
  }

  consistent() {
    return this.merge({ConsistentRead: true})
  }

  startAt(lastEvaluatedKey: Partial<S>) {
    // @todo LastEvaluatedKey
    return this.merge({
      ExclusiveStartKey: lastEvaluatedKey
    })
  }

  /**
   * @todo low priority. not implement yet.
   * @deprecated
   */
  from(params: Partial<Input>) {
    this.params = R.pick(['Key'], params) as Input
    return this
  }

  out(): Input {
    return R.omit(['Key'], this.params)
  }

  run(): Promise<Omit<Output, 'Items'> & { Items: Document<S, H>[] }> {
    logger('run', this.params)
    return this.runner(this.params)
  }
}