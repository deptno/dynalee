import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import {Omit} from 'ramda'
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

  /**
   * Run runner
   * @returns {Promise<OutputProxy<S>>}
   */
  run() {
    this.preRun()
    log('runner() params')
    log(this.params)
    return this.runner(this.params) as Promise<OutputProxy<S>>
  }

  /**
   * Set project expression
   * @param {DocumentClient.ProjectionExpression} expression
   * @returns {this<S>}
   * @todo It is raw level now.
   */
  project(expression: DocumentClient.ProjectionExpression) {
    console.warn('@todo implement project, any idea?')
    return this.merge({
      ProjectionExpression: expression
    })
  }

  /**
   * Set filter to filtering result
   * @param {(and: Filter<S>, or: Filter<S>) => void} setter
   * @returns {this<S>}
   */
  filter(setter: (and: Filter<S>, or: Filter<S>) => void) {
    setter(
      new Filter(this.genKey, this.genValue, (params) => this.merge(params)),
      new Filter(this.genKey, this.genValue, (params) => this.merge(params, 'OR')),
    )
    return this
  }

  /**
   * Limit result count
   * @param {number} limit
   * @returns {this<S>}
   */
  limit(limit: number) {
    if (typeof limit !== 'number') {
      return this.merge({Limit: 1})
    }
    return this.merge({Limit: limit})
  }

  /**
   * Set ConsistentRead
   * @returns {this<S>}
   */
  consistent() {
    return this.merge({ConsistentRead: true})
  }

  /**
   * Get items from
   * @param {Partial<S>} lastEvaluatedKey
   * @returns {this<S>}
   */
  startAt(lastEvaluatedKey?: Partial<S>) {
    if (!lastEvaluatedKey) {
      return this
    }
    return this.merge({
      ExclusiveStartKey: lastEvaluatedKey
    })
  }
}