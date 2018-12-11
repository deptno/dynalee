import {TScalar} from '../engine'
import {$between, $eq, $ge, $gt, $in, $le, $lt, $ne} from '../expression/comparator'
import {$attributeExists, $attributeNotExists, $attributeType, $beginsWith, $contains} from '../expression/function'
import {DDBDataType, TExpression} from '../expression/type'

const expression: TExpression = 'FilterExpression'
export class Filter<S = any> {
  constructor(private genKey, private genValue, private done) {
  }

  eq<K extends keyof S, T = S[K]>(path: K, value: T) {
    this.done($eq(expression, this.genKey, this.genValue, path, value))
    return this
  }

  ne<K extends keyof S, T = S[K]>(path: K, value: T) {
    this.done($ne(expression, this.genKey, this.genValue, path, value))
    return this
  }

  lt<K extends keyof S, T = S[K]>(path: K, value: T) {
    this.done($lt(expression, this.genKey, this.genValue, path, value))
    return this
  }

  le<K extends keyof S, T = S[K]>(path: K, value: T) {
    this.done($le(expression, this.genKey, this.genValue, path, value))
    return this
  }

  gt<K extends keyof S, T = S[K]>(path: K, value: T) {
    this.done($gt(expression, this.genKey, this.genValue, path, value))
    return this
  }

  ge<K extends keyof S, T = S[K]>(path: K, value: T) {
    this.done($ge(expression, this.genKey, this.genValue, path, value))
    return this
  }

  in<K extends keyof S, T = S[K]>(path: K, ...values: T[]) {
    this.done($in(expression, this.genKey, this.genValue, path, ...values))
    return this
  }

  between<K extends keyof S, T = S[K]>(path: K, a: T, b: T) {
    this.done($between(expression, this.genKey, this.genValue, path, a, b))
    return this
  }

  attributeExists<K extends keyof S>(path: K) {
    this.done($attributeExists(expression, this.genKey, path))
    return this
  }

  attributeNotExists<K extends keyof S>(path: K) {
    this.done($attributeNotExists(expression, this.genKey, path))
    return this
  }

  attributeType<K extends keyof S>(path: K, type: DDBDataType) {
    this.done($attributeType(expression, this.genKey, this.genValue, path, type))
    return this
  }

  beginsWith<K extends keyof S>(path: K, sub: string) {
    this.done($beginsWith(expression, this.genKey, this.genValue, path, sub))
    return this
  }

  contains<K extends keyof S>(path: K, sub: string) {
    this.done($contains(expression, this.genKey, this.genValue, path, sub))
    return this
  }

  size() {
    throw new Error('@todo size()')
  }
}

