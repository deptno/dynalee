import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import debug from 'debug'
import {getDdbClient} from '../config/aws'
import {ETimestampType} from '../constant'
import {Engine, TScalar} from '../engine'
import {Document} from './document'
import {Query} from './method/query'
import {Scan} from './method/scan'
import {Update} from './method/update'

const log = debug(['dynalee', __filename].join(':'))

/**
 * @todo Is schema need to align with options(like timestamp attributes)
 */
export class Model<S, H extends TScalar, R extends TScalar = never, KEYS = { +readonly [k in keyof S]: number }> {
  /**
   * HashKey only
   * @param {string} tableName
   * @param {string} hashKeyName
   */
  constructor(tableName: string, hashKeyName: string)
  /**
   * HashKey & Options
   * @param {string} tableName
   * @param {string} hashKeyName
   * @param {ModelOptions} options
   */
  constructor(tableName: string, hashKeyName: string, options: ModelOptions)
  /**
   * HashKey & RangeKey
   * @param {string} tableName
   * @param {string} hashKeyName
   * @param {string} rangeKeyName
   */
  constructor(tableName: string, hashKeyName: string, rangeKeyName: string)
  /**
   * HashKey & RangeKey & Options
   * @param {string} tableName
   * @param {string} hashKeyName
   * @param {string} rangeKeyName
   * @param {ModelOptions} options
   */
  constructor(tableName: string, hashKeyName: string, rangeKeyName: string, options: ModelOptions)
  constructor(protected readonly tableName, protected readonly hashKeyName, protected readonly rangeKeyName?, options?) {
    this.options = typeof rangeKeyName === 'object'
      ? rangeKeyName
      : (options || {})
    const ddbClient = getDdbClient(this.options)
    log('options', this.options)
    this.engine = new Engine(ddbClient, this.tableName, this.hashKeyName, this.rangeKeyName)
  }

  private readonly options: ModelOptions
  private readonly engine: Engine<H, R>

  of(data: S) {
    return this.createDocument(data, this.options)
  }

  /**
   * @todo apply options, is it good to Use `Document`?
   */
  async batchGet(params?) {
    console.warn('@todo implement batchGet')
  }

  async batchWrite(updateItems: S[], deleteKeys: KEYS[]) {
    const params = {
      RequestItems: {
        [this.tableName]: [
          ...updateItems.map(item => ({
            PutRequest: {
              Item: item
            }
          })),
          ...deleteKeys.map(key => ({
            DeleteRequest: {
              Key: key
            }
          }))
        ]
      }
    }
  }
  async batchPut(items: S[]) {
    const params = {
      RequestItems: {
        [this.tableName]: items.map(item => ({
          PutRequest: {
            Item: item
          }
        }))
      }
    }
    try {
      const response = await this.engine.batchWrite(params)
      log('batchPut response', response)
      return response.$response.data
    } catch (e) {
      throw new Error(e.message)
    }
  }

  // @fixme replace Key[]
  async batchDelete(keys: DocumentClient.Key[]) {
    const params = {
      RequestItems: {
        [this.tableName]: keys.map(key => ({
          DeleteRequest: {
            Key: key
          }
        }))
      }
    }
    try {
      const response = await this.engine.batchWrite(params)
      log('batchDelete response.$response.data', response.$response.data)
      return response.$response.data
    } catch (e) {
      throw new Error(e.message)
    }
  }

  private createDocument(item, options?: ModelOptions) {
    return new Document<S, H, R>(this.engine, this.tableName, this.hashKeyName, this.rangeKeyName, item, options)
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

  private async doUpdate(params) {
    try {
      const response = await this.engine.update(params)
      log('doUpdate response', response)
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

  async get(hashKey: H, rangeKey?: R, params?): Promise<Document<S, H, R>>
  async get(hashKey: H, params?): Promise<Document<S, H, R>>
  async get(hashKey, rangeKey?, params?) {
    try {
      const response = await this.engine.get(hashKey, rangeKey, params)
      if (!response.Item) {
        throw new Error(`Item not found, hash(${hashKey}, range(${rangeKey})`)
      }
      log('get response', response)
      return this.createDocument(response.Item)
    } catch (e) {
      log({[this.hashKeyName]: hashKey, [this.rangeKeyName!]: rangeKey})
      throw new Error(e.message)
    }
  }

  update() {
    return new Update<S, H>(this.doQuery.bind(this))
  }

  query(hashKey: H) {
    return new Query<S, H, R>(this.doQuery.bind(this), this.hashKeyName, hashKey)
  }

  scan() {
    return new Scan(this.doScan.bind(this))
  }

  /**
   * @deprecated not implement
   * @param list
   * @param options
   * @returns {Promise<void>}
   */
  async createSet(list, options) {
    console.warn('@todo implment createSet()')
  }

  async delete(keys: KEYS, params: DocumentClient.DeleteItemInput)
  async delete(keys: KEYS)
  async delete(keys: KEYS, params?) {
    try {
      log('delete params', keys, params)
      const response = await this.engine.delete(keys, params)
      log('delete response', response)
      return this
    } catch (e) {
      log(e)
    }
  }
}

export interface ModelOptions {
  timestamp?: {
    type: ETimestampType | (() => TScalar),
    createdAt?: string // default: createdAt
    updatedAt?: string // default: updatedAt
  },
  region?: string,
  endpoint?: string
}
