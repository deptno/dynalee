import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import {Omit} from 'ramda'
import {TScalar} from '../../engine'
import {ELogs, getLogger} from '../../util/log'
import {defaultModelOptions, DocumentOptions} from '../option'
import {Runner} from './internal/printable'
import {Write} from './internal/write'

const log = getLogger(ELogs.MODEL_METHOD_UPDATE_ITEM)

export class UpdateItem<S, H extends TScalar> extends Write<S, H, DxPreUpdateInput> {
  protected params = {
    ReturnValues: 'ALL_NEW'
  } as DxPreUpdateInput

  constructor(runner: Runner<S, H>, private options: DocumentOptions = defaultModelOptions.document!) {
    super(runner)
  }

  returnValue(returnType: DocumentClient.ReturnValue) {
    this.merge({
      ReturnValues: returnType
    })
    return this
  }

  protected preRun() {
    this.reviseUpdatedAt()
    super.preRun()
  }

  private reviseUpdatedAt() {
    if (!this.options.timestamp) {
      return
    }
    const {updatedAt} = this.options.timestamp
    if (!updatedAt) {
      return
    }
    const {attributeName, handler} = updatedAt
    log('reviseUpdatedAt', updatedAt)
    const rUpdatedAtKey = this.genKey()
    const rUpdatedAtValue = this.genValue()

    // @todo @fixme pattern is broken
    if (!this.params.ExpressionAttributeNames) {
      return
    }
    if (!this.params.ExpressionAttributeNames[attributeName]) {
      this.updater.expressions.push(`SET ${rUpdatedAtKey} = ${rUpdatedAtValue}`)
      this.merge({
        ExpressionAttributeNames : {
          [rUpdatedAtKey]: attributeName
        },
        ExpressionAttributeValues: {
          [rUpdatedAtValue]: handler()
        }
      })
    }
  }
}

type DxUpdateInput = Omit<DocumentClient.UpdateItemInput, 'TableName'>
type DxPreUpdateInput = Omit<DxUpdateInput, 'Key'>
