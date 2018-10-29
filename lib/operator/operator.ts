import * as AWS from 'aws-sdk'
import {compose} from 'ramda'
import {DocumentClient} from 'aws-sdk/clients/dynamodb'
import {getLogger} from '../util/debug'

export type TScalar = string | number | BinaryType

export class Operator<H extends TScalar, R extends TScalar = never> {
  constructor(
    protected readonly tableName: string,
    protected readonly hashKey: H,
    protected readonly rangeKey?: R,
  ) {
  }

  async batchGet(hash, range?, params?) {
    params = {
      RequestItems: {
        [this.tableName]: this.getKeyParam(hash, range),
      }
    }
    return ddbClient.batchGet(params).promise()
  }

  async batchWrite(hash, range?, params?) {
    params = {
      RequestItems: {
        [this.tableName]: this.getKeyParam(hash, range),
      }
    }
    return ddbClient.batchGet(params).promise()
  }

  /**
   * @todo
   */
  async createSet(list, options) {
  }

  async delete(hashKey, rangeKey?, params?: DocumentClient.DeleteItemInput | undefined) {
    params = {
      ...params,
      ...this.createGetParam(hashKey, rangeKey),
    }
    log('delete', params)
    return ddbClient.delete(params!).promise()
  }

  /**
   * @todo throw Error, if (this.rangeKeyName && !rangeKey)
   */
  async get(hash, range?, params?) {
    log('get args', hash, range, params)
    const param = {
      ...params,
      ...this.createGetParam(hash, range),
    }
    log('get param', param)
    return ddbClient.get(param).promise()
  }

  /**
   *
   * @param hash
   * @param range
   * @param params
   * @returns {Promise<PromiseResult<DocumentClient.PutItemOutput, AWSError>>}
   */
  put(hash, range?, params?) {
    params = {
      ...params,
      ...this.createGetParam(hash, range),
    }
    log('put params', params)
    return ddbClient.put(params).promise()
  }

  async query(hashKey, params) {
    params = {
      ...params,
      ...this.getTableParam(),
    }
    log('query params', JSON.stringify(params, null, 2))
    return ddbClient.query(params).promise()
  }

  async scan(params?) {
    log('@todo scan')
  }

  async update(hash, range?, params?) {
    log('@todo update')
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
   * @param hash
   * @param range
   * @returns {{Key: {}}}
   */
  private getKeyParam = (hash, range?) => {
    if (!this.rangeKey) {
      if (range) {
        log(`ignore. range key(${range}), rangeKey is not defined`)
      }
      return {
        Key: {
          [this.hashKey]: hash
        }
      }
    }
    if (range) {
      return {
        Key: {
          [this.hashKey] : hash,
          [this.rangeKey]: range
        }
      }
    }
    return {
      Key: {
        [this.hashKey]: hash,
      }
    }
  }

  private createGetParam: (hash, range?) => any = compose(
    this.getTableParam,
    this.getKeyParam,
  )
}

const ddbClient = new AWS.DynamoDB.DocumentClient()
const log = getLogger(__filename)

