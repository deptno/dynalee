import {TScalar} from '../engine'
import {ELogs, getLogger} from '../util/log'
import {Model} from './model'
import {ModelOptions} from './option'

const log = getLogger(ELogs.MODEL_INDEX)

/**
 * @todo need to index
 */
export const define = <S, H extends TScalar, R extends TScalar = never>
(params: DefineParams<S, H, R>): Model<S, H, R> => {
  return new Model(params)
}

interface DefineParams<S, H, R> {
  table: string
  hash: keyof S
  range?: keyof S
  index?: string
  options?: ModelOptions
}

