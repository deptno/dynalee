import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import {compose, Omit} from 'ramda'
import {DocumentOptions} from '../model/option'
import {ELogs, getLogger} from '../util/log'

const log = getLogger(ELogs.ENGINE_ENGINE)

interface EngineParams {
  ddbClient: DocumentClient
  table: string
  options: DocumentOptions
  hash: string
  index?: string
  range?: string
}

export class Engine<H extends TScalar, R extends TScalar = never> {
  private readonly ddbClient: DocumentClient
  protected readonly table: string
  protected readonly hash: string
  protected readonly range?: string
  protected readonly index?: string
  public readonly options: DocumentOptions

  constructor(params: EngineParams) {
    const {ddbClient, table, hash, range, index, options} = params
    this.ddbClient = ddbClient
    this.table = table
    this.hash = hash
    this.range = range
    this.index = index
    this.options = options
  }

  async batchGet(hashKey: H, rangeKey?: R, params?) {
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

  private handleError = (params, e) => {
    log('error', this.ddbClient['service'].endpoint, e.message, params)
  }

  batchWrite(params: DocumentClient.BatchWriteItemInput) {
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

  delete(keys) {
    return this.ddbClient
      .delete(this.getTableParam({Key: keys}))
      .promise()
      .catch(e => this.handleError(keys, e))
  }

  /**
   * @todo throw Error, if (this.rangeKeyName && !rangeKey)
   */
  get(hashKey: H, rangeKey?: R, params?) {
    log('get args', hashKey, rangeKey, params)
    const param = {
      ...params,
      ...this.createGetParam(hashKey, rangeKey),
    }
    log('get param', param)
    return this.ddbClient
      .get(param)
      .promise()
      .catch(e => this.handleError(params, e))
  }

  /**
   * @param input
   * @returns {Promise<PromiseResult<DocumentClient.PutItemOutput, AWSError>>}
   */
  put(input: Omit<DocumentClient.PutItemInput, 'TableName'>) {
    const params: DocumentClient.PutItemInput = {
      ...input,
      ...this.getTableParam(),
    }
    log('put params', params)
    return this.ddbClient
      .put(params)
      .promise()
      .catch(e => this.handleError(params, e))
  }

  query(params) {
    params = {
      ...params,
      ...this.getTableParam(),
    }
    log('query params', JSON.stringify(params, null, 2))
    return this.ddbClient
      .query(params)
      .promise()
      .catch(e => this.handleError(params, e))
  }

  scan(params?) {
    log('@todo return Scan instead')
    params = {
      ...params,
      ...this.getTableParam(),
    }
    log('doscan', params)
    return this.ddbClient
      .scan(params)
      .promise()
      .catch(e => this.handleError(params, e))
  }

  update(hashKey: H, rangeKey: R | undefined, input?: DocumentClient.UpdateItemInput) {
    log('update()', hashKey, rangeKey, input)
    const params = {
      ...input,
      ...this.createGetParam(hashKey, rangeKey)
    }
    log('update() param', params)
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
  private getKeyParam = (hashKey: H, rangeKey?: R): { Key: {}; } => {
    if (!this.range) {
      if (rangeKey) {
        log(`ignore. range key(${rangeKey}), rangeKey is not defined`)
      }
      return {
        Key: {
          [this.hash]: hashKey
        }
      }
    }
    if (rangeKey) {
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

  private createGetParam: (hashKey: H, rangeKey?: R) => NonNullable<any> = compose(
    this.getTableParam,
    this.getKeyParam,
  )
}

export type TScalar = string | number | DocumentClient.binaryType
// @fixme duplicated, model.ts
type OperatorParam<T> = Partial<Omit<T, 'Key' | 'TableName'>>
