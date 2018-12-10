import {HashModel} from '../..'

interface Schema {
  key: string
  rangeN: number
}
const HASH_KEY = 'hashKey'
const RANGE_KEY = 'rangeKey'

describe('ComparisonOperator', () => {
  //  const Fake = new Model<Schema, Schema['key']>('dynalee', 'key')
  //  const Fake = new Model<Schema, Schema['key']>('dynalee', 'key', {})
  const Fake = new HashModel<Schema, Schema['key'], Schema['key']>({
    table: 'dynalee',
    hash: 'key',
    range: 'rangeN'
  })
  //  const Fake = new Model<Schema, Schema['key'], Schema['key']>('dynalee', 'key', 'rangeN', {})
  beforeEach(() => {
  })
  it('query', async done => {
    const ret = await Fake
      .query('hello')
      .range('rangeN')
    done()
  })
  it('eq', () => {
    //    console.log(ret(generator))
    //    console.log(merged)
  })
  it('ne', () => {
  })
  it('lt', () => {
  })
  it('le', () => {
  })
  it('gt', () => {
  })
  it('ge', () => {
  })
  it('between', () => {
  })
  it('in', () => {
  })
  it('attributeExists', () => {
  })
  it('attributeNotExists', () => {
  })
  it('attributeType', () => {
  })
  it('beginsWith', () => {
  })
  it('contains', () => {
  })
  describe('Helper', () => {
    it('static size', () => {
    })
  })
})
