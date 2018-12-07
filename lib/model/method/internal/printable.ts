import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import R, {Omit} from 'ramda'
import {TScalar} from '../../../engine'
import {replacementKeyGenerator, replacementValueGenerator} from '../../../engine/expression/helper'
import {TConnector} from '../../../engine/expression/type'
import {mergeByTypes} from '../../../util'
import {ELogs, getLogger} from '../../../util/log'
import {Document} from '../../document'

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

  protected preRun(): void {

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
    this.preRun()
    return R.omit(['Key'], this.params)
  }

  run(): Promise<Omit<Output, 'Items'> & { Items: Document<S, H>[] }> {
    this.preRun()
    log('runner() params')
    log(this.params)
    return this.runner(this.params)
  }
}
const log = getLogger(ELogs.MODEL_METHOD_INTERNAL_PRINTABLE)

export type Runner<S, H extends TScalar> = (params: Input) => Promise<Omit<Output, 'Items'> & { Items: Document<S, H>[] }>
type ScanInput = Omit<DocumentClient.ScanInput, 'TableName' | 'Key'>
type QueryInput = Omit<DocumentClient.QueryInput, 'TableName' | 'Key'>
type Input = ScanInput | QueryInput
type Output = Omit<DocumentClient.ScanOutput | DocumentClient.QueryOutput, 'TableName'>
interface RunOption {
  original: boolean
}
