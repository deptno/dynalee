import {filenameLogger} from '../util/debug'
import {Operator, DDBKeyType} from '../operator/operator'
import {Model} from './model'
import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'

export class Incubator<S, H extends DDBKeyType, R extends DDBKeyType = never> {
  constructor(
    protected readonly tableName: string,
    protected readonly hashKeyName: H,
    protected readonly rangeKeyName: R
  ) {

  }

  private operator = new Operator(this.tableName, this.hashKeyName, this.rangeKeyName)

  of(data: S) {
    return new Model<S, H, R>(this.tableName, this.hashKeyName, this.rangeKeyName, data)
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
      //fixme
      log('delete response', response)
      return new Model(this.tableName, this.hashKeyName, this.rangeKeyName, null)
    } catch (e) {
      log(e)
    }
  }

  async get(hashKey, rangeKey?, params?): Promise<Model<S, H, R>> {
    try {
      const response = await this.operator.get(hashKey, rangeKey, params)
      if (!response.Item) {
        throw new Error(`Item not found, hash(${hashKey}, range(${rangeKey})`)
      }
      const model = new Model(this.tableName, this.hashKeyName, this.rangeKeyName, response.Item as S)
      model.set(model => {
        model[this.hashKeyName as string] = hashKey
        if (this.rangeKeyName) {
          model[this.rangeKeyName as string] = rangeKey
        }
      })
      return model
    } catch (e) {
      log(e)
    }
  }
}


const log = filenameLogger(__filename)

