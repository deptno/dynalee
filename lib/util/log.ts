import debug from 'debug'

export enum ELogs {
  CONFIG_AWS = 'CONFIG_AWS',
  ENGINE_EXPRESSION_COMPARATOR = 'ENGINE_EXPRESSION_COMPARATOR',
  MODEL_DOCUMENT = 'MODEL_DOCUMENT',
  MODEL_INDEX = 'MODEL_INDEX',
  MODEL_MODEL = 'MODEL_MODEL',
  MODEL_METHOD_QUERY = 'MODEL_METHOD_QUERY',
  MODEL_METHOD_UPDATE_ITEM = 'MODEL_METHOD_UPDATE_ITEM',
  MODEL_METHOD_INTERNAL_PRINTABLE = 'MODEL_METHOD_INTERNAL_PRINTABLE',
  UTIL_DYNAMODB_DOCUMENT = 'UTIL_DYNAMODB_DOCUMENT',
  ENGINE_ENGINE = 'ENGINE_ENGINE',
  TEST = 'TEST',
}

if (process.env.NODE_ENV = 'production') {
  debug.log = console.log.bind(console)
}

export const getLogger: (type: ELogs) => (...args: any[]) => void = type => debug(`dynalee:${type}`)
