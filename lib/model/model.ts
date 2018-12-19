import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import * as R from 'ramda'
import {triggerReducer} from '../options/trigger-reducer'
import {dynamodbDoc} from '../util/dynamodb-document'
import {ELogs, getLogger} from '../util/log'
import {Document} from './document'
import {Update} from './method/update'
import {Readable, ReadableParams} from './readable'

const log = getLogger(ELogs.MODEL_MODEL)

abstract class Model<S, H extends keyof S, RK extends keyof S = never> extends Readable<S, H, RK> {
  /**
   * Create and return Document
   * @param {S} data
   * @returns {Document<S>}
   */
  of(data: S) {
    return this.createDocument(data)
  }

  /**
   * Get items
   * @deprecated @todo
   * @todo
   */
  async batchGet() {
    console.warn('@todo implement batchGet')
  }

  /**
   * BatchWrite items, It sends automatically split chunk every 25 items
   * @param {WriteRequest<S>[]} items
   * @returns {Promise<void>}
   */
  async batchWrite(items: WriteRequest<S>[]) {
    const documentOption = this.options.document
    const requestToPut = item => [
      ...documentOption!.onCreate,
      ...documentOption!.onUpdate
    ].reduce(triggerReducer, item)
    const transform = documentOption
      ? (item: DocumentClient.WriteRequest) => item.PutRequest
        ? {
          PutRequest: {
            Item: requestToPut(dynamodbDoc(item.PutRequest.Item))
          }
        }
        : R.identity(item)
      : R.identity

    const paramsList = R.splitEvery(25, items).map(items => {
      return {
        RequestItems: {
          [this.table]: items.map(transform)
        }
      }
    })

    try {
      const pResponses = Promise.all(paramsList.map(params => this.engine.batchWrite(params)))
      const responses = await pResponses
      const unprocessedItems = responses.reduce((unprocessedItems, response) => {
        if (response) {
          if (response.UnprocessedItems) {
            const unprocessedItems = Object.keys(response.UnprocessedItems)
            unprocessedItems.push(...unprocessedItems)
          }
        }
        return unprocessedItems
      }, [])
      log('batchWrite responses', responses)
      if (unprocessedItems.length > 0) {
        console.error('[CR] unprocessedItems', unprocessedItems)
      }
      return
    } catch (e) {
      throw new Error(e.message)
    }
  }

  /**
   * Put items, `batchPut` call `batchWrite` internally,
   * @param {S[]} items
   * @returns {Promise<void>}
   */
  batchPut(items: S[]) {
    return this.batchWrite(
      items.map(item => ({
        PutRequest: {
          Item: item
        }
      }))
    )
  }

  /**
   *
   * Delete items, `batchDelete` call `batchWrite` internally,
   * @param {Partial<S>[]} keyMap - Key object
   * @returns {Promise<void>}
   */
  batchDelete(keyMap: Partial<S>[]) {
    return this.batchWrite(
      keyMap.map(key => ({
        DeleteRequest: {
          Key: key
        }
      }))
    )
  }

  get(_, __?) {
  }

  update(_, __?) {
  }

  delete(_, __?) {
  }

  /**
   * Update item and return Document(data)
   * @param hashKey
   * @param rangeKey
   * @param params
   * @returns {Promise<any>}
   * @protected
   */
  protected async doUpdate(hashKey, rangeKey, params) {
    try {
      const response = await this.engine.update(hashKey, rangeKey, params)
      log('doUpdate response', response)
      if (!response) {
        return null
      }
      return this.createDocument(response.Attributes, true)
    } catch (e) {
      log('doUpdate error', e.message, e.stack)
      throw new Error(e.message)
    }
  }
}

export class HashModel<S, H extends keyof S> extends Model<S, H> {
  /**
   * API - define HashKey only data type
   * @param {ReadableParams<S, H>} params
   */
  constructor(params: ReadableParams<S, H>) {
    super(params)
  }

  /**
   * Get Document from server
   * @param {S[H]} hashKey
   * @returns {Promise<Document<S>>}
   */
  async get(hashKey: S[H]): Promise<Document<S>> {
    try {
      const response = await this.engine.get(hashKey)
      if (!response || !response.Item) {
        log('error response', response)
        throw new Error(`Item not found, hash(${hashKey})`)
      }
      return this.createDocument(response.Item, true)
    } catch (e) {
      log({[this.hash]: hashKey})
      throw new Error(e.message)
    }
  }

  /**
   * Get `Update`
   * @param {S[H]} hashKey
   * @returns {Update<S>}
   */
  update(hashKey: S[H]) {
    return new Update<S>(this.doUpdate.bind(this, hashKey, undefined), this.options.document)
  }

  /**
   * Delete item
   * @param {S[H]} hashKey
   * @returns {Promise<this<S, H>>}
   */
  async delete(hashKey: S[H]) {
    try {
      const response = await this.engine.delete({
        [this.hash]: hashKey,
      })
      log('delete response', response)
      return this
    } catch (e) {
      log(e)
    }
  }
}

export class RangeModel<S, H extends keyof S, RK extends keyof S> extends Model<S, H, RK> {
  /**
   * API - define HashKey and RangeKey data type
   * @param {ReadableParams<S, H, RK>} params
   */
  constructor(params: ReadableParams<S, H, RK>) {
    super(params)
  }

  /**
   * Get Document from server
   * @param {S[H]} hashKey
   * @param {S[RK]} rangeKey
   * @returns {Promise<Document<S> | undefined>}
   */
  async get(hashKey: S[H], rangeKey: S[RK]): Promise<Document<S>|undefined> {
    try {
      const response = await this.engine.get(hashKey, rangeKey)
      if (!response || !response.Item) {
        log('error response', response)
        throw new Error(`Item not found, hash(${hashKey}), range(${rangeKey})`)
      }
      return this.createDocument(response.Item, true)
    } catch (e) {
      log({[this.hash]: hashKey, [this.range!]: rangeKey})
    }
  }

  /**
   * Get `Update`
   * @param {S[H]} hashKey
   * @param {S[RK]} rangeKey
   * @returns {Update<S>}
   */
  update(hashKey: S[H], rangeKey: S[RK]) {
    return new Update<S>(this.doUpdate.bind(this, hashKey, rangeKey), this.options.document)
  }

  /**
   * Delete item
   * @param {S[H]} hashKey
   * @param {S[RK]} rangeKey
   * @returns {Promise<this<S, H, RK>>}
   */
  async delete(hashKey: S[H], rangeKey: S[RK]) {
    try {
      const response = await this.engine.delete({
        [this.hash]: hashKey,
        [this.range!]: rangeKey,
      })
      log('delete response', response)
      return this
    } catch (e) {
      log(e)
    }
  }
}

interface WriteRequest<S> extends DocumentClient.WriteRequest {
  PutRequest?: {
    Item: S
  }
  DeleteRequest?: {
    Key: Partial<S>
  }
}
