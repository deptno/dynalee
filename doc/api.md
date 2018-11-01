# API

## Import

1. Default import

```typescript
import define from 'dynalee'
```
2. Named import

```typescript
import {define} from 'dynalee'
```

## API

### define

- `define`

```typescript
define<Schema, THashKey, TRangeKey?>(tableName: string, hashKeyName: TScalar, rangeKeyName?: TScalar, options: any): Model<Schema, THashKey,TRangeKey>
```

### Model

- `of` Create document from schema data

```typescript
of(data: Schema): Document<Schema, THashKey, TRangeKey?>
```

- `get`

```typescript
get(hashKey: THashKey, rangeKey?: TRangeKey)
```

- ~~`delete`~~

```typescript
delete(hashKey: THashKey, rangeKey?: TRangeKey)
```

- `scan`

```typescript
scan(): Scan
```

- `query`

```typescript
query(hashKey: THashKey): Query
```

- ~~`batchGet`~~

- ~~`batchWrite`~~
- ~~`createSet`~~

### Scan

- `project`

```typescript
project(expression: string): this
```

- `filter`

```typescript
filter(setter: (and: Operators, or: Operators) => void): this
```

- `limit`

```typescript
limit(limit: number): this
```

- `consistent`

```typescript
consistent(): this
```

- `startAt`

```typescript
startAt(lastEvaluatedKey: {[HASH_KEY]: value, [RANGE_KEY]?: value}): this
```

- `run`

```typescript
run(): Promise<Document[]>
```

- `out`

```typescript
out(): import('aws-sdk').DynamoDB.DocumentClient.QueryInput
```

- `from`

```typescript
from(params: Omit<import('aws-sdk').DynamoDB.DocumentClient.QueryInput), 'TableName', 'Key'>: this
```

### Query extends Scan

- `desc`

```typescript
desc(): this
```

### Document

>  Return types of `put`, `update`, `delete` will be replaced with `Document`

- `set`

```typescript
set(setter: (data: Schema) => void): this
```

- `head`

```typescript
head(): Schema
```

- `put`

```typescript
put(): Promise<import('aws-sdk').DynamoDB.DocumentClient.PutItemOutput>
```

- `update`

```typescript
update(): Promise<import('aws-sdk').DynamoDB.DocumentClient.UpdateItemOutput>
```

- `delete`

```typescript
delete(): Promise<import('aws-sdk').DynamoDB.DocumentClient.DeleteItemOutput>
```

- ~~`undelete`~~


## Usage

1. Define `Model`

```typescript
const TABLEN_NAME = 'Table'
const HASH_KEY = 'id'

interface IUser {
  readonly [HASH_KEY]: number
  picture: string
}

const User = define<IUser, IUser['id']>(TABLE_NAME, HASH_KEY)
```

3. Define `Model` with `RANGE_KEY`

```typescript
const TABLEN_NAME = 'Table'
const HASH_KEY = 'id'
const RANGE_KEY = 'createdAt'

interface IUser {
  readonly [HASH_KEY]: number
  readonly [RanGE_KEY]: string
  picture: string
}

const User = define<IUser, IUser[typeof HASH_KEY], IUser[typeof RANGE_KEY]>(TABLE_NAME, HASH_KEY, RANGE_KEY)
```

4. Scan

```typescript
const result = await User
	.scan()
  .consistent()
  .limit(1)
  .filter((and, or) => {
    and
      .eq('name', 'deptno')
  })
  .project('name, userId')
  .run()
```

5. Query

```typescript
const result = await User
	.query(5945) // hashkey value
  .range('createdAt') //rangekey name
  .beginsWith('2018-11-11')
  .desc()
  .consistent()
  .limit(1)
  .filter((and, or) => {
    and
      .eq('name', 'deptno')
  })
  .project('name, userId')
  .run()
```

6. Get item

```typescript
const userDocument = await User.get('hello', 'world')
```

7. Handle `Document`

```typescript
const user = User.of({
  id: 59451
  createdAt: '2018-11-01T09:20:08.128Z'
})
await user.put()
user.set(doc => {
  doc.data = 'added'
})
await user.update()
await user.delete()
```