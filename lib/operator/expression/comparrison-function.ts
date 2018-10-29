import {getLogger} from '../../util/debug'
import {TScalar} from '../operator'

const logger = getLogger(__filename)

/**
 * @todo
 * @fixme
 */
export const beginsWith = (a: TScalar, path: string) => {
  logger('beginsWith() @todo')
  return () => {
    return {
      KeyConditionExpression: `begins_with(${a}, ${path})`
    }
  }
}
export const attributeExists = (path: string) => {
  logger('attributeExists() @todo')
}
export const attributeNotExists = (path: string) => {
  logger('attributeNotExists() @todo')
}
export const attributeType = (path: string, type) => {
  logger('attributeType() @todo')
}
export const contains = (path: string, operand) => {
  logger('contains() @todo')
}
// @fixme
export const size = (path: string) => `SIZE (${path})`

//export const notNull(a: boolean) {
//export const null(a: boolean) {
//export const contains(a: TScalar) {
//export const notContains(a: TScalar) {
