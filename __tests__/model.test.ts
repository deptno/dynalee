import {Model} from '../lib'
import './__mocks__/document-client'
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
const User = Model.define<SchemaEx, SchemaEx[typeof HASH_KEY], typeof RANGE_KEY>({
  table: 'dynalee',
  hash : 'id',
  range: 'detail'
})
const aUser = Model.define<SchemaEx, SchemaEx['id'], SchemaEx['detail']>({
  table: 'dynalee',
  hash : 'id',
  range: 'detail'
})
const bUser = Model.define<SchemaEx, SchemaEx['id']>({
  table: 'dynalee',
  hash : 'id'
})
const cser = Model.define<SchemaEx, SchemaEx['id']>({
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
  const Stream2 = Model.define({table: 'Stream2', hash: 'hid'})
  const result = await Stream2
    .of({
      hid: 'dynalee test'
    })
    .put()
  console.log(result)
}

async function updateItem() {
  interface S {
    readonly _id: string
    readonly _sort: string
    added: string
  }
  const User = Model.define<S, string>({
    table: 'local-googit.io',
    hash : '_id',
  })
  const result = await User.updateItem('63701340')
    .update(setter => {
      setter.set('added', 3)
    })
    .run()
  console.log('result', result)
}

updateItem()
