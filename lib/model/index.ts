import {filenameLogger} from '../util/debug'
import {Incubator} from './incubator'
import {DDBKeyType} from '../operator/operator'

const log = filenameLogger(__filename)

export const define = <S, H extends DDBKeyType, R extends DDBKeyType>(tableName: string, hashKey: H, rangeKey?: R) => {
  return new Incubator<S, H, R>(tableName, hashKey, rangeKey)
}
