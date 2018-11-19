import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import debug from 'debug'
import {Omit} from 'ramda'
import {TScalar} from '../../engine'
import {defaultModelOptions, DocumentOptions} from '../option'
import {Runner} from './internal/printable'
import {Write} from './internal/write'

const log = debug(['dynalee', __filename].join(':'))

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
  }

  private reviseUpdatedAt() {
    const {updatedAt} = this.options.timestamp
    if (!updatedAt) {
      return
    }
    const {attributeName, handler} = updatedAt
    const rUpdatedAtKey = this.genKey()
    const rUpdatedAtValue = this.genValue()
    if (!this.params.UpdateExpression!.includes(attributeName)) {
      this.merge({
        UpdateExpression         : `SET ${rUpdatedAtKey} = ${rUpdatedAtValue}`,
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
