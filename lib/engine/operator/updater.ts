import {TScalar} from '../engine'
import {TExpression} from '../expression/type'

const operator: TExpression = 'UpdateExpression'
export class Updater<S, K extends string = keyof S, T = TScalar> implements Operator<K, T> {
  private constructor(private genKey, private genValue, private done) {
  }

  static of<S, K extends string = keyof S, T = TScalar>(genKey, genValue, done) {
    return new Updater<S, K, T>(genKey, genValue, done)
  }

  set(path: K, value: T) {
    const rKey = this.genKey()
    const rValue = this.genValue()

    this.done({
      [operator]               : `SET ${rKey} = ${rValue}`,
      ExpressionAttributeNames : {[rKey]: path},
      ExpressionAttributeValues: {[rValue]: value}
    })
    return this
  }

  plus(path, a, b?) {
    const rKey = this.genKey()

    if (typeof a === 'number') {
      // path + value
      const rValueA = this.genValue()
      this.done({
        [operator]               : `SET ${rKey} = ${rKey} + ${rValueA}`,
        ExpressionAttributeNames : {[rKey]: path},
        ExpressionAttributeValues: {[rValueA]: a}
      })
    } else if (typeof b === 'number') {
      // another path + value
      const rKeyA = this.genKey()
      const rValueA = this.genValue()
      this.done({
        [operator]               : `SET ${rKey} = ${rKeyA} + ${rValueA}`,
        ExpressionAttributeNames : {
          [rKey] : path,
          [rKeyA]: a
        },
        ExpressionAttributeValues: {[rValueA]: b}
      })
    } else {
      if (!b) {
        throw new Error('.plus(string, string, string)')
      }
      // another path + another path
      const rKeyA = this.genKey()
      const rKeyB = this.genKey()
      this.done({
        [operator]              : `SET ${rKey} = ${rKeyA} + ${rKeyB}`,
        ExpressionAttributeNames: {
          [rKey] : path,
          [rKeyA]: a,
          [rKeyB]: b,
        },
      })
    }
    return this
  }

  minus(path, a, b?) {
    const rKey = this.genKey()

    if (typeof a === 'number') {
      // path - value
      const rValueA = this.genValue()
      this.done({
        [operator]               : `SET ${rKey} = ${rKey} - ${rValueA}`,
        ExpressionAttributeNames : {[rKey]: path},
        ExpressionAttributeValues: {[rValueA]: a}
      })
    } else if (typeof b === 'number') {
      // another path - value
      const rKeyA = this.genKey()
      const rValueA = this.genValue()
      this.done({
        [operator]               : `SET ${rKey} = ${rKeyA} - ${rValueA}`,
        ExpressionAttributeNames : {
          [rKey] : path,
          [rKeyA]: a
        },
        ExpressionAttributeValues: {[rValueA]: b}
      })
    } else {
      // another path - another path
      const rKeyA = this.genKey()
      const rKeyB = this.genKey()
      this.done({
        [operator]              : `SET ${rKey} = ${rKeyA} - ${rKeyB}`,
        ExpressionAttributeNames: {
          [rKey] : path,
          [rKeyA]: a,
          [rKeyB]: b,
        },
      })
    }
    return this
  }

  // @todo support if_not_exists
  // ref: https://stackoverflow.com/questions/34951043/is-it-possible-to-combine-if-not-exists-and-list-append-in-update-item
  append(path, sourceProp, set?) {
    console.warn('@todo')
    const rKey = this.genKey()
    const rValue = this.genValue()

    if (set === undefined) {
      set = sourceProp
      this.done({
        [operator]               : `SET ${rKey} = list_append(${rKey}, ${rValue})`,
        ExpressionAttributeNames : {[rKey]: path},
        ExpressionAttributeValues: {[rValue]: set}
      })
    } else {
      const rSourceKey = this.genKey()
      this.done({
        [operator]               : `SET ${rKey} = list_append(${rSourceKey}, ${rValue})`,
        ExpressionAttributeNames : {
          [rKey]: path,
          [rSourceKey]: sourceProp
        },
        ExpressionAttributeValues: {[rValue]: set}
      })
    }
    return this
  }

  remove(...paths) {
    // @todo check to includes Index character
    const expressionAttributeNames = paths.reduce((acc, path) => {
      acc[this.genKey()] = path
      return acc
    }, {})
    this.done({
      [operator]: `REMOVE ${Object.keys(expressionAttributeNames).join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames
    })
    return this
  }

  add(path: K, value: T) {
    // @todo
    console.warn('add() is not implemented yet.')
    return this
  }

  delete(path: K, value: T) {
    // @todo
    console.warn('delete() is not implemented yet.')
    return this
  }
}

interface Operator<K, T> {
  set(path: K, value: T): this

  plus(path: K, a: T, b: T): this
  plus(path: K, a: T, b: number): this
  plus(path: K, a: number): this

  minus(path: K, value: T): this
  minus(path: K, a: T, b: number): this
  minus(path: K, a: number): this

  append(path: K, sourceProp: T, set: Set<T>): this
  append(path: K, set: Set<T>): this

  remove(...paths: (K | string)[]): this

  add(path: K, value: T): this

  delete(path: K, value: T): this
}

