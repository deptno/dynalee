import {ELogs, getLogger} from '../util/log'
import {HashModel, RangeModel} from './model'
import {ReadableParams} from './readable'

const log = getLogger(ELogs.TEST)

interface S {
  readonly a: string
  readonly b: string
  c: number
  d: number[]
  e?: string
}

declare const po0: ReadableParams<S, 'a', 'b'>
declare const po1: ReadableParams<S, 'b', 'a'>
{
  //@ts-ignore should error
  declare const px0: ReadableParams<S, 'b', 'b'>
}

declare const hmo0: HashModel<S, 'b'>
{
  //@ts-ignore should error
  declare const hmx0: HashModel<S, 'ids'>
}
declare const rmo0: RangeModel<S, 'a', 'b'>
declare const rmo1: RangeModel<S, 'b', 'a'>

{
  //@ts-ignore should error
  declare const hmox: HashModel<S, 'a', 'b'>
  //@ts-ignore should error
  declare const rmx1: RangeModel<S, 'b', 'b'>
}

/**
 * batchWrite
 */
hmo0.batchWrite([
  {
    PutRequest: {
      Item: {
        a: '1',
        b: '1',
        c: 1,
        d: [1],
      }
    }
  },
  {
    DeleteRequest: {
      Key: {
        a: '1',
        b: '1',
        c: 1,
        d: [1],
      }
    }
  }
])
{
  hmo0.batchWrite([
    {
      //@ts-ignore should error
      PutRequest: {
        Item: {
          a: '1',
          b: '1',
          d: [1],
        }
      }
    },
    {
      //@fixme should error
      DeleteRequest: {
        Key: {
          c: 1,
          d: [1],
        }
      }
    }

  ])
}
/**
 * batchPut
 */
hmo0.batchPut([
  {
    a: '1',
    b: '1',
    c: 1,
    d: [1],
  }
])
{
  hmo0.batchPut([
    //@ts-ignore should error
    {
      a: '1',
      b: '1',
      c: 1,
    }
  ])
}
/**
 * batchDelete
 */
rmo0.batchDelete([{
  'a': '1',
  'b': '1',
}])
{
  //@fixme should error
  rmo0.batchDelete([{
    'a': '1',
  }])
  rmo0.batchDelete([{
    'a' : '1',
    'b' : '1',
    //@ts-ignore should error
    'c' : '1',
    'dd': '1',
  }])
}


rmo0.get('string', 'string')
{
  //@ts-ignore should error
  rmo0.get(1, '22')
  //@ts-ignore should error
  rmo0.get('string', 11)
}
{
  //@ts-ignore should error
  hmo0.get('a', 11)
  //@ts-ignore should error
  hmo0.get('a', 22)
  //@ts-ignore should error
  hmo0.get('a', null)
}
{
  //@ts-ignore should error
  rmo0.get('a')
  //@ts-ignore should error
  rmo0.get('a', 1)
//  @ts-ignore should error
  rmo0.get(1, 1)
}
/**
 * get
 */
hmo0.get('a')
{
  //@ts-ignore should error
  hmo0.get(1)
}
rmo0.get('a', 'b')
{
//  @ts-ignore should error
  rmo0.get(1, 'b')
  //  @ts-ignore should error
  rmo0.get('a', 1)
  //  @ts-ignore should error
  rmo0.get(2, 1)
}
/**
 * update
 */
hmo0.update('a')
{
  //@ts-ignore should error
  hmo0.update(1)
}
rmo0.update('a', 'b')
{
  //  @ts-ignore should error
  rmo0.update(1, 'b')
  //  @ts-ignore should error
  rmo0.update('a', 1)
  //  @ts-ignore should error
  rmo0.update(2, 1)
}
/**
 * delete
 */
hmo0.delete('a')
{
//  @ts-ignore should error
  hmo0.delete(1)
}
rmo0.delete('a', 'b')
{
//    @ts-ignore should error
  rmo0.delete(1, 'b')
//    @ts-ignore should error
  rmo0.delete('a', 1)
//    @ts-ignore should error
  rmo0.delete(2, 1)
}
