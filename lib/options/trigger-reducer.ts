import {MapHandlerAttribute} from '../model/option'

export const triggerReducer = (item, trigger: MapHandlerAttribute) => {
  console.log('trigger', item, trigger)
  const {attributeName, handler} = trigger
  item[attributeName] = handler(item[attributeName])
  return item
}
