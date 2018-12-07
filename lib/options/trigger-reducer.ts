import {MapHandlerAttribute} from '../model/option'
import {ELogs, getLogger} from '../util/log'

const log = getLogger(ELogs.UTIL_TRIGGER)

export const triggerReducer = (item, trigger: MapHandlerAttribute) => {
  log('trigger', trigger.attributeName)
  const {attributeName, handler} = trigger
  item[attributeName] = handler(item[attributeName])
  return item
}
