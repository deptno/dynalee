import {Query} from './query'

+async function () {
  const query = new Query<T, T['hsk'], T['rgk']>(print as any, 'hsk', 'hello')

  query
    .range('rgk')
    .beginsWith('a')
    .desc()
    .consistent()
    .limit(1)
    .filter((and, or) => {
      // @todo: throw type error
      and
        .eq('name', 1)
        .eq('userId', 1)
        .eq('userId', 1)
        .eq('name', 1)
    })
    .project('name, userId')
    .run()
}()

function print(query) {
  console.log(JSON.stringify(query, null, 2))
}

interface T {
  readonly hsk: string
  readonly rgk: string
  name: string,
  userId: string
}
