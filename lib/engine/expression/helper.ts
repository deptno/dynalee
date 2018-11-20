import nca, {ALPHABET_ASCII} from 'number-converter-alphabet'
import {ELogs, getLogger} from '../../util/log'
import {OperatorGenerator, Generator, TConnector, Operated} from './type'

type OperatorConnector = (...operators: OperatorGenerator[]) => OperatorGenerator
type OperatorConnectorCreator = (connector: TConnector) => OperatorConnector

const log = getLogger(ELogs.ENGINE_ENGINE)
const createOperatorConnector: OperatorConnectorCreator = (connector: TConnector) =>
  (...operators) =>
    generator =>
      mergeOp(generator, operators, connector)

export const $$or = createOperatorConnector('OR')
export const $$and = createOperatorConnector('AND')
// @fixme $$not has different behavior
export const $$not: OperatorConnector = (...operators) => generator => mergeOp(generator, operators, 'NOT')
/**
 * @fixme if using rollup, ALPHABET_ASCII set undefined
 */
export const replacementGenerator = (prefix) => (index = 0) => () => `${prefix}${nca(index++, ALPHABET_ASCII)}`
export const replacementKeyGenerator = replacementGenerator('#')
export const replacementValueGenerator = replacementGenerator(':')
export const mergeOp = (generator: Generator, operations: (OperatorGenerator)[], connector: TConnector = 'AND'): Operated => {
  const [firstOp, ...ops] = operations
  return ops.reduce((ret, operation) => {
    const {KeyConditionExpression, ExpressionAttributeValues} = operation(generator)
    return {
      KeyConditionExpression   : `${ret.KeyConditionExpression} ${connector} ${KeyConditionExpression}`,
      ExpressionAttributeValues: {
        ...ret.ExpressionAttributeValues,
        ...ExpressionAttributeValues
      },
    }
  }, firstOp(generator))
}

