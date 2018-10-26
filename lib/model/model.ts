import {filenameLogger} from '../util/debug'
import {Operator, DDBKeyType} from '../operator/operator'
import {Document} from './document'
import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'

export class Model<S, H extends DDBKeyType, R extends DDBKeyType = never> {
  constructor(
    protected readonly tableName: string,
    protected readonly hashKeyName: H,
    protected readonly rangeKeyName: R
  ) {

  }

  private operator = new Operator(this.tableName, this.hashKeyName, this.rangeKeyName)

  of(data: S) {
    return new Document<S, H, R>(this.tableName, this.hashKeyName, this.rangeKeyName, data)
  }

  async batchGet(params?) {
  }

  async batchWrite(params?) {
  }

  async createSet(list, options) {
  }

  async delete(hash, range?, params?: DocumentClient.DeleteItemInput | null) {
    try {
      const response = await this.operator.delete(hash, range, params)
      log('delete response', response)
      return new Document(this.tableName, this.hashKeyName, this.rangeKeyName, null)
    } catch (e) {
      log(e)
    }
  }

  async get(hashKey, rangeKey?, params?): Promise<Document<S, H, R>> {
    try {
      const response = await this.operator.get(hashKey, rangeKey, params)
      if (!response.Item) {
        throw new Error(`Item not found, hash(${hashKey}, range(${rangeKey})`)
      }
      log('response', response)
      const model = new Document(this.tableName, this.hashKeyName, this.rangeKeyName, response.Item as S)
      return model
    } catch (e) {
      log(e)
    }
  }
}


const log = filenameLogger(__filename)

