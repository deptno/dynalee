import define from '../lib'

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

const User = define<SchemaEx, SchemaEx['id'], SchemaEx['detail']>('dynalee', 'id', 'detail')

async function put() {
  console.log('> put')
  const user = User.of({
    id    : 'hello',
    detail: 'world',
  })
  user.set(user => {
    user.someKey = 'hello'
  })
  const next = await user.put()
  console.log('< put')
}

async function get() {
  console.log('> get')
  const user = await User.get('hello', 'world')
  user.set(user => {
    delete user.someKey
  })
  const next = await user.put()
  console.log('< get')
}

async function update() {
  console.log('> update')
  const user = User.of({
    id    : 'hello2',
    detail: 'world',
  })
  user.set(user => {
    user.someKey2 = 'abc'
  })
  const next = await user.update()
  console.log('< update')
}

async function updateFromGet() {
  console.log('> updateFromGet')
  const user = await User.get('hello2', 'world')
  user.set(user => {
    delete user.someKey
  })
  const next = await user.update()
  console.log('< updateFromGet')
}

async function del() {
  console.log('> del')
  const user = await User.get('hello', 'world')
  const next = await user.delete()
  console.log('< del')
}

async function chain() {
  for (const job of [put, get, update, del]) {
    job()
    await new Promise(r => setTimeout(r, 2000))
  }
}

updateFromGet()
