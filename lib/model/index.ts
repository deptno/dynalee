import {TScalar} from '../engine'
import debug from 'debug'
import {Model, ModelOptions} from './model'

const logger = debug(['dynalee', __filename].join(':'))

/**
 * @todo need to index
 */
export const define: Define = (tableName, hashKeyName, rangeKeyName?, options?) => {
  return new Model(tableName, hashKeyName, rangeKeyName, options)
}

interface Define {
  <S, H extends TScalar, R extends TScalar = never>(
    tableName: string,
    hashKeyName: H,
    rangeKeyName: R,
    options?: ModelOptions
  ): Model<S, H, R>
  <S, H extends TScalar>(
    tableName: string,
    hashKeyName: H,
    options?: ModelOptions
  ): Model<S, H, any>
}
