import define from '../lib'
import '../lib/__mocks__/document-client'
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
const User = define<SchemaEx, SchemaEx[typeof HASH_KEY], typeof RANGE_KEY>('dynalee', 'id', 'detail', {})
const aUser = define<SchemaEx, SchemaEx['id'], SchemaEx['detail']>('dynalee', 'id', 'detail')
const bUser = define<SchemaEx, SchemaEx['id']>('dynalee', 'id', {})
const cser = define<SchemaEx, SchemaEx['id']>('dynalee', 'id')

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
  const Stream2 = define('Stream2', 'hid')
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
  const User = define<S, string>(
    'local-googit.io',
    '_id',
  )
  const result = await User.updateItem('63701340')
    .update(setter => {
      setter.set('added', 3)
    })
    .run()
  console.log('result', result)
}

updateItem()
