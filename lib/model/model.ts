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

  async delete(hashKey: H, rangeKey?: R, params?: DocumentClient.DeleteItemInput | null) {
    try {
      const response = await this.operator.delete(hashKey, rangeKey, params)
      log('delete response', response)
      return new Document(this.tableName, this.hashKeyName, this.rangeKeyName, null)
    } catch (e) {
      log(e)
    }
  }

  async get(hashKey: H, rangeKey?: R, params?): Promise<Document<S, H, R>> {
    try {
      const response = await this.operator.get(hashKey, rangeKey, params)
      if (!response.Item) {
        throw new Error(`Item not found, hash(${hashKey}, range(${rangeKey})`)
      }
      log('response', response)
      const model = new Document(this.tableName, this.hashKeyName, this.rangeKeyName, response.Item as S)
      return model
    } catch (e) {
      log({[this.hashKeyName]: hashKey, [this.rangeKeyName]: rangeKey})
      log(e)
      throw new Error(e.message)
    }
  }
}

const log = filenameLogger(__filename)

