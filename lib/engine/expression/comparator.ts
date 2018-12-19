import {curry} from 'ramda'
import {ELogs, getLogger} from '../../util/log'
import {TScalar} from '../engine'
import {ComparisonOperator, Generator, TExpression} from './type'

const log = getLogger(ELogs.ENGINE_EXPRESSION_COMPARATOR)
/*
 * https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html
 */
const createComparator = curry((
  operator: ComparisonOperator,
  expressionName: TExpression,
  genKey: Generator,
  genValue: Generator,
  keyName: string,
  a: TScalar
) => {
  const key = genKey()
  const value = genValue()
  return {
    [expressionName]         : `${key} ${operator} ${value}`,
    ExpressionAttributeNames : {[key]: keyName},
    ExpressionAttributeValues: {[value]: a}
  }
})
export const $eq = createComparator('=')
export const $ne = createComparator('<>')
export const $lt = createComparator('<')
export const $le = createComparator('<=')
export const $gt = createComparator('>')
export const $ge = createComparator('>=')
export const $between = curry(<T extends TScalar>(
  expressionName: TExpression,
  genKey: Generator,
  genValue: Generator,
  keyName: string,
  a: T,
  b: T) => {
  const key = genKey()
  const valueA = genValue()
  const valueB = genValue()
  return {
    [expressionName]         : `${key} BETWEEN (${valueA} AND ${valueB})`,
    ExpressionAttributeNames : {[key]: keyName},
    ExpressionAttributeValues: {
      [valueA]: a,
      [valueB]: b
    }
  }
})
/**
 * https://stackoverflow.com/questions/40283653/how-to-use-in-statement-in-filterexpression-using-array-dynamodb
 */
export const $in = <T extends TScalar>(
  expressionName: TExpression,
  genKey: Generator,
  genValue: Generator,
  keyName: string,
  ...values: T[]
) => {
  if (values.length > 100) {
    throw new Error(`dynamodb doesn't support \`A in (... more than 100)\` expression`)
  }
  const key = genKey()
  const replacements = values.map(genValue)
  const attributeValues = replacements.reduce((ret, r, i) => ({
    ...ret,
    [r]: values[i]
  }), {})

  return {
    [expressionName]         : `${key} IN (${replacements.join(',')})`,
    ExpressionAttributeNames : {[key]: keyName},
    ExpressionAttributeValues: attributeValues
  }
}
