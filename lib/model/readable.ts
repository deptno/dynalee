import {getDdbClient} from '../config/aws'
import {Engine} from '../engine'
import {ELogs, getLogger} from '../util/log'
import {Document} from './document'
import {Query} from './method/query'
import {RangeQuery} from './method/range-query'
import {Scan} from './method/scan'
import {defaultModelOptions, ModelOptions} from './option'

const log = getLogger(ELogs.MODEL_MODEL)

export interface ReadableParams<S, H extends keyof S, RK extends keyof S = never> {
  table: string
  hashKey: H
  rangeKey?: RK
  options?: ModelOptions
}

export abstract class Readable<S, H extends keyof S, R extends keyof S> {
  protected readonly table: string
  protected readonly hash: H
  protected readonly range?: R
  protected readonly options: ModelOptions
  protected engine!: Engine

  protected constructor(params: ReadableParams<S, H, R>) {
    const {table, hashKey, rangeKey, options = {} as ModelOptions} = params
    this.options = options
    this.table = table
    this.hash = hashKey
    this.range = rangeKey
    this.options.document = {
      ...defaultModelOptions.document!,
      ...options.document
    }

    this.setEngine(params)
  }

  /**
   * Get `Query`(Hash)
   * @param {S[H]} hash
   * @returns {Query<S, H>}
   */
  query(hash: S[H]) {
    return new Query<S, H>(this.doQuery.bind(this), this.hash, hash)
  }

  /**
   * Get `RangeQuery`(Range)
   * @todo consider RangeReadable. RangeModel, SecondaryIndex use this
   * @param {S[H]} hash
   * @returns {Query<S, H>}
   */
  rangeQuery(hash: S[H]): RangeQuery<S, H, R> {
    if (this.range === undefined) {
      throw new Error('rangeKey name is not defined')
    }
    return new RangeQuery<S, H, R>(this.doQuery.bind(this), this.hash, hash, this.range)
  }

  /**
   * Get `Scan`
   * @returns {Scan<S>}
   */
  scan() {
    return new Scan<S>(this.doScan.bind(this))
  }

  /**
   * SetEngine
   * @param {ReadableParams<S, H, R>} params
   * @protected
   */
  protected setEngine(params: ReadableParams<S, H, R>) {
    this.engine = new Engine({
      ...params,
      ddbClient: getDdbClient(this.options.aws),
      options  : this.options.document!
    })
  }

  /**
   * Create document
   * @param {S} item
   * @param {boolean} exists - Set true if you convinced, it exists on database
   * @returns {Document<S>}
   * @protected
   */
  protected createDocument(item, exists = false) {
    return new Document<S>(this.engine, this.table, this.hash, this.range, exists, item)
  }

  /**
   * Operate query
   * @param params
   * @returns {Promise<DocumentClient.QueryOutput>}
   * @private
   */
  private async doQuery(params) {
    try {
      const response = await this.engine.query(params)
      log('doQuery response', response)
      if (!response) {
        return
      }
      response.Items = response.Count === 0
        ? []
        : response.Items!.map(item => this.createDocument(item, true))
      return response
    } catch (e) {
      log('doQuery', e, this)
      throw new Error(e.message)
    }
  }

  /**
   * Operate scan
   * @param params
   * @returns {Promise<DocumentClient.ScanOutput>}
   */
  private async doScan(params) {
    try {
      const response = await this.engine.scan(params)
      log('doScan response', response)
      if (!response) {
        return
      }
      response.Items = response.Count === 0
        ? []
        : response.Items!.map(item => this.createDocument(item, true))
      return response
    } catch (e) {
      throw new Error(e.message)
    }
  }
}

