import debug from 'debug'

export enum ELogs {
  CONFIG_AWS,
  ENGINE_EXPRESSION_COMPARATOR,
  MODEL_DOCUMENT,
  MODEL_INDEX,
  MODEL_MODEL,
  MODEL_METHOD_QUERY,
  MODEL_METHOD_UPDATE_ITEM,
  MODEL_METHOD_INTERNAL_PRINTABLE,
  UTIL_DYNAMODB_DOCUMENT,
  ENGINE_ENGINE,
  TEST,
}
export const getLogger: (type: ELogs) => (...args: any[]) => void = type => debug(`dynalee:${type}`)
