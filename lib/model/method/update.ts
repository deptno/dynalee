import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import {Omit} from 'ramda'
import {dynamodbValue} from '../../util/dynamodb-document'
import {ELogs, getLogger} from '../../util/log'
import {Document} from '../document'
import {defaultModelOptions, DocumentOptions} from '../option'
import {Runner} from './internal/printable'
import {Write} from './internal/write'

const log = getLogger(ELogs.MODEL_METHOD_UPDATE_ITEM)

export class Update<S> extends Write<S, DxPreUpdateInput> {
  protected params = {
    ReturnValues: 'ALL_NEW'
  } as DxPreUpdateInput

  constructor(runner: Runner<S>, private options: DocumentOptions = defaultModelOptions.document!) {
    super(runner)
  }

  run() {
    this.preRun()
    return this.runner(this.params) as Promise<Document<S>>
  }

  returnValue(returnType: DocumentClient.ReturnValue) {
    this.params.ReturnValues = returnType
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
    this.options.onCreate.forEach(trigger => {
      const {attributeName, handler} = trigger
      const rKey = this.genKey()
      const rValue = this.genValue()

      // @todo @fixme pattern is broken
      if (!this.params.ExpressionAttributeNames) {
        console.error('unpredictablee error')
        return
      }
      if (!this.params.ExpressionAttributeNames[attributeName]) {
        this.updater.expressions.push(`SET ${rKey} = if_not_exists(${rKey}, ${rValue})`)
        this.merge({
          ExpressionAttributeNames : {
            [rKey]: attributeName
          },
          ExpressionAttributeValues: {
            [rValue]: dynamodbValue(handler())
          }
        })
      }
    })
    this.options.onUpdate.forEach(trigger => {
        const {attributeName, handler} = trigger
        const rKey = this.genKey()
        const rValue = this.genValue()

        // @todo @fixme pattern is broken
        if (!this.params.ExpressionAttributeNames) {
          console.error('unpredictablee error')
          return
        }
        if (!this.params.ExpressionAttributeNames[attributeName]) {
          this.updater.expressions.push(`SET ${rKey} = ${rValue}`)
          this.merge({
            ExpressionAttributeNames : {
              [rKey]: attributeName
            },
            ExpressionAttributeValues: {
              [rValue]: dynamodbValue(handler())
            }
          })
        }
      })
  }
}

type DxUpdateInput = Omit<DocumentClient.UpdateItemInput, 'TableName'>
type DxPreUpdateInput = Omit<DxUpdateInput, 'Key'>
