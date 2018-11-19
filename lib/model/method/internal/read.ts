import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import debug from 'debug'
import {Omit} from 'ramda'
import {TScalar} from '../../../engine'
import {replacementKeyGenerator, replacementValueGenerator} from '../../../engine/expression/helper'
import {FilterOperator} from '../../../engine/operator/operator'
import {Printable} from './printable'

const log = debug(['dynalee', __filename].join(':'))

type ScanInput = Omit<DocumentClient.ScanInput, 'TableName' | 'Key'>
type QueryInput = Omit<DocumentClient.QueryInput, 'TableName' | 'Key'>
type Input = ScanInput|QueryInput

export abstract class Read<S, H extends TScalar> extends Printable<S ,H, Input> {
  protected genKey = replacementKeyGenerator()
  protected genValue = replacementValueGenerator()
  protected params = {} as Input

  project(expression: DocumentClient.ProjectionExpression) {
    console.warn('@todo implement project, any idea?')
    return this.merge({
      ProjectionExpression: expression
    })
  }

  filter(setter: (and: FilterOperator<S>, or: FilterOperator<S>) => void) {
    setter(
      FilterOperator.of(this.genKey, this.genValue, (params) => this.merge(params)),
      FilterOperator.of(this.genKey, this.genValue, (params) => this.merge(params, 'OR')),
    )
    return this
  }

  limit(limit: number) {
    return this.merge({Limit: limit})
  }

  consistent() {
    return this.merge({ConsistentRead: true})
  }

  startAt(lastEvaluatedKey: Partial<S>) {
    // @todo LastEvaluatedKey
    return this.merge({
      ExclusiveStartKey: lastEvaluatedKey
    })
  }
}