import {filenameLogger} from '../util/debug'
import {Model} from './model'
import {DDBKeyType} from '../operator/operator'

const log = filenameLogger(__filename)

export const define = <S, H extends DDBKeyType, R extends DDBKeyType = never>(tableName: string, hashKey: H, rangeKey?: R) => {
  return new Model<S, H, R>(tableName, hashKey, rangeKey)
}
