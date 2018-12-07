import {DynamoDB} from 'aws-sdk'
import {DocumentClient} from 'aws-sdk/clients/dynamodb'
import * as R from 'ramda'
import {TScalar} from '../engine'
import {ELogs, getLogger} from './log'

const log = getLogger(ELogs.UTIL_DYNAMODB_DOCUMENT)
const getDdbClient = R.always(new DynamoDB.DocumentClient())
const defaultSetTransformer: SetTransformer = R.compose(getDdbClient().createSet, Array.from)

const isOmitValue = (value) => {
  if (!value) {
    if (value === null) {
      return true
    }
    if (value === undefined) {
      return true
    }
    if (typeof value === 'string') {
      return true
    }
    if (typeof value === 'number') {
      if (isNaN(value)) {
        return true
      }
    }
//  } else if (Array.isArray(value)) {
//    if (value.length === 0) {
//      return true
//    }
  } else if (value instanceof Set) {
    if (value.size === 0) {
      return true
    }
  }
}

export const dynamodbDoc = (obj, ifSet: SetTransformer = defaultSetTransformer) => {
  const omit: string[] = []
  const clone = {...obj}

  for (const key in clone) {
    const value = clone[key]
    if (isOmitValue(value)) {
      omit.push(key)
    } else {
      clone[key] = dynamodbValue(value, ifSet)
    }
  }
  return R.omit(omit, clone) as typeof clone
}
export const dynamodbValue = (value, ifSet: SetTransformer = defaultSetTransformer) => {
  if (value instanceof Set) {
    return ifSet(value)
  } else if (Array.isArray(value)) {

  } else if (typeof value === 'object') {
    return dynamodbDoc(value, ifSet)
  }
  return value
}
export const jsDoc = <T>(obj: T): T => {
  const omit: string[] = []
  const clone = {} as any

  for (const key in obj) {
    clone[key] = jsValue(obj[key])
  }

  return R.omit(omit, clone) as T
}
export const jsValue = (value) => {
  if (value.wrapperName === 'Set') {
    return value.values
  }
  return value
}
interface SetTransformer {
  (fx: Set<TScalar>): DocumentClient.DynamoDbSet | TScalar[]
}

