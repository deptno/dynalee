import * as AWS from 'aws-sdk'
import {compose, Omit} from 'ramda'
import {getLogger} from '../util/debug'
import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'

export type TScalar = string | number | BinaryType

export class Engine<H extends TScalar, R extends TScalar = never> {
  constructor(
    protected readonly tableName: string,
    protected readonly hashKeyName: string,
    protected readonly rangeKeyName?: string,
  ) {
  }

  async batchGet(hashKey: H, rangeKey?: R, params?) {
    params = {
      RequestItems: {
        [this.tableName]: this.getKeyParam(hashKey, rangeKey),
      }
    }
    return ddbClient.batchGet(params).promise()
  }

  async batchWrite(hashKey: H, rangeKey?: R, params?) {
    params = {
      RequestItems: {
        [this.tableName]: this.getKeyParam(hashKey, rangeKey),
      }
    }
    return ddbClient.batchGet(params).promise()
  }

  /**
   * @todo
   */
  async createSet(list, options) {
  }

  async delete(hashKey: H, rangeKey?: R, params?: OperatorParam<DocumentClient.DeleteItemInput>) {
    Object.assign(params, this.createGetParam(hashKey, rangeKey))
    logger('delete', params)
    return ddbClient.delete(params as DocumentClient.DeleteItemInput).promise()
  }

  /**
   * @todo throw Error, if (this.rangeKeyName && !rangeKey)
   */
  async get(hashKey: H, rangeKey?: R, params?) {
    logger('get args', hashKey, rangeKey, params)
    const param = {
      ...params,
      ...this.createGetParam(hashKey, rangeKey),
    }
    logger('get param', param)
    return ddbClient.get(param).promise()
  }

  /**
   *
   * @param hashKey
   * @param rangeKey
   * @param params
   * @returns {Promise<PromiseResult<DocumentClient.PutItemOutput, AWSError>>}
   */
  put(hashKey: H, rangeKey?: R, params?) {
    params = {
      ...params,
      ...this.createGetParam(hashKey, rangeKey),
    }
    logger('put params', params)
    return ddbClient.put(params).promise()
  }

  async query(params) {
    params = {
      ...params,
      ...this.getTableParam(),
    }
    logger('query params', JSON.stringify(params, null, 2))
    return ddbClient.query(params).promise()
  }

  async scan(params?) {
    logger('@todo return Scan instead')
    params = {
      ...params,
      ...this.getTableParam(),
    }
    return ddbClient.scan(params).promise()
  }

  async update(hashKey: H, rangeKey?: R, params?) {
    logger('@todo update')
  }

  /**
   * @priority low
   * @todo memoize?
   */
  private getTableParam = (params?) => {
    return {
      ...params,
      TableName: this.tableName
    }
  }

  /**
   * @todo clean up
   * @param hashKey
   * @param rangeKey
   * @returns {{Key: {}}}
   */
  private getKeyParam = (hashKey: H, rangeKey?: R) => {
    if (!this.rangeKeyName) {
      if (rangeKey) {
        logger(`ignore. range key(${rangeKey}), rangeKey is not defined`)
      }
      return {
        Key: {
          [this.hashKeyName]: hashKey
        }
      }
    }
    if (rangeKey) {
      return {
        Key: {
          [this.hashKeyName] : hashKey,
          [this.rangeKeyName]: rangeKey
        }
      }
    }
    return {
      Key: {
        [this.hashKeyName]: hashKey,
      }
    }
  }

  private createGetParam: (hashKey: H, rangeKey?: R) => NonNullable<any> = compose(
    this.getTableParam,
    this.getKeyParam,
  )
}

const ddbClient = new AWS.DynamoDB.DocumentClient()
const logger = getLogger(__filename)

// @fixme duplicated, model.ts
type OperatorParam<T> = Partial<Omit<T, 'Key' | 'TableName'>>
