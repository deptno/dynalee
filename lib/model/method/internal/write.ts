import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import debug from 'debug'
import {Omit} from 'ramda'
import {TScalar} from '../../../engine'
import {replacementKeyGenerator, replacementValueGenerator} from '../../../engine/expression/helper'
import {FilterOperator} from '../../../engine/operator/operator'
import {Updater} from '../../../engine/operator/updater'
import {Printable} from './printable'

const log = debug(['dynalee', __filename].join(':'))

type ScanInput = Omit<DocumentClient.ScanInput, 'TableName' | 'Key'>
type QueryInput = Omit<DocumentClient.QueryInput, 'TableName' | 'Key'>
type UpdateItemInput = Omit<DocumentClient.UpdateItemInput, 'TableName' | 'Key'>
type Input = ScanInput|QueryInput|UpdateItemInput
type Output = Omit<DocumentClient.ScanOutput | DocumentClient.QueryOutput, 'TableName'>

export abstract class Write<S, H extends TScalar, I extends Input> extends Printable<S, H, I> {
  protected genKey = replacementKeyGenerator()
  protected genValue = replacementValueGenerator()
  protected params = {} as Input

  update(setter: (and: Updater<S>) => void) {
    setter(
      Updater.of(this.genKey, this.genValue, (params) => this.merge(params)),
    )
    return this
  }

  condition(setter: (and: FilterOperator<S>, or: FilterOperator<S>, not: FilterOperator<S>) => void) {
    setter(
      FilterOperator.of(this.genKey, this.genValue, (params) => this.merge(params)),
      FilterOperator.of(this.genKey, this.genValue, (params) => this.merge(params, 'OR')),
      FilterOperator.of(this.genKey, this.genValue, (params) => this.merge(params, 'NOT')),
    )
    return this
  }
//  UpdateExpression
//  ConditionExpression
//  ExpressionAttributeNames
//  ExpressionAttributeValues
}