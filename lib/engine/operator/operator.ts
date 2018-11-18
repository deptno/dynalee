import {TScalar} from '../engine'
import {$between, $eq, $ge, $gt, $in, $le, $lt, $ne} from '../expression/comparator'
import {$attributeExists, $attributeNotExists, $attributeType, $beginsWith, $contains} from '../expression/function'
import {DDBDataType, TExpression} from '../expression/type'

const operator: TExpression = 'FilterExpression'
export class FilterOperator<S, K extends string = keyof S, T = TScalar> implements Operator<K, T> {
  private constructor(private genKey, private genValue, private done) {
  }

  static of<S, K extends string = keyof S, T = TScalar>(genKey, genValue, done) {
    return new FilterOperator<S, K, T>(genKey, genValue, done)
  }

  eq(path, value) {
    this.done($eq(operator, this.genKey, this.genValue, path, value))
    return this
  }

  ne(path, value) {
    this.done($ne(operator, this.genKey, this.genValue, path, value))
    return this
  }

  lt(path, value) {
    this.done($lt(operator, this.genKey, this.genValue, path, value))
    return this
  }

  le(path, value) {
    this.done($le(operator, this.genKey, this.genValue, path, value))
    return this
  }

  gt(path, value) {
    this.done($gt(operator, this.genKey, this.genValue, path, value))
    return this
  }

  ge(path, value) {
    this.done($ge(operator, this.genKey, this.genValue, path, value))
    return this
  }

  in(path, ...values) {
    this.done($in(operator, this.genKey, this.genValue, path, ...values))
    return this
  }

  between(path, a, b) {
    this.done($between(operator, this.genKey, this.genValue, path, a, b))
    return this
  }

  attributeExists(path: string) {
    this.done($attributeExists(operator, this.genKey, path))
    return this
  }

  attributeNotExists(path: string) {
    this.done($attributeNotExists(operator, this.genKey, path))
    return this
  }

  attributeType(path: string, type: DDBDataType) {
    this.done($attributeType(operator, this.genKey, this.genValue, path, type))
    return this
  }

  beginsWith(path: string, sub: string) {
    this.done($beginsWith(operator, this.genKey, this.genValue, path, sub))
    return this
  }

  contains(path: string, sub: string) {
    this.done($contains(operator, this.genKey, this.genValue, path, sub))
    return this
  }

  size() {
    throw new Error('@todo size()')
  }
}

interface Operator<K, T> {
  eq(path: K, value: T): this
  ne(path: K, value: T): this
  lt(path: K, value: T): this
  le(path: K, value: T): this
  gt(path: K, value: T): this
  ge(path: K, value: T): this
  between(path: K, a: T, b: T): this
  in(path: K, ...values: T[]): this
  attributeExists(path: K): this
  attributeNotExists(path: K): this
  attributeType(path: K, type: DDBDataType): this
  beginsWith(path: K, value: string): this
  contains(path: K, value: string): this
  //  size
}
