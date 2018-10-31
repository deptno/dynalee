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
    .eq(1)
    .desc()
    .consistent()
    .limit(1)
    .filter((and, or) => {
      // @todo: throw type error
      and.eq('name', 1)
      or.eq('userId', 1)
      or.eq('userId', 1)
      and.eq('name', 1)
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
  name: string,
  userId: string
}
