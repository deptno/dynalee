import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import {Omit} from 'ramda'
import {replacementKeyGenerator, replacementValueGenerator} from '../../../engine/expression/helper'
import {Filter} from '../../../engine/operator/filter'
import {Updater} from '../../../engine/operator/updater'
import {ELogs, getLogger} from '../../../util/log'
import {Printable} from './printable'

type ScanInput = Omit<DocumentClient.ScanInput, 'TableName' | 'Key'>
type QueryInput = Omit<DocumentClient.QueryInput, 'TableName' | 'Key'>
type UpdateItemInput = Omit<DocumentClient.UpdateItemInput, 'TableName' | 'Key'>
type Input = ScanInput | QueryInput | UpdateItemInput
type Output = Omit<DocumentClient.ScanOutput | DocumentClient.QueryOutput, 'TableName'>

const log = getLogger(ELogs.ENGINE_ENGINE)

export abstract class Write<S, I extends Input> extends Printable<S, I> {
  protected genKey = replacementKeyGenerator()
  protected genValue = replacementValueGenerator()
  protected params = {} as Input
  protected updater = new Updater(this.genKey, this.genValue, (params) => this.merge(params, ','))

  update(setter: (and: Updater<S>) => void) {
    setter(this.updater)
    return this
  }

  condition(setter: (and: Filter<S>, or: Filter<S>, not: Filter<S>) => void) {
    console.log('@todo condition')
    setter(
      new Filter<S>(this.genKey, this.genValue, (params) => this.merge(params)),
      new Filter<S>(this.genKey, this.genValue, (params) => this.merge(params, 'OR')),
      new Filter<S>(this.genKey, this.genValue, (params) => this.merge(params, 'NOT')),
    )
    return this
  }

  protected preRun() {
    log('> preRun()')
    const expressions = this.updater.expressions.reduce((acc, exp) => {
      const [op, ...expression] = exp.split(' ')
      acc[op] = [acc[op], expression.join(' ')]
        .filter(Boolean)
        .join(', ')
      return acc
    }, {
      SET   : ``,
      REMOVE: ``,
      ADD   : ``,
      DELETE: ``,
    })
    const result = Object.entries(expressions)
      .filter(([_, exp]) => Boolean(exp))
      .map(([op, exp]) => `${op} ${exp}`)
      .join(' ')
      .trim()
    this.merge({[this.updater.expressionType]: result} as any, ',')
    log('< preRun()')
  }
}