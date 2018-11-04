import * as R from 'ramda'
import {getLogger} from './debug'

const logger = getLogger(__filename)
export const cleanDoc = (obj) => {
  const omit: string[] = []

  for (const key in obj) {
    if (!obj[key] && typeof obj[key] === 'string') {
      omit.push(key)
    }
  }

  logger('cleaned', omit.join(', '))
  return R.omit(omit, obj) as typeof obj
}