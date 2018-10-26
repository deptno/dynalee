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
    return next
  }

  /*
   * @todo: for lazy, debug
   */
  revision() {
    return this.history
  }

  head() {
    return head(this.history)
  }

  base() {
    return last(this.history)
  }

  /**
   * @todo check, is created from DB
   */
  async delete(params?: DocumentClient.DeleteItemInput) {
    const data = this.base()
    log('delete', this.hashKeyName, this.rangeKeyName, data)
    return this.operator.delete(data[this.hashKeyName as string], data[this.rangeKeyName as string], params)
  }

  async put(params?) {
    params = {
      ...params,
      Item: this.head()
    }
    return this.operator.put(this.hashKeyName, this.rangeKeyName, params)
  }

  async update(params?) {
    params = {
      ...params,
      Item: this.head()
    }
    return this.operator.update(this.hashKeyName, this.rangeKeyName, params)
  }
}

const log = filenameLogger(__filename)

