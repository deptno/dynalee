import {getDdbClient} from '../config/aws'
import {Engine, TScalar} from '../engine'
import {ELogs, getLogger} from '../util/log'
import {Document} from './document'
import {Query} from './method/query'
import {Scan} from './method/scan'
import {defaultModelOptions, ModelOptions} from './option'

const log = getLogger(ELogs.MODEL_MODEL)

export interface ReadableParams<S, H, R> {
  table: string
  hash: keyof S
  range?: keyof S
  options?: ModelOptions
}

export abstract class Readable<S, H extends TScalar, R extends TScalar = never> {
  protected readonly table: string
  protected readonly hash: string
  protected readonly range?: string
  protected readonly options: ModelOptions
  protected engine!: Engine<H, R>

  protected constructor(params: ReadableParams<S, H, R>) {
    const {table, hash, range, options = {} as ModelOptions} = params
    this.options = options
    this.table = table
    this.hash = hash
    this.range = range

    if (!this.options.document) {
      this.options.document = defaultModelOptions.document
    }

    this.setEngine(params)
  }

  protected setEngine(params: ReadableParams<S, H, R>) {
    this.engine = new Engine({
      ...params,
      ddbClient: getDdbClient(this.options.aws),
      options  : this.options.document!
    })
  }

  protected createDocument(item) {
    return new Document<S, H, R>(this.engine, this.table, this.hash, this.range, item)
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
        : response.Items!.map(item => this.createDocument(item))
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
        : response.Items!.map(item => this.createDocument(item))
      return response
    } catch (e) {
      throw new Error(e.message)
    }
  }

  query(hashKey: H) {
    return new Query<S, H, R>(this.doQuery.bind(this), this.hash, hashKey)
  }

  scan() {
    return new Scan(this.doScan.bind(this))
  }
}

