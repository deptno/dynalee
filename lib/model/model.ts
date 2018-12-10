import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import * as R from 'ramda'
import {TScalar} from '../engine'
import {triggerReducer} from '../options/trigger-reducer'
import {dynamodbDoc} from '../util/dynamodb-document'
import {ELogs, getLogger} from '../util/log'
import {Document} from './document'
import {UpdateItem} from './method/update-item'
import {Readable, ReadableParams} from './readable'

const log = getLogger(ELogs.MODEL_MODEL)

export class Model<S, H extends TScalar, RK extends TScalar = never> extends Readable<S, H, RK> {
  constructor(params: ReadableParams<S>) {
    super(params)
  }

  static define<S, H extends TScalar, RK extends TScalar = never>(params: ReadableParams<S>) {
    return new Model<S, H, RK>(params)
  }

  of(data: S) {
    return this.createDocument(data)
  }

  //  async batchGet(params?) {
  //    console.warn('@todo implement batchGet')
  //  }

  async batchWrite(items: DocumentClient.WriteRequest[]) {
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

  async batchPut(items: S[]) {
    return this.batchWrite(
      items.map(item => ({
        PutRequest: {
          Item: item
        }
      }))
    )
  }

  async batchDelete(keys: DocumentClient.Key[]) {
    return this.batchWrite(
      keys.map(key => ({
        DeleteRequest: {
          Key: key
        }
      }))
    )
  }

  async get(hashKey: H, rangeKey?: RK, params?): Promise<Document<S>>
  async get(hashKey: H, params?): Promise<Document<S>>
  async get(hashKey, rangeKey?, params?) {
    try {
      const response = await this.engine.get(hashKey, rangeKey, params)
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

  updateItem(hashKey: H, rangeKey?: RK) {
    return new UpdateItem<S>(this.doUpdate.bind(this, hashKey, rangeKey), this.options.document)
  }

  async deleteItem(keys: Partial<S>) {
    try {
      const response = await this.engine.delete(keys)
      log('delete response', response)
      return this
    } catch (e) {
      log(e)
    }
  }

  private async doUpdate(hashKey, rangeKey, params) {
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

