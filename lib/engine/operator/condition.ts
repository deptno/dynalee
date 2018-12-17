import {$between, $eq, $ge, $gt, $in, $le, $lt, $ne} from '../expression/comparator'
import {$attributeExists, $attributeNotExists, $attributeType, $beginsWith, $contains} from '../expression/function'
import {DDBDataType, TExpression} from '../expression/type'

export class Condition<S = any> {
  protected readonly expression: TExpression = 'ConditionExpression'
  constructor(private genKey, private genValue, private done) {
  }

  eq<K extends keyof S, T = S[K]>(path: K, value: T) {
    this.done($eq(this.expression, this.genKey, this.genValue, path, value))
    return this
  }

  ne<K extends keyof S, T = S[K]>(path: K, value: T) {
    this.done($ne(this.expression, this.genKey, this.genValue, path, value))
    return this
  }

  lt<K extends keyof S, T = S[K]>(path: K, value: T) {
    this.done($lt(this.expression, this.genKey, this.genValue, path, value))
    return this
  }

  le<K extends keyof S, T = S[K]>(path: K, value: T) {
    this.done($le(this.expression, this.genKey, this.genValue, path, value))
    return this
  }

  gt<K extends keyof S, T = S[K]>(path: K, value: T) {
    this.done($gt(this.expression, this.genKey, this.genValue, path, value))
    return this
  }

  ge<K extends keyof S, T = S[K]>(path: K, value: T) {
    this.done($ge(this.expression, this.genKey, this.genValue, path, value))
    return this
  }

  in<K extends keyof S, T = S[K]>(path: K, ...values: T[]) {
    this.done($in(this.expression, this.genKey, this.genValue, path, ...values))
    return this
  }

  between<K extends keyof S, T = S[K]>(path: K, a: T, b: T) {
    this.done($between(this.expression, this.genKey, this.genValue, path, a, b))
    return this
  }

  attributeExists<K extends keyof S>(path: K) {
    this.done($attributeExists(this.expression, this.genKey, path))
    return this
  }

  attributeNotExists<K extends keyof S>(path: K) {
    this.done($attributeNotExists(this.expression, this.genKey, path))
    return this
  }

  attributeType<K extends keyof S>(path: K, type: DDBDataType) {
    this.done($attributeType(this.expression, this.genKey, this.genValue, path, type))
    return this
  }

  beginsWith<K extends keyof S>(path: K, sub: string) {
    this.done($beginsWith(this.expression, this.genKey, this.genValue, path, sub))
    return this
  }

  contains<K extends keyof S>(path: K, sub: string) {
    this.done($contains(this.expression, this.genKey, this.genValue, path, sub))
    return this
  }

  size() {
    throw new Error('@todo size()')
  }
}

