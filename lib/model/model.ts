import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import {Omit} from 'ramda'
import {ETimestampType} from '../constant'
import {mergeOp, replacementIdGenerator} from '../operator/expression/helper'
import {Operator, TScalar} from '../operator/operator'
import {getLogger} from '../util/debug'
import {Document} from './document'

const log = getLogger(__filename)

/**
 * @todo Is schema need to align with options(like timestamp attributes)
 */
export class Model<S, H extends TScalar, R extends TScalar = never> {
  constructor(
    protected readonly tableName: string,
    protected readonly hashKeyName: H,
    protected readonly rangeKeyName?: R,
    options?: ModelOptions,
  ) {
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

  private createQuery(hashKey: string, params?: OperatorParam<DocumentClient.QueryInput>) {
    return {
      pipe: async (...operators: any[]): Promise<Document<S, H, R>[]> => {
        // @todo move to outside of Model
        if (operators.length === 0) {
          throw new Error('missing operations')
        }
        const expressionProps = mergeOp(replacementIdGenerator(), operators)
        params = {
          ...params,
          ...expressionProps,
          ExpressionAttributeNames: {
            [`#key`]: this.hashKeyName as string,
            // @todo rangeKey
          }
        }
        log('createQuery params', params)
        try {
          const response = await this.operator.query(hashKey, params)
          log('response', response)
          if (response.Count === 0) {
            throw new Error(`Item not found, hash(${hashKey})`)
          }
          return response.Items!.map(item =>
            new Document<S, H, R>(this.tableName, this.hashKeyName, this.rangeKeyName, item as S)
          )
        } catch (e) {
          throw new Error(e.message)
        }
      },
    }
  }

  //  async query(hashKey: string, params?): Promise<Document<S, H, R>[]> {
  query(hashKey: string, params?) {
    return this.createQuery(hashKey, params)

  }

  async queryOne(hashKey: string, params?: OperatorParam<DocumentClient.QueryInput>) {
    params = {
      ...this.createQuery(hashKey, params),
      Limit: 1
    }
    try {
      const response = await this.operator.query(hashKey, params)
      log('response', response)
      if (response.Count === 0) {
        throw new Error(`Item not found, hash(${hashKey})`)
      }
      return new Document(this.tableName, this.hashKeyName, this.rangeKeyName, response.Items![0] as S)
    } catch (e) {
      log({[this.hashKeyName]: hashKey})
      throw new Error(e.message)
    }
  }

  async createSet(list, options) {
  }

  async delete(hashKey: H, rangeKey?: R, params?: DocumentClient.DeleteItemInput) {
    try {
      const response = await this.operator.delete(hashKey, rangeKey, params)
      log('delete response', response)
      return this
    } catch (e) {
      log(e)
    }
  }

  async get(hashKey: H, rangeKey?: R, params?): Promise<Document<S, H, R>> {
    try {
      const response = await this.operator.get(hashKey, rangeKey, params)
      if (!response.Item) {
        throw new Error(`Item not found, hash(${hashKey}, range(${rangeKey})`)
      }
      log('response', response)
      const model = new Document(this.tableName, this.hashKeyName, this.rangeKeyName, response.Item as S)
      return model
    } catch (e) {
      log({[this.hashKeyName]: hashKey, [this.rangeKeyName!]: rangeKey})
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
