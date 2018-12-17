import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import {compose, Omit} from 'ramda'
import {DocumentOptions} from '../model/option'
import {ELogs, getLogger} from '../util/log'

const log = getLogger(ELogs.ENGINE_ENGINE)

interface EngineParams {
  ddbClient: DocumentClient
  table: string
  options: DocumentOptions
  hashKey: string
  index?: string
  rangeKey?: string
}

export class Engine {
  private readonly ddbClient: DocumentClient
  protected readonly table: string
  protected readonly hash: string
  protected readonly range?: string
  protected readonly index?: string
  public readonly options: DocumentOptions

  constructor(params: EngineParams) {
    const {ddbClient, table, hashKey, rangeKey, index, options} = params
    this.ddbClient = ddbClient
    this.table = table
    this.hash = hashKey
    this.range = rangeKey
    this.index = index
    this.options = options
  }

  batchGet(hashKey: TScalar, rangeKey?: TScalar, params?): Promise<DocumentClient.BatchGetItemOutput|null> {
    params = {
      RequestItems: {
        [this.table]: this.getKeyParam(hashKey, rangeKey),
      }
    }
    return this.ddbClient
      .batchGet(params)
      .promise()
      .catch(e => this.handleError(params, e))
  }

  batchWrite(params: DocumentClient.BatchWriteItemInput): Promise<DocumentClient.BatchWriteItemOutput|null> {
    return this.ddbClient
      .batchWrite(params)
      .promise()
      .catch(e => this.handleError(params, e))
  }


  /**
   * @todo
   */
//  createSet(list, options) {
//  }

  delete(keys: any): Promise<DocumentClient.DeleteItemOutput|null> {
    return this.ddbClient
      .delete(this.getTableParam({Key: keys}))
      .promise()
      .catch(e => this.handleError(keys, e))
  }

  /**
   * @todo throw Error, if (this.rangeKeyName && !rangeKey)
   */
  get(hashKey: TScalar, rangeKey?: TScalar): Promise<DocumentClient.GetItemOutput|null> {
    const params = {
      ...this.createGetParam(hashKey, rangeKey),
    }
    log('get param')
    log(params)
    return this.ddbClient
      .get(params)
      .promise()
      .catch(e => this.handleError(params, e))
  }

  /**
   * @param input
   * @returns {Promise<PromiseResult<DocumentClient.PutItemOutput, AWSError>>}
   */
  put(input: Omit<DocumentClient.PutItemInput, 'TableName'>): Promise<DocumentClient.PutItemOutput|null> {
    const params: DocumentClient.PutItemInput = {
      ...input,
      ...this.getTableParam(),
    }
    log('put params')
    log(params)
    return this.ddbClient
      .put(params)
      .promise()
      .catch(e => this.handleError(params, e))
  }

  query(params): Promise<DocumentClient.QueryOutput|null> {
    params = {
      ...params,
      ...this.getTableParam(),
    }
    log('query params')
    log(params)
    return this.ddbClient
      .query(params)
      .promise()
      .catch(e => this.handleError(params, e))
  }

  scan(params?): Promise<DocumentClient.ScanOutput|null> {
    params = {
      ...params,
      ...this.getTableParam(),
    }
    log('scan')
    log(params)
    return this.ddbClient
      .scan(params)
      .promise()
      .catch(e => this.handleError(params, e))
  }

  update(hashKey: TScalar, rangeKey: TScalar | undefined, input?: DocumentClient.UpdateItemInput): Promise<DocumentClient.UpdateItemOutput|null> {
    const params = {
      ...input,
      ...this.createGetParam(hashKey, rangeKey)
    }
    log('update() param')
    log(params)
    return this.ddbClient
      .update(params)
      .promise()
      .catch(e => this.handleError(params, e))
  }

  /**
   * @priority low
   * @todo memoize?
   */
  private getTableParam = (params?) => {
    if (this.index) {
      return {
        ...params,
        TableName: this.table,
        IndexName: this.index
      }
    }
    return {
      ...params,
      TableName: this.table
    }
  }

  /**
   * @todo clean up
   * @param hashKey
   * @param rangeKey
   * @returns {{Key: {}}}
   */
  private getKeyParam = (hashKey: TScalar, rangeKey?: TScalar): { Key: {} } => {
    if (!this.range) {
      if (rangeKey !== undefined) {
        log(`ignore. range key(${rangeKey}), rangeKey is not defined`)
      }
      return {
        Key: {
          [this.hash]: hashKey
        }
      }
    }
    if (rangeKey !== undefined) {
      return {
        Key: {
          [this.hash] : hashKey,
          [this.range]: rangeKey
        }
      }
    }
    return {
      Key: {
        [this.hash]: hashKey,
      }
    }
  }

  private createGetParam: (hashKey: TScalar, rangeKey?: TScalar) => NonNullable<any> = compose(
    this.getTableParam,
    this.getKeyParam,
  )

  private handleError = (params, e) => {
    console.error('error')
    console.error(this.ddbClient['service'].endpoint)
    console.error(e.message)
    console.error(params)
    return null
  }
}

export type TScalar = string | number | DocumentClient.binaryType
// @fixme duplicated, model.ts
type OperatorParam<T> = Partial<Omit<T, 'Key' | 'TableName'>>
