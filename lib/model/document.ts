import {filenameLogger} from '../util/debug'
import {produce, Draft, applyPatches} from 'immer'
import {DocumentClient} from 'aws-sdk/clients/dynamodb'
import {Operator, DDBKeyType} from '../operator/operator'

export class Document<S, H extends DDBKeyType, R extends DDBKeyType> {
  /**
   * @todo: create History class
   */
  private undo = []
  private redo = []
  private current: S

  constructor(
    protected readonly tableName: string,
    protected readonly hashKeyName: H,
    protected readonly rangeKeyName: R,
    data: S,
  ) {
    log('new Model()', tableName, hashKeyName, rangeKeyName, data)
    this.current = Object.freeze(data)
  }

  private operator = new Operator<H, R>(this.tableName, this.hashKeyName, this.rangeKeyName)

  /**
   * @todo make it lazy
   * @todo immer already support record
   */
  set(setter: (draft: Draft<S>) => void) {
    log('set', this.current)
    this.current = produce(this.current, setter, (redos, undos) => {
      this.redo.push(...redos)
      this.undo.push(...undos)
    })
    return this.current
  }

  /*
   * @todo: for lazy, debug
   */
  private head() {
    return this.current
  }

  private base() {
    return applyPatches(this.head(), this.undo)
  }

  private keys() {
    return {
      [this.hashKeyName] : this.getHashKey(),
      [this.rangeKeyName]: this.getRangeKey(),
    }
  }

  private getHashKey() {
    return this.base()[this.hashKeyName as string]
  }

  private getRangeKey() {
    return this.base()[this.rangeKeyName as string]
  }

  /**
   * @todo check, is created from DB
   */
  async delete(params?: DocumentClient.DeleteItemInput) {
    log('delete', params)
    return this.operator.delete(this.getHashKey(), this.getRangeKey(), params)
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
    return this.operator.put(this.getHashKey(), this.getRangeKey(), params)
  }

  /**
   * @todo send diff only, use immer@>1.7.3 `isDraft`
   * @todo check [immer limiation](https://github.com/mweststrate/immer#limitations)
   */
  async update(params?) {
    params = {
      ...params,
      Item: this.head()
    }

    log('update', params)
    log('update', applyPatches(
      this.keys(), this.redo,
    ))
    return this.operator.update(this.getHashKey(), this.getRangeKey(), params)
  }
}

const log = filenameLogger(__filename)

