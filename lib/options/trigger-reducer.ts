import {MapHandlerAttribute} from '../model/option'

export const triggerReducer = item =>
  ({attributeName, handler}: MapHandlerAttribute) => {
    item[attributeName] = handler(item[attributeName])
    return item
  }
