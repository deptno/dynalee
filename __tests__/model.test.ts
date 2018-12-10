//import './__mocks__/document-client'
import {HashModel} from '../lib'
import {ELogs, getLogger} from '../lib/util/log'

const HASH_KEY = 'id'
const RANGE_KEY = 'detail'

interface SchemaEx {
  readonly [HASH_KEY]: string
  readonly [RANGE_KEY]: string
  list?: [string, number, { string: string }],
  map?: {
    map: {
      list: [string[]]
      string: string
    }
  }
  someKey?: string
  someKey2?: string
}

const log = getLogger(ELogs.TEST)
const User = HashModel.define<SchemaEx, SchemaEx[typeof HASH_KEY], typeof RANGE_KEY>({
  table: 'dynalee',
  hash : 'id',
  range: 'detail'
})
const aUser = HashModel.define<SchemaEx, SchemaEx['id'], SchemaEx['detail']>({
  table: 'dynalee',
  hash : 'id',
  range: 'detail'
})
const bUser = HashModel.define<SchemaEx, SchemaEx['id']>({
  table: 'dynalee',
  hash : 'id'
})
const cser = HashModel.define<SchemaEx, SchemaEx['id']>({
  table: 'dynalee',
  hash : 'id'
})

async function put() {
  log('> put')
  const user = User.of({
    id    : 'hello',
    detail: 'world',
  })
  user.set(user => {
    user.someKey = 'hello'
  })
  const next = await user.put()
  log(next)
  log('< put')
}

async function get() {
  log('> get')
  const user = await User.get('hello', 'world')
  user.set(user => {
    delete user.someKey
  })
  const next = await user.put()
  log('< get')
}

async function update() {
  log('> update')
  const user = User.of({
    id    : 'hello2',
    detail: 'world',
  })
  user.set(user => {
    user.someKey2 = 'abc'
  })
  const next = await user.update()
  log('< update')
}

async function updateFromGet() {
  log('> updateFromGet')
  const user = await User.get('hello2', 'world')
  user.set(user => {
    delete user.someKey
  })
  const next = await user.update()
  log('< updateFromGet')
}

async function del() {
  log('> del')
  const user = await User.get('hello', 'world')
  const next = await user.delete()
  log('< del')
}

async function query() {
  log('> query')
  const users = await User
    .query('hello')
  log(users)
  log('< query')
}

async function chain() {
  for (const job of [put, get, update, del]) {
    job()
    await new Promise(r => setTimeout(r, 2000))
  }
}

async function streamTest() {
  const Stream2 = HashModel.define({table: 'Stream2', hash: 'hid'})
  const result = await Stream2
    .of({
      hid: 'dynalee test'
    })
    .put()
  console.log(result)
}

async function updateItem() {
  interface S {
    readonly hash: string
    readonly range: string
    added: string
  }
  const User = HashModel.define<S, string>({
    table: 'DynaleeTest',
    hash : 'hash',
  })
  const result = await User.update('63701340')
    .update(setter => {
      setter.set('added', 3)
    })
    .run()
  console.log('result', result)
}

async function trigger() {
  interface S {
    readonly hash: string
    readonly range: string
    added?: string
  }
  const User = HashModel.define<S, string, string>({
    table  : 'DynaleeTest',
    hash   : 'hash',
    range  : 'range',
    options: {
      document: {
        onCreate: [
          {
            attributeName: 'createdAt',
            handler(): unknown {
              return new Date().toISOString()
            }
          }
        ],
        onUpdate: [
          {
            attributeName: 'updatedAt',
            handler(): unknown {
              return new Date().toISOString()
            }
          }
        ]
      }
    }
  })
  {
    const user = User.of({
      hash : 'a',
      range: 'b',
    })
    await user.put()
  }
  {
    console.log('-- update')
    const user = await User.get('a', 'b',)
    console.log('user')
    await user.put()
  }
}

async function list() {
  interface S {
    readonly hash: string
    readonly range: string
    added?: string
    li?: Set<string>
    list?: string[]
  }
  const User = HashModel.define<S, string, string>({
    table: 'DynaleeTest',
    hash : 'hash',
    range: 'range',
  })
  {
    const user = User.of({
      hash : 'a',
      range: 'c',
      list: []
    })
    await user.put()
  }
//  {
//    console.log('-- update')
//    const user = await User.updateItem('a', 'c',)
//      .update(setter => {
//        setter.add('li', new Set(['kx']))
//      })
//      .run()
//    console.log('user', user)
//  }
//  {
//    console.log('-- update')
//    const user = await User.updateItem('a', 'c',)
//      .update(setter => {
//        setter.delete('li', new Set(['__holder__']))
//      })
//      .run()
//    console.log('user', user)
//  }
}

async function updateType() {
  interface S {
    ID: string,
    n: number
    s: string
    ss: Set<string>
    l: string[]
    x: string
  }

  const Tag = HashModel.define<S, S['ID']>({
    table: 'DynaleeTest',
    hash: 'ID',
  })
  Tag.update('id')
    .update(item => {
//      item.plus('n', 2)
//      item.plus('n', '2')
//      item.plus('l', ['2'])
//      item.minus('n', 2)
//      item.minus('n', '2')
//      item.minus('s', '2')
//      item.minus('l', ['2'])
//      item.delete('n', '2')
//      item.delete('ss', new Set(['2']))
//      item.delete('ss', new Set([2]))
//      item.delete('ss', ['2'])
//      item.delete('s', '2')
//      item.delete('s', new Set(['2']))
//      item.append('s', new Set(['2']))
//      item.append('ss', new Set(['2']))
//      item.append('l', new Set(['2']))
//      item.append('l', '2')
//      item.append('l', ['2'])
//      item.append('x', '2')
//      item.add('x', '2')
//      item.add('ss', new Set(['2']))
//      item.add('s', ['2'])
//      item.add('l', ['2'])
    })
}
list()
