import {mergeByTypes} from '../../util'
import {replacementKeyGenerator, replacementValueGenerator} from '../expression/helper'
import {FilterOperator} from './operator'

interface S {
  readonly hashkey: number
  readonly rangekey: string
}
describe('FilterOperator', () => {
  const compare = expected => actual => expect(actual).toEqual(expected)
  describe('methods', function () {
    it('.eq', () => {
      const done = compare({
        FilterExpression         : '#a = :a',
        ExpressionAttributeNames : {'#a': 'testEq'},
        ExpressionAttributeValues: {':a': 'a'}
      })
      FilterOperator
        .of<S>(replacementKeyGenerator(), replacementValueGenerator(), done)
        .eq('testEq', 'a')
    })
    it('.ne', () => {
      const done = compare({
        FilterExpression         : '#a <> :a',
        ExpressionAttributeNames : {'#a': 'testNe'},
        ExpressionAttributeValues: {':a': 4}
      })
      FilterOperator
        .of<S>(replacementKeyGenerator(), replacementValueGenerator(), done)
        .ne('testNe', 4)
    })
    it('.lt', () => {
      const done = compare({
        FilterExpression         : '#a < :a',
        ExpressionAttributeNames : {'#a': 'testLt'},
        ExpressionAttributeValues: {':a': 4}
      })
      FilterOperator
        .of<S>(replacementKeyGenerator(), replacementValueGenerator(), done)
        .lt('testLt', 4)
    })
    it('.le', () => {
      const done = compare({
        FilterExpression         : '#a <= :a',
        ExpressionAttributeNames : {'#a': 'testLE'},
        ExpressionAttributeValues: {':a': 4}
      })
      FilterOperator
        .of<S>(replacementKeyGenerator(), replacementValueGenerator(), done)
        .le('testLE', 4)
    })
    it('.gt', () => {
      const done = compare({
        FilterExpression         : '#a > :a',
        ExpressionAttributeNames : {'#a': 'testGT'},
        ExpressionAttributeValues: {':a': 4}
      })
      FilterOperator
        .of<S>(replacementKeyGenerator(), replacementValueGenerator(), done)
        .gt('testGT', 4)
    })
    it('.ge', () => {
      const done = compare({
        FilterExpression         : '#a >= :a',
        ExpressionAttributeNames : {'#a': 'testGe'},
        ExpressionAttributeValues: {':a': 4}
      })
      FilterOperator
        .of<S>(replacementKeyGenerator(), replacementValueGenerator(), done)
        .ge('testGe', 4)
    })
    it('.between', () => {
      const done = compare({
        FilterExpression         : '#a BETWEEN (:a AND :b)',
        ExpressionAttributeNames : {'#a': 'testBetween'},
        ExpressionAttributeValues: {':a': 'a', ':b': 1}
      })
      FilterOperator
        .of<S>(replacementKeyGenerator(), replacementValueGenerator(), done)
        .between('testBetween', 'a', 1)
    })
    it('.in', () => {
      const done = compare({
        FilterExpression         : '#a IN (:a,:b,:c,:d)',
        ExpressionAttributeNames : {'#a': 'testIn'},
        ExpressionAttributeValues: {':a': 'TT', ':b': 'TTT', ':c': 33, ':d': 333}
      })
      FilterOperator
        .of<S>(replacementKeyGenerator(), replacementValueGenerator(), done)
        .in('testIn', 'TT', 'TTT', 33, 333)
    })
    it('.attributeExists', () => {
      const done = compare({
        FilterExpression        : 'attribute_exists(#a)',
        ExpressionAttributeNames: {'#a': 'testAttributeExists'}
      })
      FilterOperator
        .of<S>(replacementKeyGenerator(), replacementValueGenerator(), done)
        .attributeExists('testAttributeExists')
    })
    it('.attributeNotExists', () => {
      const done = compare({
        FilterExpression        : 'attribute_not_exists(#a)',
        ExpressionAttributeNames: {'#a': 'testAttributeNotExists'}
      })
      FilterOperator
        .of<S>(replacementKeyGenerator(), replacementValueGenerator(), done)
        .attributeNotExists('testAttributeNotExists')
    })
    it('.attributeType', () => {
      const done = compare({
        FilterExpression         : 'attribute_type(#a, :a)',
        ExpressionAttributeNames : {'#a': 'testAttirubteType'},
        ExpressionAttributeValues: {':a': 'NS'}
      })
      FilterOperator
        .of<S>(replacementKeyGenerator(), replacementValueGenerator(), done)
        .attributeType('testAttirubteType', 'NS')
    })
    it('.beginsWith', () => {
      const done = compare({
        FilterExpression         : 'begins_with(#a, :a)',
        ExpressionAttributeNames : {'#a': 'testBeginsWith'},
        ExpressionAttributeValues: {':a': '^^'}
      })
      FilterOperator
        .of<S>(replacementKeyGenerator(), replacementValueGenerator(), done)
        .beginsWith('testBeginsWith', '^^')
    })
    it('.contains', () => {
      const done = compare({
        FilterExpression         : 'contains(#a, :a)',
        ExpressionAttributeNames : {'#a': 'testContains'},
        ExpressionAttributeValues: {':a': 'included?'}
      })
      FilterOperator
        .of<S>(replacementKeyGenerator(), replacementValueGenerator(), done)
        .contains('testContains', 'included?')
    })
  })

  it('should increment replace id', () => {
    let store = {}
    const updateStore = (params) => store = mergeByTypes('AND', store, params)
    FilterOperator
      .of<S>(replacementKeyGenerator(), replacementValueGenerator(), updateStore)
      .eq('testEq', 'a')
      .ne('testNe', 4)

    compare({
      FilterExpression         : '#a = :a AND #b <> :b',
      ExpressionAttributeNames : {'#a': 'testEq', '#b': 'testNe'},
      ExpressionAttributeValues: {':a': 'a', ':b': 4}
    })(store)
  })
})




