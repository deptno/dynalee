import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import * as R from 'ramda'
import {triggerReducer} from '../options/trigger-reducer'
import {dynamodbDoc} from '../util/dynamodb-document'
import {ELogs, getLogger} from '../util/log'
import {Document} from './document'
import {UpdateItem} from './method/update-item'
import {Readable, ReadableParams} from './readable'

const log = getLogger(ELogs.MODEL_MODEL)

abstract class Model<S, H extends keyof S, RK extends keyof S = never> extends Readable<S, H, RK> {
  of(data: S) {
    return this.createDocument(data)
  }

  /**
   * @deprecated @todo
   */
  async batchGet() {
    console.warn('@todo implement batchGet')
  }

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
      console.log('batchWrite responses', responses)
      if (unprocessedItems.length > 0) {
        console.error('[CR] unprocessedItems', unprocessedItems)
      }
      return
    } catch (e) {
      throw new Error(e.message)
    }
  }

  batchPut(items: S[]) {
    return this.batchWrite(
      items.map(item => ({
        PutRequest: {
          Item: item
        }
      }))
    )
  }

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
  constructor(params: ReadableParams<S, H>) {
    super(params)
  }

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

  update(hashKey: S[H]) {
    return new UpdateItem<S>(this.doUpdate.bind(this, hashKey, undefined), this.options.document)
  }

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
  constructor(params: ReadableParams<S, H, RK>) {
    super(params)
  }

  async get(hashKey: S[H], rangeKey: S[RK]): Promise<Document<S>> {
    try {
      const response = await this.engine.get(hashKey, rangeKey)
      if (!response || !response.Item) {
        log('error response', response)
        throw new Error(`Item not found, hash(${hashKey}, range(${rangeKey})`)
      }
      return this.createDocument(response.Item, true)
    } catch (e) {
      log({[this.hash]: hashKey, [this.range!]: rangeKey})
      throw new Error(e.message)
    }
  }

  update(hashKey: S[H], rangeKey: S[RK]) {
    return new UpdateItem<S>(this.doUpdate.bind(this, hashKey, rangeKey), this.options.document)
  }

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
