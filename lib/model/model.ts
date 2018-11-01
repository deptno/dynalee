import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import {concat, cond, head, is, mergeWith, Omit, T, tap} from 'ramda'
import {ETimestampType} from '../constant'
import {Engine, TScalar} from '../engine'
import {mergeOp, replacementValueGenerator} from '../engine/expression/helper'
import {getLogger} from '../util/debug'
import {Document} from './document'
import {CompositeQuery} from './method/query'
import {Scan} from './method/scan'

const logger = getLogger(__filename)
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
      : options || {}
  }

  private readonly options: ModelOptions
  private readonly operator = new Engine(this.tableName, this.hashKeyName, this.rangeKeyName)

  of(data: S) {
    return new Document<S, H, R>(this.tableName, this.hashKeyName, this.rangeKeyName, data, this.options)
  }

  /**
   * @todo apply options, is it good to Use `Document`?
   */
  async batchGet(params?) {
  }

  async batchWrite(params?) {
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

  private async doQuery(params) {
    try {
      const response = await this.operator.query(params)
      logger('response', response)
      if (response.Count === 0) {
        return []
      }
      return response.Items!.map(item =>
        new Document<S, H, R>(this.tableName, this.hashKeyName, this.rangeKeyName, item as S)
      )
    } catch (e) {
      throw new Error(e.message)
    }
  }

  private async doScan(params) {
    try {
      const response = await this.operator.scan(params)
      logger('response', response)
      if (response.Count === 0) {
        return []
      }
      return response.Items!.map(item =>
        new Document<S, H, R>(this.tableName, this.hashKeyName, this.rangeKeyName, item as S)
      )
    } catch (e) {
      throw new Error(e.message)
    }
  }

  query(hashKey: H) {
    return new CompositeQuery<S, H, R>(this.doQuery, this.operator, this.hashKeyName, hashKey)
  }

  scan() {
    return new Scan(logger.bind(null, 'doScan'), this.operator, this.hashKeyName)
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
      const response = await this.operator.delete(hashKey, rangeKey, params)
      logger('delete response', response)
      return this
    } catch (e) {
      logger(e)
    }
  }

  async get(hashKey: H, rangeKey?: R, params?): Promise<Document<S, H, R>>
  async get(hashKey: H, params?): Promise<Document<S, H, R>>
  async get(hashKey, rangeKey?, params?) {
    try {
      const response = await this.operator.get(hashKey, rangeKey, params)
      if (!response.Item) {
        throw new Error(`Item not found, hash(${hashKey}, range(${rangeKey})`)
      }
      logger('response', response)
      const model = new Document(this.tableName, this.hashKeyName, this.rangeKeyName, response.Item as S)
      return model
    } catch (e) {
      logger({[this.hashKeyName]: hashKey, [this.rangeKeyName!]: rangeKey})
      throw new Error(e.message)
    }
  }
}

export interface ModelOptions {
  timestamp?: {
    type: ETimestampType | (() => TScalar),
    createdAt?: string // default: createdAt
    updatedAt?: string // default: updatedAt
  }
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
