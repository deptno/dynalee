import * as AWS from 'aws-sdk'
import {compose} from 'ramda'
import {DocumentClient} from 'aws-sdk/clients/dynamodb'
import {filenameLogger} from '../util/debug'

export type DDBKeyType = string|number|BinaryType

export class Operator<H extends DDBKeyType, R extends DDBKeyType> {
  constructor(
    protected readonly tableName: string,
    protected readonly hashKey: H,
    protected readonly rangeKey: R,
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

  async delete(hashKey, rangeKey?, params?: DocumentClient.DeleteItemInput | null) {
    params = {
      ...params,
      ...this.createGetParam(hashKey, rangeKey),
    }
    return ddbClient.delete(params).promise()
  }

  async get(hash, range?, params?) {
    const param = {
      ...params,
      ...this.createGetParam(hash, range),
    }

    return ddbClient.get(param).promise()
  }

  async put(hash, range?, params?) {
    params = {
      ...params,
      ...this.createGetParam(hash, range),
    }
    return ddbClient.put(params).promise()
  }

  async query(params?) {
  }

  async scan(params?) {
  }

  async update(hash, range?, params?) {
  }

  /**
   * @todo: memoize?
   */
  private getTableParam = (params) => {
    return {
      ...params,
      TableName: this.tableName
    }
  }

  private getKeyParam = (hash, range?) => {
    if (!this.rangeKey) {
      return {
        Key      : {
          [this.hashKey]: hash
        }
      }
    }
    return {
      Key      : {
        [this.hashKey] : hash,
        [this.rangeKey]: range
      }
    }
  }

  private createGetParam: (hash, range?) => any = compose(
    this.getTableParam,
    this.getKeyParam,
  )
}

const ddbClient = new AWS.DynamoDB.DocumentClient()
const log = filenameLogger(__filename)

