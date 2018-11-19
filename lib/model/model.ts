import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import debug from 'debug'
import {getDdbClient} from '../config/aws'
import {Engine, TScalar} from '../engine'
import {Document} from './document'
import {Query} from './method/query'
import {Scan} from './method/scan'
import {UpdateItem} from './method/update-item'
import {defaultModelOptions, ModelOptions} from './option'

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
  constructor(protected readonly tableName, protected readonly hashKeyName, protected readonly rangeKeyName?, options?: ModelOptions) {
    this.options = typeof rangeKeyName === 'object'
      ? rangeKeyName
      : options || {}
    if (!this.options.document) {
      this.options.document = defaultModelOptions.document
    }
    const ddbClient = getDdbClient(this.options.aws)
    this.engine = new Engine(
      ddbClient,
      this.tableName,
      this.hashKeyName,
      this.rangeKeyName,
      this.options.document!
    )
  }

  private readonly options: ModelOptions
  private readonly engine: Engine<H, R>

  of(data: S) {
    return this.createDocument(data)
  }

  /**
   * @todo apply options, is it good to Use `Document`?
   */
  async batchGet(params?) {
    console.warn('@todo implement batchGet')
  }

  private createPutRequestItem = (item: S) => {
    if (!this.options.document || !this.options.document.timestamp) {
      return {
        PutRequest: {
          Item: item
        }
      }
    }
    const {createdAt, updatedAt} = this.options.document.timestamp
    const change = {}
    if (createdAt && item[createdAt.attributeName] === undefined) {
      change[createdAt.attributeName] = createdAt.handler()
    }
    if (updatedAt) {
      change[updatedAt.attributeName] = updatedAt.handler()
    }
    return {
      PutRequest: {
        Item: Object.assign(change, item)
      }
    }
  }

  async batchWrite(updateItems: S[], deleteKeys: KEYS[]) {
    const params = {
      RequestItems: {
        [this.tableName]: [
          ...updateItems.map(this.createPutRequestItem),
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
        [this.tableName]: items.map(this.createPutRequestItem)
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

  private createDocument(item) {
    return new Document<S, H, R>(this.engine, this.tableName, this.hashKeyName, this.rangeKeyName, item)
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

  private async doUpdate(hashKey, rangeKey, params) {
    try {
      const response = await this.engine.update(hashKey, rangeKey, params)
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

  updateItem(hashKey: H, rangeKey?: R) {
    return new UpdateItem<S, H>(this.doUpdate.bind(this, hashKey, rangeKey))
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

