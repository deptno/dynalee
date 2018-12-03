import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import {compose, unary} from 'ramda'
import {TScalar} from '../engine'
import {dynamodbDoc} from '../util/dynamodb-document'
import {ELogs, getLogger} from '../util/log'
import {Document} from './document'
import {UpdateItem} from './method/update-item'
import {Readable, ReadableParams} from './readable'

const log = getLogger(ELogs.MODEL_MODEL)

export class Model<S, H extends TScalar, R extends TScalar = never> extends Readable<S, H, R> {
  constructor(params: ReadableParams<S, H, R>) {
    super(params)
  }

  static define<S, H extends TScalar, R extends TScalar = never>(params: ReadableParams<S, H, R>) {
    return new Model<S, H, R>(params)
  }

  of(data: S) {
    return this.createDocument(data)
  }

  /**
   * @deprecated It's not implemented yet.
   * @todo apply options, is it good to Use `Document`?
   */
  async batchGet(params?) {
    console.warn('@todo implement batchGet')
  }

  private createPutRequestItem = (item: S) => {
    if (!this.options.document || !this.options.document.timestamp) {
      return {
        PutRequest: {
          Item: item
        }
      }
    }
    const {createdAt, updatedAt} = this.options.document.timestamp
    const change = {}
    if (createdAt && item[createdAt.attributeName] === undefined) {
      change[createdAt.attributeName] = createdAt.handler()
    }
    if (updatedAt) {
      change[updatedAt.attributeName] = updatedAt.handler()
    }
    return {
      PutRequest: {
        Item: Object.assign(change, item)
      }
    }
  }

  /**
   * @deprecated It's not implemented yet.
   */
  async batchWrite(updateItems: S[], deleteKeys: Partial<S>[]) {
    const params = {
      RequestItems: {
        [this.table]: [
          ...updateItems.map(compose(this.createPutRequestItem, unary(dynamodbDoc))),
          ...deleteKeys.map(key => ({
            DeleteRequest: {
              Key: key
            }
          }))
        ]
      }
    }
  }

  async batchPut(items: S[]) {
    const params = {
      RequestItems: {
        [this.table]: items.map(compose(this.createPutRequestItem, unary(dynamodbDoc)))
      },
    }
    try {
      const response = await this.engine.batchWrite(params)
      log('batchPut response', response)
      if (!response) {
        return
      }
      if (response.UnprocessedItems) {
        const unprocessedItems = Object.keys(response.UnprocessedItems)
        if (unprocessedItems) {
          /**
           * @todo back-off, or use queue
           */
          response.UnprocessedItems
        }
      }
      return response.$response.data
    } catch (e) {
      throw new Error(e.message)
    }
  }

  // @fixme replace Key[]
  async batchDelete(keys: DocumentClient.Key[]) {
    const params = {
      RequestItems: {
        [this.table]: keys.map(key => ({
          DeleteRequest: {
            Key: key
          }
        }))
      }
    }
    try {
      const response = await this.engine.batchWrite(params)
      log('batchDelete response', response)
      if (!response) {
        return
      }
      if (response.UnprocessedItems) {
        const unprocessedItems = Object.keys(response.UnprocessedItems)
        if (unprocessedItems) {
          /**
           * @todo back-off, or use queue
           */
          response.UnprocessedItems
        }
      }
      return response.$response.data
    } catch (e) {
      throw new Error(e.message)
    }
  }

  private async doUpdate(hashKey, rangeKey, params) {
    try {
      const response = await this.engine.update(hashKey, rangeKey, params)
      log('doUpdate response', response)
      return response
    } catch (e) {
      log('doUpdate error', e.message, e.stack)
      throw new Error(e.message)
    }
  }

  async get(hashKey: H, rangeKey?: R, params?): Promise<Document<S, H, R>>
  async get(hashKey: H, params?): Promise<Document<S, H, R>>
  async get(hashKey, rangeKey?, params?) {
    try {
      const response = await this.engine.get(hashKey, rangeKey, params)
      log('response', response)
      if (!response) {
        throw new Error(`Item not found, hash(${hashKey}, range(${rangeKey})`)
      }
      if (!response.Item) {
        throw new Error(`Item not found, hash(${hashKey}, range(${rangeKey})`)
      }
      log('get response', response)
      return this.createDocument(response.Item)
    } catch (e) {
      log({[this.hash]: hashKey, [this.range!]: rangeKey})
      throw new Error(e.message)
    }
  }

  updateItem(hashKey: H, rangeKey?: R) {
    return new UpdateItem<S, H>(this.doUpdate.bind(this, hashKey, rangeKey), this.options.document)
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

  async delete(keys: Partial<S>, params: DocumentClient.DeleteItemInput)
  async delete(keys: Partial<S>)
  async delete(keys: Partial<S>, params?) {
    try {
      log('delete params', keys, params)
      const response = await this.engine.delete(keys, params)
      log('delete response', response)
      return this
    } catch (e) {
      log(e)
    }
  }
}

