import {Query} from './query'

//+async function () {
//  const query = new Query<S, S['hsk'], S['rgk']>(print as any, 'hsk', 'hello')
//
//  query
//    .range('rgk')
//    .beginsWith('a')
//    .desc()
//    .consistent()
//    .limit(1)
//    .filter((and, or) => {
//       @todo: throw type error
//      and
//        .eq('name', 1)
//        .eq('userId', 1)
//        .eq('userId', 1)
//        .eq('name', 1)
//    })
//    .project('name, userId')
//    .run()
//}()
//
//function print(query) {
//  console.log(JSON.stringify(query, null, 2))
//}

interface S {
  hsk: string
  rgk: number
  name: string,
  userId: string
}

declare const qo0: Query<S, 'hsk'>
{
  declare const qx0: Query<S, 'no'>
}
qo0
{
  qo0
    .range('rgk')
    //@todo should error
    .beginsWith('asdf')
  qo0.range('hsk')
}
