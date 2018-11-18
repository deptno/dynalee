import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import debug from 'debug'
import R, {Omit} from 'ramda'
import {TScalar} from '../../../engine'
import {replacementKeyGenerator, replacementValueGenerator} from '../../../engine/expression/helper'
import {TConnector} from '../../../engine/expression/type'
import {mergeByTypes} from '../../../util'
import {Document} from '../../document'

const log = debug(['dynalee', __filename].join(':'))

type ScanInput = Omit<DocumentClient.ScanInput, 'TableName' | 'Key'>
type QueryInput = Omit<DocumentClient.QueryInput, 'TableName' | 'Key'>
type UpdateItemInput = Omit<DocumentClient.UpdateItemInput, 'TableName' | 'Key'>
type Input = ScanInput | QueryInput | UpdateItemInput
type Output = Omit<DocumentClient.ScanOutput | DocumentClient.QueryOutput | DocumentClient.UpdateItemOutput, 'TableName'>

export type Runner<S, H extends TScalar> = (params: Input) => Promise<Omit<Output, 'Items'> & { Items: Document<S, H>[] }>
export abstract class Printable<S, H extends TScalar, I extends Input> {
  protected genKey = replacementKeyGenerator()
  protected genValue = replacementValueGenerator()
  protected params = {} as Input

  protected constructor(protected runner: Runner<S, H>) {

  }

  protected merge(target: Partial<I>, connector: TConnector = 'AND'): this {
    this.params = mergeByTypes(connector, this.params, target)
    return this
  }

  /**
   * @todo low priority. not implement yet.
   * @deprecated
   */
  from(params: Partial<I>) {
    this.params = R.omit(['Key'], params) as Omit<I, 'Key'>
    return this
  }

  out() {
    return R.omit(['Key'], this.params)
  }

  run(): Promise<Omit<Output, 'Items'> & { Items: Document<S, H>[] }> {
    log('run', this.params)
    return this.runner(this.params)
  }
}