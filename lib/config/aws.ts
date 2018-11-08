import {DynamoDB} from 'aws-sdk'
import debug from 'debug'

const logger = debug(['dynalee', __filename].join(':'))
const regexpRegion = /\S+-\S+-.{1}/

export const getDdbClient = (options = {} as DynamoDB.Types.ClientConfiguration) => {
  const {region, endpoint = 'http://localhost:8000'} = options
  if (!regexpRegion.test(region!)) {
    logger(`Try to connect ${region}, ${endpoint}`)
    return new DynamoDB.DocumentClient({region, endpoint})
  }
  return new DynamoDB.DocumentClient({region})
}
