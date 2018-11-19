import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import debug from 'debug'
import {compose, Omit} from 'ramda'
import {DocumentOptions} from '../model/option'

const log = debug(['dynalee', __filename].join(':'))

export class Engine<H extends TScalar, R extends TScalar = never> {
  constructor(
    private readonly ddbClient: DocumentClient,
    protected readonly tableName: string,
    protected readonly hashKeyName: string,
    protected readonly rangeKeyName: string|undefined,
    protected readonly options: DocumentOptions
  ) {
  }
  private applyPutOptions(item) {
    if (!this.options || !this.options.timestamp) {
      return item
    }
    const {createdAt, updatedAt} = this.options.timestamp
    const change = {}
    if (createdAt && item[createdAt.attributeName] === undefined) {
      change[createdAt.attributeName] = createdAt.handler()
    }
    if (updatedAt) {
      change[updatedAt.attributeName] = updatedAt.handler()
    }
    return Object.assign(change, item)
  }

  async batchGet(hashKey: H, rangeKey?: R, params?) {
    params = {
      RequestItems: {
        [this.tableName]: this.getKeyParam(hashKey, rangeKey),
      }
    }
    return this.ddbClient
      .batchGet(params)
      .promise()
      .catch(e => log('error', this.ddbClient['service'].endpoint, e.message))
  }

  async batchWrite(params: DocumentClient.BatchWriteItemInput) {
    params.RequestItems[this.tableName].forEach(requestItem => {
      if (requestItem.PutRequest) {
        requestItem.PutRequest.Item = this.applyPutOptions(requestItem.PutRequest.Item)
      }
    })

    return await this.ddbClient
      .batchWrite(params)
      .promise()
      .catch(e => log('error', this.ddbClient['service'].endpoint, e.message))
  }


  /**
   * @todo
   */
  async createSet(list, options) {
  }

  async delete(keys, params?: OperatorParam<DocumentClient.DeleteItemInput>) {
    return this.ddbClient
      .delete({
        ...this.getTableParam({Key: keys}),
        ...params
      })
      .promise()
      .catch(e => log('error', this.ddbClient['service'].endpoint, e.message))
  }

  /**
   * @todo throw Error, if (this.rangeKeyName && !rangeKey)
   */
  async get(hashKey: H, rangeKey?: R, params?) {
    log('get args', hashKey, rangeKey, params)
    const param = {
      ...params,
      ...this.createGetParam(hashKey, rangeKey),
    }
    log('get param', param)
    return this.ddbClient
      .get(param)
      .promise()
      .catch(e => log('error', this.ddbClient['service'].endpoint, e.message))
  }

  /**
   *
   * @param hashKey
   * @param rangeKey
   * @param input
   * @returns {Promise<PromiseResult<DocumentClient.PutItemOutput, AWSError>>}
   */
  put(hashKey: H, rangeKey: R|undefined, input: DocumentClient.PutItemInput) {
    const params: DocumentClient.PutItemInput = {
      ...input,
      ...this.getTableParam(),
      Item: this.applyPutOptions(input.Item)
    }
    log('put params', params)
    return this.ddbClient
      .put(params)
      .promise()
      .catch(e => log('error', this.ddbClient['service'].endpoint, e.message))
  }

  async query(params) {
    params = {
      ...params,
      ...this.getTableParam(),
    }
    log('query params', JSON.stringify(params, null, 2))
    return this.ddbClient
      .query(params)
      .promise()
      .catch(e => log('error', this.ddbClient['service'].endpoint, e))
  }

  async scan(params?) {
    log('@todo return Scan instead')
    params = {
      ...params,
      ...this.getTableParam(),
    }
    log('doscan', params)
    return this.ddbClient
      .scan(params)
      .promise()
      .catch(e => log('error', this.ddbClient['service'].endpoint, e.message))
  }

  async update(hashKey: H, rangeKey: R|undefined, input?: DocumentClient.UpdateItemInput) {
    log('update()', hashKey, rangeKey, input)
    const param = {
      ...input,
      ...this.createGetParam(hashKey, rangeKey)
    }
    log('update() param', param)
    return this.ddbClient
      .update(param)
      .promise()
      .catch(e => log('error', this.ddbClient['service'].endpoint, e.message))
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
        log(`ignore. range key(${rangeKey}), rangeKey is not defined`)
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

export type TScalar = string | number | DocumentClient.binaryType
// @fixme duplicated, model.ts
type OperatorParam<T> = Partial<Omit<T, 'Key' | 'TableName'>>
