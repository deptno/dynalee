import {DynamoDB} from 'aws-sdk'
import {DocumentClient} from 'aws-sdk/clients/dynamodb'
import debug from 'debug'
import * as R from 'ramda'
import {TScalar} from '../engine'

const log = debug(['dynalee', __filename].join(':'))
const getDdbClient = R.always(new DynamoDB.DocumentClient())
const defaultSetTransformer: SetTransformer = R.compose(getDdbClient().createSet, Array.from)

export const dynamodbDoc = (obj, ifSet: SetTransformer = defaultSetTransformer) => {
  const omit: string[] = []
  const clone = {...obj}

  for (const key in clone) {
    const value = clone[key]
    if (!value) {
      if (value === null) {
        omit.push(key)
      }
      if (value === undefined) {
        omit.push(key)
      }
      if (typeof value === 'string') {
        omit.push(key)
      }
      if (typeof value === 'number') {
        if (isNaN(value)) {
          omit.push(key)
        }
      }
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        omit.push(key)
      }
    } else if (value instanceof Set) {
      if (value.size === 0) {
        omit.push(key)
      } else if (ifSet) {
        clone[key] = ifSet(value)
      }
    }
  }

  return R.omit(omit, clone) as typeof clone
}

interface SetTransformer {
  (fx: Set<TScalar>): DocumentClient.DynamoDbSet|TScalar[]
}

