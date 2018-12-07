import {DocumentClient} from 'aws-sdk/clients/dynamodb'
import {applyPatches, Draft, Patch, produce} from 'immer'
import {Omit} from 'ramda'
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
    private readonly sureExistOnDb: boolean,
    data: S,
  ) {
    this.current = Object.freeze(dynamodbDoc(data))
  }

  set(setter: (draft: Draft<S>) => void) {
    this.current = produce(this.current, setter, (redos, undos) => {
      this.redo.push(...redos)
      this.undo.push(...undos)
    })
    return this
  }

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
  async delete() {
    const keys: DocumentClient.DeleteItemInput['Key'] = {
      [this.hashKeyName]: this.getHashKey()
    }
    if (this.rangeKeyName) {
      keys.push({
        [this.rangeKeyName]: this.getRangeKey()
      })
    }
    return this.engine.delete(keys)
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
  async put() {
    log('put overwrite', this.sureExistOnDb)
    const params = {} as Omit<DocumentClient.PutItemInput, 'TableName'>
    try {
      // Do not overwrite item when it exists on server
      if (!this.sureExistOnDb) {
        params.ConditionExpression = `attribute_not_exists(#HSK)`
        params.ExpressionAttributeNames = {
          '#HSK': this.hashKeyName
        }
        this.engine.options.onCreate
          .forEach(({attributeName, handler}) => this.set(setter => void (setter[attributeName] = handler())))
      }

      this.engine.options.onUpdate
        .forEach(({attributeName, handler}) => this.set(setter => void (setter[attributeName] = handler())))

      params.Item = this.head()
      const response = await this.engine.put(params)
      log('put response', response)
      if (!response) {
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
    return this.engine.update(this.getHashKey(), this.getRangeKey(), params)
  }
}

