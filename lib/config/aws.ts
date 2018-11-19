import {DynamoDB} from 'aws-sdk'
import {getLogger, ELogs} from '../util/log'

const log = getLogger(ELogs.CONFIG_AWS)
const regexpRegion = /\S+-\S+-.{1}/
const cache = new Map()

export const getDdbClient = (options = {} as DynamoDB.Types.ClientConfiguration) => {
  const {region = process.env.AWS_REGION, endpoint = 'http://localhost:8000'} = options
  const local = !regexpRegion.test(region!)
  const key = local
    ? [region, endpoint].join('#')
    : region

  if (cache.has(key)) {
    return cache.get(key)
  }
  log(`Try to connect ${region}, ${endpoint}`)

  !regexpRegion.test(region!)
    ? cache.set(key, new DynamoDB.DocumentClient({region, endpoint}))
    : cache.set(key, new DynamoDB.DocumentClient({region}))

  return getDdbClient(options)
}
