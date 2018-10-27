# dynalee

> [WIP], UNSTABLE

`dynalee` is built on top of `DynamoDB.DocumentClient`.  
`dynalee` is bridge between `DynamoDB.DocumentClient` and **Typescript**'s `Interface`.  
`dynalee` provide same methods ~~(name?)~~ that `DynamoDB.DocumentClient` provide

## Install
```bash
npm i dynalee
```

## Usage

Define schema
```typescript
interface SchemaEx {
  readonly id: string // hashKey
  readonly detail: string // rangeKey
  list?: [string, number, { string: string }]
  map?: {
    map: {
      list: [string[]]
      string: string
    }
  }
  someKey: string
}
```

Create [`Model`](#classmodel)
```typescript
import define from 'dynalee'

const User = define<SchemaEx, SchemaEx['id'], SchemaEx['detail']>('TableName', 'id', 'detail')
```

Create [`Document`](#document)

```typescript
const user = User.of({
  id: 'hash',
  detail: 'range'
})
```

Save [`Document`](#document)

```typescript
await user.put()
```

Get [`Document`](#document)

```typescript
const user = await User.get('hash', 'range')
```

Overwrite [`Document`](#document)

```typescript
const user = await User.get('HASH_KEY', 'RANGE_KEY')
user.set(user => {
  user.someKey = '⛵️'
})
await user.put() // or await user.update() [@todo]
```

Delete `Document`

```typescript
await user.delete()
```

## API

```typescript
define<Schema, HashKeyType, RangeKey>(TableName, HashKeyPropertyName, RangeKeyPropertyName): Model`
```

### class `Model`

- [x] `.of(data: Schema)`
- [ ] `.batchGet(...)`
- [ ] `.batchWrite(...)`
- [ ] ~~`.createSet(...)`~~
- [x] `.delete(...)`
- [x] `.get(...): Document`

### class `Document`

- [x] `.set(...)`
- [x] `.delete(...)` - DB write
- [x] `.put(...)` - DB write
- [ ] `.update(...)` - DB write

## @ToDo

- [ ] support timestamp
- [ ] set default error handler

## License
MIT
