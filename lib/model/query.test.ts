import {Operator} from '../operator/operator'
import {CompositeQuery} from './query'

+async function () {
  const tableName = 'dynalee'
  const hashKeyName = 'hello'
  const rangeKeyName = 'world'
  //operator 가 키 이름들을 가지고 있음
  const op = new Operator<T['hsk'], T['rgk']>(tableName, hashKeyName, rangeKeyName)
  const query = new CompositeQuery<T, T['hsk'], T['rgk']>(print, op, 'hsk', 'hello')

  query
    .range('rgk')
    .beginsWith('123')
    .desc()
    .consistent()
    .limit(0)
    .filter(operator => {
      operator.eq('1')
      operator.eq('1')
      operator.eq('1')
      operator.eq('1')
    })
    .run()
}()
function print(query) {
  console.log(JSON.stringify(query, null, 2))
//  console.log(this)
}

interface T {
  readonly hsk: string
  readonly rgk: number
}
