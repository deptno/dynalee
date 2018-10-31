import {mergeByTypes} from '../../util'
import {replacementKeyGenerator, replacementValueGenerator} from '../expression/helper'
import {FilterOperator} from './filter'

interface S {
  readonly hashkey: number
  readonly rangekey: string
}
describe('FilterOperator', () => {
  describe('methods', function () {
    it('.eq', () => {
      const done = expect({
        FilterExpression         : '#a = :a',
        ExpressionAttributeNames : {'#a': 'testEq'},
        ExpressionAttributeValues: {':a': 'a'}
      }).toEqual
      FilterOperator
        .of<S>(replacementKeyGenerator(), replacementValueGenerator(), done)
        .eq('testEq', 'a')
    })
    it('.ne', () => {
      const done = expect({
        FilterExpression         : '#a <> :a',
        ExpressionAttributeNames : {'#a': 'testNe'},
        ExpressionAttributeValues: {':a': 4}
      }).toEqual
      FilterOperator
        .of<S>(replacementKeyGenerator(), replacementValueGenerator(), done)
        .ne('testNe', 4)
    })
    it('.lt', () => {
      const done = expect({
        FilterExpression         : '#a < :a',
        ExpressionAttributeNames : {'#a': 'testLt'},
        ExpressionAttributeValues: {':a': 4}
      }).toEqual
      FilterOperator
        .of<S>(replacementKeyGenerator(), replacementValueGenerator(), done)
        .lt('testLt', 4)
    })
    it('.le', () => {
      const done = expect({
        FilterExpression         : '#a <= :a',
        ExpressionAttributeNames : {'#a': 'testLE'},
        ExpressionAttributeValues: {':a': 4}
      }).toEqual
      FilterOperator
        .of<S>(replacementKeyGenerator(), replacementValueGenerator(), done)
        .le('testLE', 4)
    })
    it('.gt', () => {
      const done = expect({
        FilterExpression         : '#a > :a',
        ExpressionAttributeNames : {'#a': 'testGT'},
        ExpressionAttributeValues: {':a': 4}
      }).toEqual
      FilterOperator
        .of<S>(replacementKeyGenerator(), replacementValueGenerator(), done)
        .gt('testGT', 4)
    })
    it('.ge', () => {
      const done = expect({
        FilterExpression         : '#a >= :a',
        ExpressionAttributeNames : {'#a': 'testGe'},
        ExpressionAttributeValues: {':a': 4}
      }).toEqual
      FilterOperator
        .of<S>(replacementKeyGenerator(), replacementValueGenerator(), done)
        .ge('testGe', 4)
    })
    it('.between', () => {
      const done = expect({
        FilterExpression         : '#a BETWEEN (:a, :b)',
        ExpressionAttributeNames : {'#a': 'testBetween'},
        ExpressionAttributeValues: {':a': 'a', ':b': 1}
      }).toEqual
      FilterOperator
        .of<S>(replacementKeyGenerator(), replacementValueGenerator(), done)
        .between('testBetween', 'a', 1)
    })
    it('.in', () => {
      const done = expect({
        FilterExpression         : '#a IN (:a,:b,:c,:d)',
        ExpressionAttributeNames : {'#a': 'testIn'},
        ExpressionAttributeValues: {':a': 'TT', ':b': 'TTT', ':c': 33, ':d': 333}
      }).toEqual
      FilterOperator
        .of<S>(replacementKeyGenerator(), replacementValueGenerator(), done)
        .in('testIn', 'TT', 'TTT', 33, 333)
    })
    it('.attributeExists', () => {
      const done = expect({
        FilterExpression        : 'attribute_exists(#a)',
        ExpressionAttributeNames: {'#a': 'testAttributeExists'}
      }).toEqual
      FilterOperator
        .of<S>(replacementKeyGenerator(), replacementValueGenerator(), done)
        .attributeExists('testAttributeExists')
    })
    it('.attributeNotExists', () => {
      const done = expect({
        FilterExpression        : 'attribute_not_exists(#a)',
        ExpressionAttributeNames: {'#a': 'testAttributeNotExists'}
      }).toEqual
      FilterOperator
        .of<S>(replacementKeyGenerator(), replacementValueGenerator(), done)
        .attributeNotExists('testAttributeNotExists')
    })
    it('.attributeType', () => {
      const done = expect({
        FilterExpression         : 'attribute_type(#a, :a)',
        ExpressionAttributeNames : {'#a': 'testAttirubteType'},
        ExpressionAttributeValues: {':a': 'NS'}
      }).toEqual
      FilterOperator
        .of<S>(replacementKeyGenerator(), replacementValueGenerator(), done)
        .attributeType('testAttirubteType', 'NS')
    })
    it('.beginsWith', () => {
      const done = expect({
        FilterExpression         : 'begins_with(#a, :a)',
        ExpressionAttributeNames : {'#a': 'testBeginsWith'},
        ExpressionAttributeValues: {':a': '^^'}
      }).toEqual
      FilterOperator
        .of<S>(replacementKeyGenerator(), replacementValueGenerator(), done)
        .beginsWith('testBeginsWith', '^^')
    })
    it('.contains', () => {
      const done = expect({
        FilterExpression         : 'contains(#a, :a)',
        ExpressionAttributeNames : {'#a': 'testContains'},
        ExpressionAttributeValues: {':a': 'included?'}
      }).toEqual
      FilterOperator
        .of<S>(replacementKeyGenerator(), replacementValueGenerator(), done)
        .contains('testContains', 'included?')
    })
  })

  it('should increment replace id', () => {
    let store = {}
    const done = (params) => store = mergeByTypes('AND', store, params)

    FilterOperator
      .of<S>(replacementKeyGenerator(), replacementValueGenerator(), done)
      .eq('testEq', 'a')
      .ne('testNe', 4)

    expect({
      FilterExpression         : '#a = :a AND #b <> :b',
      ExpressionAttributeNames : {'#a': 'testEq', '#b': 'testNe'},
      ExpressionAttributeValues: {':a': 'a', ':b': 4}
    }).toEqual(store)
  })
})




