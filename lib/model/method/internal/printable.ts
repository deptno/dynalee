import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import {Omit} from 'ramda'
import * as R from 'ramda'
import {replacementKeyGenerator, replacementValueGenerator} from '../../../engine/expression/helper'
import {TConnector} from '../../../engine/expression/type'
import {mergeByTypes} from '../../../util'
import {ELogs, getLogger} from '../../../util/log'
import {Document} from '../../document'

export abstract class Printable<S, I extends Input> {
  protected genKey = replacementKeyGenerator()
  protected genValue = replacementValueGenerator()
  protected params = {} as Input

  protected constructor(protected runner: Runner<S>) {
  }

  /**
   * Merge params object
   * @param {Partial<I>} target
   * @param {TConnector} connector
   * @returns {this}
   * @protected
   */
  protected merge(target: Partial<I>, connector: TConnector = 'AND'): this {
    this.params = mergeByTypes(connector, this.params, target)
    return this
  }

  protected preRun(): void {

  }

  /**
   * Get operation text(without keys)
   * @returns {R.Omit<Pick<DocumentClient.ScanInput, Exclude<keyof DocumentClient.ScanInput, "TableName" | "Key">> | Pick<DocumentClient.QueryInput, Exclude<keyof DocumentClient.QueryInput, "TableName" | "Key">> | Pick<DocumentClient.UpdateItemInput, Exclude<keyof DocumentClient.UpdateItemInput, "TableName" | "Key">>, string>}
   */
  out() {
    this.preRun()
    return R.omit(['Key'], this.params)
  }
}
const log = getLogger(ELogs.MODEL_METHOD_INTERNAL_PRINTABLE)

export type Runner<S> = (params: Input) => Promise<OutputProxy<S> | Document<S>>
export type OutputProxy<S> = Omit<Output, 'Items'> & { Items: Document<S>[] }
type ScanInput = Omit<DocumentClient.ScanInput, 'TableName' | 'Key'>
type QueryInput = Omit<DocumentClient.QueryInput, 'TableName' | 'Key'>
type UpdateItemInput = Omit<DocumentClient.UpdateItemInput, 'TableName' | 'Key'>
type Input = ScanInput | QueryInput | UpdateItemInput
type Output = Omit<DocumentClient.ScanOutput | DocumentClient.QueryOutput, 'TableName'>
