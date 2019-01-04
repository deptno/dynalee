import {DocumentClient} from 'aws-sdk/clients/dynamodb'
import {Draft, produce} from 'immer'
import {Omit} from 'ramda'
import {Engine, TScalar} from '../engine'
import {dynamodbDoc, jsDoc} from '../util/dynamodb-document'
import {ELogs, getLogger} from '../util/log'

const log = getLogger(ELogs.MODEL_DOCUMENT)

export class Document<S> {
  private current: S
  private readonly original: S

  constructor(
    private readonly engine: Engine,
    private readonly tableName: string,
    private readonly hashKeyName: string,
    private readonly rangeKeyName: string | undefined,
    private readonly sureExistOnDb: boolean,
    data: S,
  ) {
    this.current = dynamodbDoc(data)
    this.original = Object.freeze(this.current)
  }

  /**
   * Set item values via setter
   * @param {(draft: Draft<S>) => void} setter
   * @returns {this<S>}
   */
  set(setter: (draft: Draft<S>) => void) {
    this.current = produce(this.current, setter)
    return this
  }

  /**
   * Return current data
   * @param {boolean} pureJs - Transform DynamoDB oriented data type to javascript object
   * @param {(arrayIndicatesSet: TScalar[]) => TScalar[]} transformSetTo - type `Set` transform function
   * @returns {S}
   */
  head(pureJs = false, transformSetTo?: (arrayIndicatesSet: TScalar[]) => TScalar[]): S {
    if (pureJs) {
      return jsDoc(this.current, transformSetTo)
    }
    return this.current
  }

  /**
   * Delete item
   * @returns {Promise<DocumentClient.DeleteItemOutput | null>}
   */
  async delete() {
    const keys: DocumentClient.DeleteItemInput['Key'] = this.keys()
    return this.engine.delete(keys)
  }

  /**
   * Put item
   * @returns {Promise<this<S>>}
   */
  async put() {
    log('put overwrite', this.sureExistOnDb)
    const params = {} as Omit<DocumentClient.PutItemInput, 'TableName'>

    try {
      this.triggerIfUnsureExistsOnServer(params)
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

  /*
   * Do not overwrite item when it exists on server
   * @param params
   * @private
   */
  private triggerIfUnsureExistsOnServer(params) {
    if (!this.sureExistOnDb) {
      // @todo need refactoring
      params.ConditionExpression = `attribute_not_exists(#HSK)`
      params.ExpressionAttributeNames = {
        '#HSK': this.hashKeyName
      }
      this.engine.options.onCreate.forEach(({attributeName, handler}) =>
        this.set(setter => void (setter[attributeName] = handler()))
      )
    } else {

    }
  }

  /*
   * Return keys
   * @returns {any}
   * @private
   */
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

  /*
   * Return HashKey
   * @returns {TScalar}
   * @private
   */
  private getHashKey(): TScalar {
    return this.original[this.hashKeyName]
  }

  /*
   * Return RangeKey
   * @returns {TScalar | undefined}
   * @private
   */
  private getRangeKey(): TScalar | undefined {
    return this.original[this.rangeKeyName!]
  }

}

