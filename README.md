# dynalee

**dyanlee** is **DML** only **DynamoDB ORM**

Strongly typed.

Define model with way to follows DynamoDB philosophy.

## usage
### Model
#### define hash model
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
  name: 'first cat',
  birth: 2018,
  color: 'white'
})

const docCat = await aCat.put() // save
console.log(docCat.head())
/*
{
  name: 'first cat'
  birth: 2018
  color: 'white'
}
*/
```

#### define multiple model in one table
```typescript
import {RangeModel} from 'dynalee'

interface Index {
  name: string
  birth: number
}
interface Cat extends Index {
  color: string
  age?: number,
  doYouWantSet?: string[]|Set<string> // use union for DynamoDB type and javascript type
  doYouWantList?: string[]
}
interface Dog extends Index {
  longLegs: boolean
}

const model = new RangeModel<Index, 'name', 'birth'>({
  table: 'TableName',
  hashKey: 'name',
  rangeKey: 'birth',
})
const CatModel = model as RangeModel<Cat, 'name', 'birth'>
const DogModel = model as RangeModel<Dog, 'name', 'birth'>
```

#### update 
```typescript
CatModel
    .update('deptno cat', '1985')
    .update(setter => {
      setter 
          .of({
            age: 10,
            color: 'white'
          }) // set multiple props
    })
    condition(setter => {
      setter.attributeNotExists('ID')
    })
    .returnValue('NONE')
    .run()
```

#### update 2
```typescript
CatModel
    .update('deptno cat', '1985')
    .update(setter => {
      setter 
        .set('color', 'white')
        .add('age', 10)
    })
    condition((and, or, not) => {
      and.attributeNotExists('ID')
    })
    .returnValue('NONE')
    .run()
```

#### delete
```typescript
CatModel.delete('deptno cat', '1985')
```

#### get item
```typescript
CatModel.get('deptno cat', '1985')
```

### Document

#### create
```typescript
const document = await CatModel
    .of({
        name: 'son of deptno cat',
        birth: '2006',
        age: 10
    })
    .put() // save
```

#### get raw data
```typescript
const document = await CatModel.get('deptno cat', '1985')
const rawdata = document.head()
```

#### delete
```typescript
const document = await CatModel.get('deptno cat', '1985')
document.delete()
```

#### put
```typescript
const document = await CatModel.get('deptno cat', '1985')
await document
    .set(setter => {
      setter.age = 10
      setter.color = 'white'
    })
    .put()
```

### SecondaryIndex
#### define secondary index
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
  hashKey: 'species',
  rangeKey: 'birth'
})
const CatModel = model as SecondaryIndex<Cat, 'name', 'birth'>
const DogModel = model as SecondaryIndex<Dog, 'name', 'birth'>
```

#### query on secondary index
```typescript
const documents = await CatModel
    .query('Turkish Angora')
    .run()
const items = documents.Items.map(item => item.head())
```

#### query on secondary index
```typescript
const documents = await CatModel
    .rangeQuery('Turkish Angora')
    .eq('2006')
    .run()
const items = documents.Items.map(item => item.head())
```

#### more query options
```typescript
const nextToken = null
const documents = await CatModel
    .rangeQuery('Turkish Angora')
    .eq('2006')
    .desc()
    .consistent()
    .limit(10)
    .startAt(nextToken)
    .run()
const items = documents.Items.map(item => item.head())
```

#### scan on secondary index
```typescript
const documents = await CatModel
    .scan()
    .filter(setter => {
        setter.attributeNotExists('specis')
    })
    .run()
const items = documents.Items.map(item => item.head())
```

### advanced usage

#### Set
```typescript
const cat = await CatModel
    .of({
      name: 'my cat',
      birth: '2018',
      age: 10,
      doYouWantSet: new Set(['string set 1', 'string set 2'])
    })
    .update(setter => { // example code, `of` method can include below props
      setter
        .plus('age', 1)
        .add('doYouWantSet', new Set(['string set 3']))
    })
    .put()
    
const document = cat.head()
console.log(document.doYouWantSet instanceof Set) // true

const jsDocument = cat.head(true)
console.log(jsDocument.doYouWantSet instanceof Set) // false
console.log(Array.isArray(jsDocument.doYouWantSet)) // true
```

#### List
```typescript
const cat = await CatModel
    .of({
      name: 'my cat',
      birth: '2018',
      age: 10,
      doYouWantList: ['string 1', 'string 2']
    })
    .update(setter => { // example code, `of` method can include below props
      setter
        .plus('age', 1)
        .add('doYouWantSet', ['string 3'])
    })
    .put()
```

#### Trigger

likes CreatedAt, UpdatedAt

```typescript
import {HashModel, DocumentOptions} from 'dynalee'
const document: DocumentOptions = {
  onCreate: [
    {
      attributeName: 'CreatedAt',
      handler(prevVal?) {
        return new Date().toISOString()
      }
    },
  ],
  onUpdate: [
    {
      attributeName: 'UpdatedAt',
      handler(prevVal?) {
        return new Date().toISOString()
      }
    }
  ],
}
interface Cat {
  name: string
}
const CatModel = new HashModel<Cat, 'name'>({
  table: 'TableName',
  hashKey: 'name',
  options: {
    document
  }
})
```

#### use with [dynamon](https://github.com/deptno/dynamon)
```typescript
import {HashModel} from 'dynalee'
interface Cat {
  name: string
}
const CatModel = new HashModel<Cat, 'name'>({
  table: 'TableName',
  hashKey: 'name',
  options: {
    aws: {
      region  : 'dynamon',
      endpoint: 'http://localhost:8000'
    },
  }
})
```

## link

[#dynamon](https://github.com/deptno/dynamon)

## license

MIT