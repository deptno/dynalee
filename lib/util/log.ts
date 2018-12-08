import debug from 'debug'

export enum ELogs {
  CONFIG_AWS                      = 'config:aws',
  ENGINE_EXPRESSION_COMPARATOR    = 'engine:expression:comparator',
  MODEL_DOCUMENT                  = 'model:document',
  MODEL_INDEX                     = 'model:index',
  MODEL_MODEL                     = 'model:model',
  MODEL_SECONDARY_INDEX           = 'model:secondary-index',
  MODEL_METHOD_QUERY              = 'model:method:query',
  MODEL_METHOD_UPDATE_ITEM        = 'model:method:update_item',
  MODEL_METHOD_INTERNAL_PRINTABLE = 'model:method:internal:printable',
  MODEL_METHOD_INTERNAL_WRITE     = 'model:method:internal:write',
  MODEL_METHOD_INTERNAL_READ      = 'model:method:internal:read',
  UTIL_DYNAMODB_DOCUMENT          = 'util:dynamodb_document',
  UTIL_TRIGGER                    = 'util:trigger',
  ENGINE_ENGINE                   = 'engine:engine',
  ENGINE_EXPRESSION_HELPER        = 'engine:expression:helper',
  ENGINE_OPERATOR_UPDATER         = 'engine:operator:updater',
  ENGINE_OPERATOR_CONDITION       = 'engine:operator:condition',
  TEST                            = 'test',
}

if (process.env.NODE_ENV === 'production') {
  debug.log = console.log.bind(console)
}

export const getLogger: (type: ELogs) => (...args: any[]) => void = type => debug(`dynalee:${type}`)
