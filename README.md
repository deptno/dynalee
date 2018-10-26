# dynalee

> [WIP]

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
const User = define<SchemaEx, SchemaEx['id'], SchemaEx['detail']>('dynalee', 'id', 'detail')
```

```typescript
const user = await User.get('hashKey', 'rangeKey')
user.set(user => {
  user.someKey = '⛵️'
})
await user.put()
```

