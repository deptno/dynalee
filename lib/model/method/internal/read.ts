import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import {Omit} from 'ramda'
import {TScalar} from '../../../engine'
import {replacementKeyGenerator, replacementValueGenerator} from '../../../engine/expression/helper'
import {Filter} from '../../../engine/operator/filter'
import {Printable} from './printable'

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

  filter(setter: (and: Filter<S>, or: Filter<S>) => void) {
    setter(
      Filter.of(this.genKey, this.genValue, (params) => this.merge(params)),
      Filter.of(this.genKey, this.genValue, (params) => this.merge(params, 'OR')),
    )
    return this
  }

  limit(limit: number) {
    if (typeof limit !== 'number') {
      return this.merge({Limit: 1})
    }
    return this.merge({Limit: limit})
  }

  consistent() {
    return this.merge({ConsistentRead: true})
  }

  startAt(lastEvaluatedKey?: Partial<S>) {
    // @todo LastEvaluatedKey
    if (!lastEvaluatedKey) {
      return this
    }
    return this.merge({
      ExclusiveStartKey: lastEvaluatedKey
    })
  }
}