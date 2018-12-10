import {Omit} from 'ramda'
import {getDdbClient} from '../config/aws'
import {Engine, TScalar} from '../engine'
import {ELogs, getLogger} from '../util/log'
import {Document} from './document'
import {Query} from './method/query'
import {Scan} from './method/scan'
import {defaultModelOptions, ModelOptions} from './option'

const log = getLogger(ELogs.MODEL_MODEL)

export interface ReadableParams<S, H extends keyof S, RK extends Exclude<keyof S, H> = never> {
  table: string
  hash: S[H]
  range?: S[RK]
  options?: ModelOptions
}

export abstract class Readable<S, H, R= never> {
  protected readonly table: string
  protected readonly hash: keyof S
  protected readonly range?: Exclude<keyof S, H>
  protected readonly options: ModelOptions
  protected engine!: Engine

  protected constructor(params: ReadableParams<S>) {
    const {table, hash, range, options = {} as ModelOptions} = params
    this.options = options
    this.table = table
    this.hash = hash
    this.range = range
    this.options.document = {
      ...defaultModelOptions.document!,
      ...options.document
    }

    this.setEngine(params)
  }

  query(hashKey: H) {
    return new Query<S, H, R>(this.doQuery.bind(this), this.hash, hashKey)
  }

  scan() {
    return new Scan<S>(this.doScan.bind(this))
  }

  protected setEngine(params: ReadableParams<S>) {
    this.engine = new Engine({
      ...params,
      ddbClient: getDdbClient(this.options.aws),
      options  : this.options.document!
    })
  }

  protected createDocument(item, exists = false) {
    return new Document<S>(this.engine, this.table, this.hash, this.range, exists, item)
  }

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

