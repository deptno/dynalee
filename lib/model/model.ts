import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import {Omit} from 'ramda'
import {ETimestampType} from '../constant'
import {mergeOp, replacementIdGenerator} from '../operator/expression/helper'
import {Operator, TScalar} from '../operator/operator'
import {getLogger} from '../util/debug'
import {Document} from './document'
import {head, tap} from 'ramda'

const logger = getLogger(__filename)
const withLog = tap(logger)

/**
 * @todo Is schema need to align with options(like timestamp attributes)
 */
export class Model<S, H extends TScalar, R extends TScalar = never> {
  constructor(tableName: string, hashKeyName: string, options?: ModelOptions)
  constructor(tableName: string, hashKeyName: string, rangeKeyName?: string, options?: ModelOptions)
  constructor(protected readonly tableName, protected readonly hashKeyName, protected readonly rangeKeyName?, options?) {
    this.options = typeof rangeKeyName === 'object'
      ? rangeKeyName
      : options || {}
  }

  private readonly options: ModelOptions
  private readonly operator = new Operator(this.tableName, this.hashKeyName, this.rangeKeyName)

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

  private createRangeQueryParam(rangeKey: TScalar, params) {
    return withLog({
      ...params,
      ExpressionAttributeNames : {
        '#rgk': this.rangeKeyName,
      },
      ExpressionAttributeValues: {
        ':rgk': rangeKey
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
        params = this.createRangeQueryParam(rangeKey, {
          ...mergeOp(replacementIdGenerator(), operators),
          ...params
        })
        logger('createQuery params', params)
        return this.runQuery(params)
      }
    }
  }

  private createHashQueryParams(hashKey, params?) {
    return withLog({
      ...params,
      KeyConditionExpression   : `#hsk = :h`,
      ExpressionAttributeNames : {
        '#hsk': this.hashKeyName,
      },
      ExpressionAttributeValues: {
        '#hsk': hashKey
      }
    })
  }

  private async runQuery(params) {
    try {
      const response = await this.operator.query(params)
      logger('response', response)
      if (response.Count === 0) {
        throw new Error(`Item not found`)
      }
      return response.Items!.map(item =>
        new Document<S, H, R>(this.tableName, this.hashKeyName, this.rangeKeyName, item as S)
      )
    } catch (e) {
      throw new Error(e.message)
    }
  }

  //  async query(hashKey: string, params?): Promise<Document<S, H, R>[]> {
  query(hashKey: string, params?)
  query(hashKey: string, rangeKey: string, params?)
  query(hashKey: string, rangeKey?: string, params?) {
    if (typeof rangeKey === 'object') {
      Object.assign(params || {}, rangeKey)
    }
    Object.assign(params, this.createHashQueryParams(hashKey, params))
    if (typeof rangeKey === 'string') {
      return this.createRangeQuery(rangeKey, params)
    }
    return this.runQuery(params)
  }

  async queryOne(hashKey: string, params?: OperatorParam<DocumentClient.QueryInput>) {
    params = {
      ...this.createHashQueryParams(hashKey, params),
      Limit: 1
    }
    const response = await this.runQuery(params)
    return head(response)
  }

  async createSet(list, options) {
  }

  async delete(hashKey: H, rangeKey?: R, params?: DocumentClient.DeleteItemInput)
  async delete(hashKey: H, params?: DocumentClient.DeleteItemInput)
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
