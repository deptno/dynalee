import {getLogger} from '../../util/debug'
import {TScalar} from '../operator'
import {ComparisonOperator, Generator, Operated, OperatorGenerator} from './type'
import {curry} from 'ramda'

const logger = getLogger(__filename)
/**
 * https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html
 */
const createOperatorGenerator = curry((
  operator: ComparisonOperator,
  expressionName: TExpression,
  genKey: Generator,
  genValue: Generator,
  keyName: string,
  a: TScalar) => {
        const key = genKey()
        const value = genValue()
        return {
          [expressionName]         : `${key} ${operator} ${value}`,
          ExpressionAttributeNames : {[`${key}`]: keyName},
          ExpressionAttributeValues: {[`${value}`]: a}
        }
      })
type TExpression = 'KeyConditionExpression' | 'FilterExpression'
export const $eq = createOperatorGenerator('=')
export const $ne = createOperatorGenerator('<>')
export const $lt = createOperatorGenerator('<')
export const $le = createOperatorGenerator('<=')
export const $gt = createOperatorGenerator('>')
export const $ge = createOperatorGenerator('>=')
export const $between = <T extends TScalar>(genKey: Generator, genValue: Generator, a: T, b: T) => {
  const key = genKey()
  const valueA = genValue()
  const valueB = genValue()
  return {
    KeyConditionExpression   : `${key} BETWEEN (${valueA}, ${valueB})`,
    ExpressionAttributeValues: {
      [`${valueA}`]: a,
      [`${valueB}`]: b
    }
  }
}

/**
 * https://stackoverflow.com/questions/40283653/how-to-use-in-statement-in-filterexpression-using-array-dynamodb
 */
export const $in = (...a: TScalar[]): OperatorGenerator =>
  (generator: Generator) => {
    if (a.length > 100) {
      console.warn(`dynamodb doesn't support \`A in (... more than 100)\` expression`)
    }
    const replacements = a
      .slice(0, 100)
      .map((_, i) => generator())
    const attributeValues = replacements.reduce((ret, r, i) => ({
      ...ret,
      [r]: a[i]
    }), {})
    return {
      KeyConditionExpression   : `#RGK IN (${replacements.join(',')})`,
      ExpressionAttributeValues: attributeValues
    }
  }

