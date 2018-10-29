import {DocumentClient} from 'aws-sdk/clients/dynamodb'
import {applyPatches, Draft, Patch, produce} from 'immer'
import {TScalar, Operator} from '../operator/operator'
import {getLogger} from '../util/debug'
import {applyItemOptions} from '../options/apply-item-options'
import {ModelOptions} from './model'

export class Document<S, H extends TScalar, R extends TScalar> {
  /**
   * @todo: create History class
   */
  private undo: Patch[] = []
  private redo: Patch[] = []
  private current: S

  constructor(
    protected readonly tableName: string,
    protected readonly hashKeyName: string,
    protected readonly rangeKeyName: string|undefined,
    data: S,
    private readonly options?: ModelOptions,
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

  /**
   * @todo for lazy, debug
   */
  head() {
    return this.current
  }

  private base() {
    return applyPatches(this.head(), this.undo)
  }

  private keys() {
    if (this.rangeKeyName) {
      return {
        [this.hashKeyName] : this.getHashKey(),
        [this.rangeKeyName]: this.getRangeKey(),
      }
    }
    return {
      [this.hashKeyName] : this.getHashKey(),
    }
  }

  private getHashKey(): H {
    return this.base()[this.hashKeyName]
  }

  private getRangeKey(): R|undefined {
    if (this.rangeKeyName) {
      return this.base()[this.rangeKeyName]
    }
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

  /**
   * @todo apply options
   * @param params
   * @returns {Request<DocumentClient.PutItemOutput, AWSError>}
   */
  put(params?) {
    params = {
      ...params,
      Item: applyItemOptions(this.head(), this.options)
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

const log = getLogger(__filename)

