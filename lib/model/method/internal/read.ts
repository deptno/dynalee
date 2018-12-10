import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import {Omit} from 'ramda'
import {TScalar} from '../../../engine'
import {replacementKeyGenerator, replacementValueGenerator} from '../../../engine/expression/helper'
import {Filter} from '../../../engine/operator/filter'
import {ELogs, getLogger} from '../../../util/log'
import {OutputProxy, Printable} from './printable'

type ScanInput = Omit<DocumentClient.ScanInput, 'TableName' | 'Key'>
type QueryInput = Omit<DocumentClient.QueryInput, 'TableName' | 'Key'>
type Input = ScanInput | QueryInput

const log = getLogger(ELogs.MODEL_METHOD_INTERNAL_READ)

export abstract class Read<S> extends Printable<S, Input> {
  protected genKey = replacementKeyGenerator()
  protected genValue = replacementValueGenerator()
  protected params = {} as Input

  run() {
    this.preRun()
    log('runner() params')
    log(this.params)
    return this.runner(this.params) as Promise<OutputProxy<S>>
  }

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
    if (!lastEvaluatedKey) {
      return this
    }
    return this.merge({
      ExclusiveStartKey: lastEvaluatedKey
    })
  }
}