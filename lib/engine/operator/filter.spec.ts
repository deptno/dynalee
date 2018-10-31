import {mergeByTypes} from '../../util'
import {replacementKeyGenerator, replacementValueGenerator} from '../expression/helper'
import {FilterOperator} from './filter'
import R from 'ramda'

interface S {
  readonly hashkey: number
  readonly rangekey: string
}
describe('FilterOperator', () => {
  const done = R.compose(console.log, mergeByTypes)
  xit('should be created', () => {
    const f = FilterOperator.of<S>(replacementKeyGenerator(), replacementValueGenerator(), done)
    f
      .eq('hashkey', 'a')
      .le('number', 4)
  })
  xit('should be created', () => {
  })
})
