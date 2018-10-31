import {mergeWith, cond, T, is} from 'ramda'
import {TConnector} from '../engine/expression/type'

const connectStr = (connector: TConnector) => (l, r) => `${l} ${connector} ${r}`

export const mergeByTypes = (connector: TConnector, a, b) =>
  mergeWith(
    cond([
      [is(String), connectStr(connector)],
      [T, Object.assign]
    ]),
    a,
    b)

