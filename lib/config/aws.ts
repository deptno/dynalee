import {DynamoDB} from 'aws-sdk'
import * as R from 'ramda'

export const getDdbClient = (options = {}) => {
  console.log('ddbClientOptions', R.pick(['region', 'endpoint'], options))
  return new DynamoDB.DocumentClient(R.pick(['region', 'endpoint'], options))
}

