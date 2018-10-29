import {ETimestampType} from '../constant'
import {ModelOptions} from '../model/model'
import {OptionError} from './error'

export const applyTimestamp = <S>(item: S, options: ModelOptions): S => {
  if (!options.timestamp) {
    return item
  }

  const {type, createdAt = 'createdAt', updatedAt = 'updatedAt'} = options.timestamp
  const now = getTimestamp(type)
  const patch = {
    [updatedAt]: now
  }

  if (now === undefined || now === null) {
    throw new OptionError(`timestamp returns: ${now}`)
  }
  if (!item[createdAt]) {
    patch[createdAt] = now
  }

  return Object.assign({}, item, patch)
}

const getTimestamp = (type: ETimestampType | Function) => {
  if (typeof type === 'function') {
    return type()
  } else if (type === ETimestampType.Iso8601) {
    return new Date().toISOString()
  } else if (type === ETimestampType.Milliseconds) {
    return Date.now()
  } else {
    throw new OptionError(`unknown timestamp options type: ${type}`)
  }
}
