import {DynamoDB} from 'aws-sdk'
import * as R from 'ramda'
import debug from 'debug'

const logger = debug(['dynalee', __filename].join(':'))

// Item - A map of attributes and their values.
// Each entry in this map consists of an attribute name and an attribute value.
// Attribute values must not be null; string and binary type attributes must have lengths greater than zero; and set type attributes must not be empty.
// Requests that contain empty values will be rejected with a ValidationException exception.
//If you specify any attributes that are part of an index key, then the data types for those attributes must match those of the schema in the table's attribute definition.
export const dynamodbDoc = (obj) => {
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
      } else {
        clone[key] = new DynamoDB.DocumentClient().createSet(Array.from(value))
      }
    }
  }

  return R.omit(omit, clone) as typeof clone
}

