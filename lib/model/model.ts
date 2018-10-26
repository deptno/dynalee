import {filenameLogger} from '../util/debug'
import produce from 'immer'
import {head, last} from 'ramda'
import {DocumentClient} from 'aws-sdk/clients/dynamodb'
import {Operator, DDBKeyType} from '../operator/operator'

export class Model<S, H extends DDBKeyType, R extends DDBKeyType> {
  /**
   * @todo: create History class
   */
  private history: S[] = [Object.assign({}, this.original)]

  constructor(
    protected readonly tableName: string,
    protected readonly hashKeyName: H,
    protected readonly rangeKeyName: R,
    protected readonly original: S,
  ) {
    log('new Model()', tableName, hashKeyName, rangeKeyName, original)
  }

  private operator = new Operator<H, R>(this.tableName, this.hashKeyName, this.rangeKeyName)

  /**
   * @todo make it lazy
   */
  set(setter: (this: S, draft: S) => void) {
    const next = produce(this.original, setter.bind(this))
    this.history.unshift(next)
    log('set', next)
    return next
  }

  /*
   * @todo: for lazy, debug
   */
  private head() {
    return head(this.history)
  }

  private base() {
    return last(this.history)
  }

  private getHashKey() {
    return this.base()[this.hashKeyName as string]
  }

  private getSortKey() {
    return this.base()[this.rangeKeyName as string]
  }

  /**
   * @todo check, is created from DB
   */
  async delete(params?: DocumentClient.DeleteItemInput) {
    log('delete', params)
    return this.operator.delete(this.getHashKey(), this.getSortKey(), params)
  }

  /**
   * @todo is it need?
   */
  async undelete() {

  }

  async put(params?) {
    params = {
      ...params,
      Item: this.head()
    }
    log('put', params)
    return this.operator.put(this.getHashKey(), this.getSortKey(), params)
  }

  /**
   * @todo send diff only
   */
  async update(params?) {
    params = {
      ...params,
      Item: this.head()
    }
    log('update', params)
    return this.operator.update(this.getHashKey(), this.getSortKey(), params)
  }
}

const log = filenameLogger(__filename)

