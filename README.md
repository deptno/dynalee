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
import {createModel} from 'dynalee'
const Ex = createModel<SchemaEx, SchemaEx['id'], SchemaEx['detail']>('dynalee', 'id', 'detail')
```

Type `.` !

![Typing dot]()


```typescript
const user = await Ex.get('hashKey', 'rangeKey')
user.set(user => {
  user.someKey = '⛵️'
})
await user.put()
```

