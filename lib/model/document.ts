import {DocumentClient} from 'aws-sdk/clients/dynamodb'
import {applyPatches, Draft, Patch, produce} from 'immer'
import {Engine, TScalar} from '../engine'
import {applyItemOptions} from '../options/apply-item-options'
import debug from 'debug'
import {dynamodbDoc} from '../util/dynamodb-document'
import {ModelOptions} from './model'

export class Document<S, H extends TScalar, R extends TScalar = never> {
  /**
   * @todo: create History class
   */
  private undo: Patch[] = []
  private redo: Patch[] = []
  private current: S

  constructor(
    protected readonly engine: Engine<H, R>,
    protected readonly tableName: string,
    protected readonly hashKeyName: string,
    protected readonly rangeKeyName: string|undefined,
    data: S,
    private readonly options?: ModelOptions,
  ) {
    logger('new Document()', tableName, hashKeyName, rangeKeyName, data)
    this.current = Object.freeze(dynamodbDoc(data))
  }

  /**
   * @todo make it lazy
   * @todo immer already support record
   */
  set(setter: (draft: Draft<S>) => void) {
    logger('set', this.current)
    this.current = produce(this.current, setter, (redos, undos) => {
      this.redo.push(...redos)
      this.undo.push(...undos)
    })
    return this
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
    logger('delete', params)
    return this.engine.delete(this.getHashKey(), this.getRangeKey(), params)
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
  async put(params?) {
    params = {
      ...params,
      Item: applyItemOptions(this.head(), this.options)
    }
    logger('put', params)
    try {
      const result = await this.engine.put(this.getHashKey(), this.getRangeKey(), params)
      return result.$response.data
    } catch(e) {
      logger('error put', e)
    }
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

    logger('update', params)
    logger('update', applyPatches(
      this.keys(), this.redo,
    ))
    return this.engine.update(this.getHashKey(), this.getRangeKey(), params)
  }
}

const logger = debug(['dynalee', __filename].join(':'))

