import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import {concat, cond, is, mergeWith, Omit, T, tap} from 'ramda'
import {getDdbClient} from '../config/aws'
import {ETimestampType} from '../constant'
import {Engine, TScalar} from '../engine'
import {mergeOp, replacementValueGenerator} from '../engine/expression/helper'
import debug from 'debug'
import {Document} from './document'
import {Query} from './method/query'
import {Scan} from './method/scan'

const logger = debug(['dynalee', __filename].join(':'))
const withLog = tap(logger)

/**
 * @todo Is schema need to align with options(like timestamp attributes)
 */
export class Model<S, H extends TScalar, R extends TScalar = never> {
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
    logger('options', this.options)
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
      logger('response', response.$response.data)
      return response.$response.data
//      if (response.Count === 0) {
//        return []
//      }
//      return response.Items!.map(item => this.createDocument(item))
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
      logger('response', response.$response.data)
      return response.$response.data
//      if (response.Count === 0) {
//        return []
//      }
//      return response.Items!.map(item => this.createDocument(item))
    } catch (e) {
      throw new Error(e.message)
    }
  }

  /**
   * @todo apply immer
   */
  private createRangeQueryParam(rangeKey: TScalar, params) {
    logger('createRangeQueryParam()', rangeKey)
    return withLog({
      ...params,
      ExpressionAttributeNames : {
        ...params.ExpressionAttributeNames,
        '#RGK': this.rangeKeyName,
      },
      ExpressionAttributeValues: {
        ...params.ExpressionAttributeValues,
        ':RGK': rangeKey
      }
    })
  }

  private createRangeQuery(rangeKey: TScalar, params: OperatorParam<DocumentClient.QueryInput>) {
    return {
      pipe: async (...operators: any[]): Promise<Document<S, H, R>[]> => {
        // @todo move to outside of Model
        if (operators.length === 0) {
          throw new Error('missing operations')
        }
        logger('createRangeQuery() params', params)
        params = this.createRangeQueryParam(rangeKey, mergeWith(
          cond([
            [is(String), concat(' AND ')],
            [T, Object.assign],
          ]),
          mergeOp(replacementValueGenerator(), operators),
          params
        ))
        logger('createRangeQuery() params', params)
        return this.doQuery(params)
      }
    }
  }

  private createHashQueryParams(hashKey, params?) {
    return {
      ...params,
      KeyConditionExpression   : `#HSK = :HSK`,
      ExpressionAttributeNames : {
        '#HSK': this.hashKeyName,
      },
      ExpressionAttributeValues: {
        ':HSK': hashKey
      }
    }
  }

  private createDocument(item, options?: ModelOptions) {
    return new Document<S, H, R>(this.engine, this.tableName, this.hashKeyName, this.rangeKeyName, item, options)
  }

  private async doQuery(params) {
    try {
      const response = await this.engine.query(params)
      logger('response', response)
      if (response.Count === 0) {
        return []
      }
      return response.Items!.map(item => this.createDocument(item))
    } catch (e) {
      logger('doQuery', e, this)
      throw new Error(e.message)
    }
  }

  private async doScan(params) {
    try {
      const response = await this.engine.scan(params)
      logger('response', response)
      if (response.Count === 0) {
        return []
      }
      return {
        ...response,
        Items: response.Items.map(item => this.createDocument(item))
      }
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
      logger('response', response)
      return this.createDocument(response.Item)
    } catch (e) {
      logger({[this.hashKeyName]: hashKey, [this.rangeKeyName!]: rangeKey})
      throw new Error(e.message)
    }
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

  async delete(hashKey: H, rangeKey: R, params: DocumentClient.DeleteItemInput)
  async delete(hashKey: H, rangeKey: R)
  async delete(hashKey: H, params: DocumentClient.DeleteItemInput)
  async delete(hashKey: H)
  async delete(hashKey, rangeKey?, params?) {
    try {
      const response = await this.engine.delete(hashKey, rangeKey, params)
      logger('delete response', response)
      return this
    } catch (e) {
      logger(e)
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
interface ModelStatic {
  new<S, H extends TScalar, R extends TScalar = never>(
    tableName: string, hashKeyName: H, rangeKeyName?: R, options?: ModelOptions,
  ): Model<S, H, R>

  new<S, H extends TScalar, R extends TScalar>(
    tableName: string, hashKeyName: H, rangeKeyName: R
  ): Model<S, H, R>

  new<S, H extends TScalar>(
    tableName: string, hashKeyName: H, options?: ModelOptions
  ): Model<S, H>

  new<S, H extends TScalar, R extends TScalar>(
    tableName: string, hashKeyName: H, rangeKeyName: R, options?: ModelOptions
  ): Model<S, H, R>
}
type OperatorParam<T> = Partial<Omit<T, 'Key' | 'TableName'>>
