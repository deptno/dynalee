import define from '../lib'
import {$eq, $le, beginsWith} from '../lib/operator/key-condition-operator'
import {getLogger} from '../lib/util/debug'

interface SchemaEx {
  readonly detail: string
  readonly id: string
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

const log = getLogger(__filename)
const User = define<SchemaEx, SchemaEx['id'], SchemaEx['detail']>('dynalee', 'id', 'detail', {})
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
    .pipe(
      $eq('hello'),
    )
  log(users)
  log('< query')
}

async function chain() {
  for (const job of [put, get, update, del]) {
    job()
    await new Promise(r => setTimeout(r, 2000))
  }
}

query()
