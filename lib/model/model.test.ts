import {filenameLogger} from '../util/debug'
const log = filenameLogger(__filename)
log(1)
import {createModel} from './index'

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

async function get() {
  const user = await Ex.get('hello', 'world')
  log('user', user)
  user.set(user => {
    delete user.someKey
  })
  log(user.head())
  log(user.base())
  log(user.revision())
  const result = await user.put()
  console.log('result', result)
}

async function update() {
  const user = Ex.of({
    id    : 'hello2',
    detail: 'world',
  })
  const updatedUser = await user.update()
}

async function put() {
  const user = Ex.of({
    id    : 'hello',
    detail: 'world',
  })
  user.set(user => {
    user.someKey = 'hello'
  })
  const updatedUser = await user.put()
  log('put', updatedUser)
}

async function del() {
  const user = await Ex.get('hello', 'world')
  const nextUser = await user.delete()
  log('del', nextUser)
}

async function en() {
}
del()
