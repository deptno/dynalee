import define from '..'

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

const Ex = define<SchemaEx, SchemaEx['id'], SchemaEx['detail']>('dynalee', 'id', 'detail')

async function put() {
  console.log('> put')
  const user = Ex.of({
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
  const user = await Ex.get('hello', 'world')
  user.set(user => {
    delete user.someKey
  })
  const next = await user.put()
  console.log('< get')
}

async function update() {
  console.log('> update')
  const user = Ex.of({
    id    : 'hello2',
    detail: 'world',
  })
  const next = await user.update()
  console.log('< update')
}

async function del() {
  console.log('> del')
  const user = await Ex.get('hello', 'world')
  const next = await user.delete()
  console.log('< del')
}

async function chain() {
  for (const job of [put, get, update, del]) {
    job()
    await new Promise(r => setTimeout(r, 2000))
  }
}

update()
