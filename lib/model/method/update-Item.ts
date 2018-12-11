import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import {Omit} from 'ramda'
import {dynamodbValue} from '../../util/dynamodb-document'
import {ELogs, getLogger} from '../../util/log'
import {Document} from '../document'
import {defaultModelOptions, DocumentOptions} from '../option'
import {Runner} from './internal/printable'
import {Write} from './internal/write'

const log = getLogger(ELogs.MODEL_METHOD_UPDATE_ITEM)

export class UpdateItem<S> extends Write<S, DxPreUpdateInput> {
  protected params = {
    ReturnValues: 'ALL_NEW'
  } as DxPreUpdateInput

  constructor(runner: Runner<S>, private options: DocumentOptions = defaultModelOptions.document!) {
    super(runner)
  }

  run() {
    this.preRun()
    log('run() params')
    log(this.params)
    return this.runner(this.params) as Promise<Document<S>>
  }

  returnValue(returnType: DocumentClient.ReturnValue) {
    this.merge({
      ReturnValues: returnType
    })
    return this
  }

  protected preRun() {
    this.revise()
    super.preRun()
  }

  private revise() {
    if (!this.options) {
      return
    }
    this.options.onUpdate
      .forEach(trigger => {
        const {attributeName, handler} = trigger
        const rUpdatedAtKey = this.genKey()
        const rUpdatedAtValue = this.genValue()

        // @todo @fixme pattern is broken
        if (!this.params.ExpressionAttributeNames) {
          console.error('unpredictablee error')
          return
        }
        if (!this.params.ExpressionAttributeNames[attributeName]) {
          this.updater.expressions.push(`SET ${rUpdatedAtKey} = ${rUpdatedAtValue}`)
          this.merge({
            ExpressionAttributeNames : {
              [rUpdatedAtKey]: attributeName
            },
            ExpressionAttributeValues: {
              [rUpdatedAtValue]: dynamodbValue(handler())
            }
          })
        }
      })
  }
}

type DxUpdateInput = Omit<DocumentClient.UpdateItemInput, 'TableName'>
type DxPreUpdateInput = Omit<DxUpdateInput, 'Key'>
