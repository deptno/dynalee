import {ModelOptions} from '../model/model'
import {applyTimestamp} from './timestamp'
import {compose} from 'ramda'

/**
 * @todo collect all error type in one place
 */
class OptionError extends Error {
}

export const applyItemOptions = <S>(item: S, options?: ModelOptions) => {
  if (!options) {
    return item
  }

  return applyTimestamp(item, options)
}

const apply = compose(
  applyTimestamp
)

