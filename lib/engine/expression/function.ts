import {curry} from 'ramda'
import {DDBDataType, Generator, TExpression} from './type'

export const $attributeExists = curry((
  expressionName: TExpression,
  genKey: Generator,
  keyPath: string) => {
  const key = genKey()
  return {
    [expressionName]        : `attribute_exists(${key})`,
    ExpressionAttributeNames: {[key]: keyPath},
  }
})
export const $attributeNotExists = curry((
  expressionName: TExpression,
  genKey: Generator,
  keyPath: string) => {
  const key = genKey()
  return {
    [expressionName]        : `attribute_not_exists(${key})`,
    ExpressionAttributeNames: {[key]: keyPath},
  }
})
export const $attributeType = curry((
  expressionName: TExpression,
  genKey: Generator,
  genValue: Generator,
  keyName: string,
  type: DDBDataType) => {
  const key = genKey()
  const valueA = genValue()
  return {
    [expressionName]         : `attribute_type(${key}, ${valueA})`,
    ExpressionAttributeNames : {[key]: keyName},
    ExpressionAttributeValues: {[valueA]: type}
  }
})
export const $beginsWith = curry((
  expressionName: TExpression,
  genKey: Generator,
  genValue: Generator,
  keyName: string,
  value: string) => {
  const key = genKey()
  const valueA = genValue()
  return {
    [expressionName]         : `begins_with(${key}, ${valueA})`,
    ExpressionAttributeNames : {[key]: keyName},
    ExpressionAttributeValues: {[valueA]: value}
  }
})
export const $contains = curry((
  expressionName: TExpression,
  genKey: Generator,
  genValue: Generator,
  keyName: string,
  value: string) => {
  const key = genKey()
  const valueA = genValue()
  return {
    [expressionName]         : `contains(${key}, ${valueA})`,
    ExpressionAttributeNames : {[key]: keyName},
    ExpressionAttributeValues: {[valueA]: value}
  }
})

