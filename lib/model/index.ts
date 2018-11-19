import {TScalar} from '../engine'
import {ELogs, getLogger} from '../util/log'
import {Model} from './model'
import {ModelOptions} from './option'

const log = getLogger(ELogs.MODEL_INDEX)

/**
 * @todo need to index
 */
export const define: Define = (tableName, hashKeyName, rangeKeyName?, options?) => {
  return new Model(tableName, hashKeyName, rangeKeyName, options)
}

interface Define {
  <S, H extends TScalar, R extends TScalar = never>(
    tableName: string,
    hashKeyName: keyof S,
    rangeKeyName: keyof S,
    options?: ModelOptions
  ): Model<S, H, R>
  <S, H extends TScalar>(
    tableName: string,
    hashKeyName: keyof S,
    options?: ModelOptions
  ): Model<S, H, any>
}
