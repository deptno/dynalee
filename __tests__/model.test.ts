import define from '../lib'
import debug from 'debug'

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

const logger = debug(['dynalee', __filename].join(':'))
const User = define<SchemaEx, SchemaEx[typeof HASH_KEY], typeof RANGE_KEY>('dynalee', 'id', 'detail', {})
const aUser = define<SchemaEx, SchemaEx['id'], SchemaEx['detail']>('dynalee', 'id', 'detail')
const bUser = define<SchemaEx, SchemaEx['id']>('dynalee', 'id', {})
const cser = define<SchemaEx, SchemaEx['id']>('dynalee', 'id')

async function put() {
  logger('> put')
  const user = User.of({
    id    : 'hello',
    detail: 'world',
  })
  user.set(user => {
    user.someKey = 'hello'
  })
  const next = await user.put()
  logger('< put')
}

async function get() {
  logger('> get')
  const user = await User.get('hello', 'world')
  user.set(user => {
    delete user.someKey
  })
  const next = await user.put()
  logger('< get')
}

async function update() {
  logger('> update')
  const user = User.of({
    id    : 'hello2',
    detail: 'world',
  })
  user.set(user => {
    user.someKey2 = 'abc'
  })
  const next = await user.update()
  logger('< update')
}

async function updateFromGet() {
  logger('> updateFromGet')
  const user = await User.get('hello2', 'world')
  user.set(user => {
    delete user.someKey
  })
  const next = await user.update()
  logger('< updateFromGet')
}

async function del() {
  logger('> del')
  const user = await User.get('hello', 'world')
  const next = await user.delete()
  logger('< del')
}

async function query() {
  logger('> query')
  const users = await User
    .query('hello')
  logger(users)
  logger('< query')
}

async function chain() {
  for (const job of [put, get, update, del]) {
    job()
    await new Promise(r => setTimeout(r, 2000))
  }
}

query()
