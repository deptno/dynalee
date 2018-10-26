# dynalee

`dynalee` is built on top of `aws-sdk`'s `DynamoDB.DocumentClient`.
`dynalee` is bridge between `DynamoDB.DocumentClient` and **Typescript**'s `Interface`.
`dynalee` provide same methods ~~(name?)~~ that `DynamoDB.DocumentClient` provide

### [WIP], UNSTABLE,
### [WIP], UNSTABLE,
### [WIP], UNSTABLE,
### [WIP], UNSTABLE,

## Install
```bash
npm i dynalee
```

## Usage

Define schema type
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

Create Model
```typescript
import define from 'dynalee'

const User = define<SchemaEx, SchemaEx['id'], SchemaEx['detail']>('TableName', 'id', 'detail')
```

```typescript
const user = await User.get('hashKey', 'rangeKey')
user.set(user => {
  user.someKey = '⛵️'
})
await user.put()
```

## API
`define<Schema, HashKeyType, RangeKey>(TableName, HashKeyPropertyName, RangeKeyPropertyName): Model`

`Model`
- [ ] `.of(data: Schema)` // create document
- [ ] `.batchGet(...)`
- [ ] `.batchWrite(...)`
- [ ] `.createSet(...)`
- [x] `.delete(...)`
- [x] `.get(...): Document`

`Document`
- [x] `.set(...)`
- [x] `.delete(...)` - DB delete
- [x] `.put(...)` - DB put
- [x] `.update(...)` - DB update

## License
MIT