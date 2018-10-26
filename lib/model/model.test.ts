import {filenameLogger} from '../util/debug'
import {createModel} from './index'

const log = filenameLogger(__filename)

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
}


const Ex = createModel<SchemaEx, SchemaEx['id'], SchemaEx['detail']>('dynalee', 'id', 'detail')

async function put() {
  log('> put')
  const user = Ex.of({
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
  const user = await Ex.get('hello', 'world')
  //fixme: 2 history
  user.set(user => {
    delete user.someKey
  })
  const result = await user.put()
  log('< get')
}

async function update() {
  log('> update')
  const user = Ex.of({
    id    : 'hello2',
    detail: 'world',
  })
  const next = await user.update()
  log('< update')
}

async function del() {
  log('> del')
  const user = await Ex.get('hello', 'world')
  const next = await user.delete()
  log('< del')
}


async function chain() {
  for (const job of [put, get, update, del]) {
    job()
    await new Promise(r => setTimeout(r, 2000))
  }
}

chain()
