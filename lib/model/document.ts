import {DocumentClient} from 'aws-sdk/clients/dynamodb'
import {applyPatches, Draft, Patch, produce} from 'immer'
import {Engine, TScalar} from '../engine'
import {dynamodbDoc} from '../util/dynamodb-document'
import {ELogs, getLogger} from '../util/log'

const log = getLogger(ELogs.MODEL_DOCUMENT)

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
    protected readonly rangeKeyName: string | undefined,
    data: S,
  ) {
    log('new Document()', tableName, hashKeyName, rangeKeyName, data)
    this.current = Object.freeze(dynamodbDoc(data))
  }

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
      [this.hashKeyName]: this.getHashKey(),
    }
  }

  private getHashKey(): H {
    return this.base()[this.hashKeyName]
  }

  private getRangeKey(): R | undefined {
    if (this.rangeKeyName) {
      return this.base()[this.rangeKeyName]
    }
  }

  /**
   * @todo check, is created from DB
   */
  async delete(params?: DocumentClient.DeleteItemInput) {
    log('delete', params)
    const keys: DocumentClient.DeleteItemInput['Key'] = {
      [this.hashKeyName]: this.getHashKey()
    }
    if (this.rangeKeyName) {
      keys.push({
        [this.rangeKeyName]: this.getRangeKey()
      })
    }
    return this.engine.delete(keys, params)
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
      Item: this.head()
    }
    log('put', params)
    try {
      const response = await this.engine.put(this.getHashKey(), this.getRangeKey(), params)
      if (!response) {
        log('put response', response)
        return
      }
      return this
    } catch (e) {
      log('error put', e)
    }
  }

  /**
   * @deprecated It's not implemented
   * @todo send diff only, use immer@>1.7.3 `isDraft`
   * @todo check [immer limiation](https://github.com/mweststrate/immer#limitations)
   */
  async update(params?) {
    params = {
      ...params,
      Item: this.head()
    }

    log('update', params)
    log('update', applyPatches(this.keys(), this.redo,))
    return this.engine.update(this.getHashKey(), this.getRangeKey(), params)
  }
}

