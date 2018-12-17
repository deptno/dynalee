# dynalee

`dyanlee` is **DML** only **DynamoDB ORM**

Strongly typescripted.

Define model with way to follows DynamoDB philosophy.

## usage

> simple

```typescript
import {HashModel} from 'dynalee'

interface Cat {
  name: string
  birth: number
  color: string
}

const CatModel = new HashModel<Cat, 'name'>({
  table: 'TableName',
  hashKey: 'name'
})

const aCat = CatModel.of({
  name: 'first cat'
  birth: 2018
  color: 'white'
})

const docCat = await aCat.put()
const cat = docCat.head() // save
/*
{
  name: 'first cat'
  birth: 2018
  color: 'white'
}
*
```

> define multiple model in one table

```typescript
import {RangeModel} from 'dynalee'

interface Index {
  name: string
  birth: number
}
interface Cat extends Index {
  color: string
}
interface Dog extends Index {
  longLegs: boolean
}

const model = new RangeModel<Index, 'name', 'birth'>({
  table: 'TableName',
  hashKey: 'name',
  rangeKey: 'birth'
})
const CatModel = model as RangeModel<Cat, 'name', 'birth'>
const DogModel = model as RangeModel<Dog, 'name', 'birth'>
```

## API

### class

> HashModel<Schema, HashKeyName>

> RangeModel<Schema, HashKeyName, RangeKeyName>

> SecondaryIndex<Schema, HashKeyName, RangeKeyName?>

```typescript
import {SecondaryIndex} from 'dynalee'

interface Index {
  name: string
  birth: number
}
interface Cat extends Index {
  color: string
}
interface Dog extends Index {
  longLegs: boolean
}

const model = new SecondaryIndex<Index, 'name', 'birth'>({
  table: 'TableName',
  index: 'IndexTable',
  hashKey: 'name',
  rangeKey: 'birth'
})
const CatModel = model as SecondaryIndex<Cat, 'name', 'birth'>
const DogModel = model as SecondaryIndex<Dog, 'name', 'birth'>
```

## todo

documentation @_@..

## license

MIT