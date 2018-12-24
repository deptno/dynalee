import {Omit} from 'ramda'
import {dynamodbValue} from '../../util/dynamodb-document'
import {ELogs, getLogger} from '../../util/log'
import {TScalar} from '../engine'
import {TExpression} from '../expression/type'

const log = getLogger(ELogs.ENGINE_OPERATOR_UPDATER)
const operator: TExpression = 'UpdateExpression'
export class Updater<S> {
  constructor(private genKey, private genValue, private done) {
  }

  public readonly expressionType: string = operator
  public readonly expressions: string[] = []

  of(schema: Partial<S>, ifNotExists?: boolean) {
    //@todo: replace needs to support condition to prevent overwrite
    for (const [key, value] of Object.entries(schema)) {
      this.setUnsafe(key, value, ifNotExists)
    }
    return this
  }

  set<K extends keyof S>(path: K, value: S[K], ifNotExists?: boolean) {
    return this.setUnsafe(path, value, ifNotExists)
  }

  setUnsafe(path: string, value: TScalar, ifNotExists?: Boolean) {
    if (value === undefined) {
      log(`set {${path}: ${value}} is ignored`)
      return this
    }

    const ddbValue = dynamodbValue(value)
    if (ddbValue === null) {
      return this
    }
    const rKey = this.genKey(path)
    const rValue = this.genValue()

    this.expressions.push(`SET ${rKey} = ${
      !ifNotExists
        ? rValue
        : `if_not_exists(${rKey}, ${rValue})`
      }`)
    this.done({
      ExpressionAttributeNames : {[rKey]: path},
      ExpressionAttributeValues: {[rValue]: ddbValue}
    })
    return this
  }

  plus<K extends keyof S>(path: K, a: Extract<S[K], number>): this
  plus<K extends keyof S>(path: K, a: K, b: Extract<S[K], number>): this
  plus(path, a, b?) {
    return this.plusUnsafe(path, a, b)
  }

  plusUnsafe(path: string, a: string | TScalar, b: TScalar) {
    if (a === undefined) {
      log(`plus {${path}: ${a}} is ignored`)
      return this
    }
    const rKey = this.genKey(path)

    if (typeof a === 'number') {
      // path + value
      const ddbValue = dynamodbValue(a)
      if (ddbValue === null) {
        return this
      }
      const rValueA = this.genValue()
      this.expressions.push(`SET ${rKey} = ${rKey} + ${rValueA}`)
      this.done({
        ExpressionAttributeNames : {[rKey]: path},
        ExpressionAttributeValues: {[rValueA]: ddbValue}
      })
    } else if (typeof b === 'number') {
      // another path + value
      const ddbValue = dynamodbValue(b)
      if (ddbValue === null) {
        return this
      }
      const rKeyA = this.genKey(a)
      const rValueA = this.genValue()
      this.expressions.push(`SET ${rKey} = ${rKeyA} + ${rValueA}`)
      this.done({
        ExpressionAttributeNames : {
          [rKey] : path,
          [rKeyA]: a
        },
        ExpressionAttributeValues: {[rValueA]: ddbValue}
      })
    } else {
      if (!b) {
        throw new Error('.plus(string, string, string)')
      }
      // another path + another path
      const rKeyA = this.genKey(a)
      const rKeyB = this.genKey(b)
      this.expressions.push(`SET ${rKey} = ${rKeyA} + ${rKeyB}`)
      this.done({
        ExpressionAttributeNames: {
          [rKey] : path,
          [rKeyA]: a,
          [rKeyB]: b,
        },
      })
    }
    return this
  }


  minus<K extends keyof S>(path: K, a: Extract<S[K], number>): this
  minus<K extends keyof S>(path: K, a: K, b: Extract<S[K], number>): this
  minus(path, a, b?) {
    return this.minusUnsafe(path, a, b)
  }

  minusUnsafe(path: string, a: string | TScalar, b: TScalar) {
    if (a === undefined) {
      log(`minus {${path}: ${a}} is ignored`)
      return this
    }

    const rKey = this.genKey(path)

    if (typeof a === 'number') {
      // path - value
      const ddbValue = dynamodbValue(a)
      if (ddbValue === null) {
        return this
      }
      const rValueA = this.genValue()
      this.expressions.push(`SET ${rKey} = ${rKey} - ${rValueA}`)
      this.done({
        ExpressionAttributeNames : {[rKey]: path},
        ExpressionAttributeValues: {[rValueA]: ddbValue}
      })
    } else if (typeof b === 'number') {
      // another path - value
      const ddbValue = dynamodbValue(b)
      if (ddbValue === null) {
        return this
      }
      const rKeyA = this.genKey(a)
      const rValueA = this.genValue()
      this.expressions.push(`SET ${rKey} = ${rKeyA} - ${rValueA}`)
      this.done({
        ExpressionAttributeNames : {
          [rKey] : path,
          [rKeyA]: a
        },
        ExpressionAttributeValues: {[rValueA]: dynamodbValue(b)}
      })
    } else {
      // another path - another path
      const rKeyA = this.genKey(a)
      const rKeyB = this.genKey(b)
      this.expressions.push(`SET ${rKey} = ${rKeyA} - ${rKeyB}`)
      this.done({
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
  append<K extends keyof S, L extends Extract<S[K], any[]>>(path: K, array: L): this
  append<K extends keyof S, K2 extends Omit<keyof S, K>, L extends Extract<S[K], any[]>>(path: K, sourceProp: K2, array: L): this
  append(path, sourceProp, array?) {
    return this.appendUnsafe(path, sourceProp, array)
  }

  appendUnsafe(path: string, sourceProp: string | any[], array?: any) {
    console.warn('@todo')
    const rKey = this.genKey(path)
    const rValue = this.genValue()

    if (array === undefined) {
      array = sourceProp
      const ddbValue = dynamodbValue(array)
      if (ddbValue === null) {
        return this
      }
      this.expressions.push(`SET ${rKey} = list_append(${rKey}, ${rValue})`)
      this.done({
        ExpressionAttributeNames : {[rKey]: path},
        ExpressionAttributeValues: {[rValue]: ddbValue}
      })
    } else {
      const ddbValue = dynamodbValue(array)
      if (ddbValue === null) {
        return this
      }
      const rSourceKey = this.genKey(sourceProp)
      this.expressions.push(`SET ${rKey} = list_append(${rSourceKey}, ${rValue})`)
      this.done({
        ExpressionAttributeNames : {
          [rKey]      : path,
          [rSourceKey]: sourceProp
        },
        ExpressionAttributeValues: {[rValue]: ddbValue}
      })
    }
    return this
  }

  remove<K extends keyof S>(...paths: K[]): this {
    return this.removeUnsafe(...paths)
  }

  removeUnsafe(...paths: (keyof S | string)[]): this {
    // @todo check to includes Index character
    const expressionAttributeNames = paths.reduce((acc, path) => {
      if (!path) {
        log(`remove ${path} is ignored`)
        return this
      }
      acc[this.genKey(path)] = path
      return acc
    }, {})
    this.expressions.push(`REMOVE ${Object.keys(expressionAttributeNames).join(', ')}`)
    this.done({
      ExpressionAttributeNames: expressionAttributeNames
    })
    return this
  }

  add<K extends keyof S, SET extends Extract<S[K], Set<TScalar>>>(path: K, value: SET|Extract<S[K], number>) {
    return this.addUnsafe(path, value)
  }

  addUnsafe(path: string, value: Set<TScalar>|number) {
    const ddbValue = dynamodbValue(value)
    if (ddbValue === null) {
      return this
    }
    const rKey = this.genKey(path)
    const rValue = this.genValue()

    this.expressions.push(`ADD ${rKey} ${rValue}`)
    this.done({
      ExpressionAttributeNames : {[rKey]: path},
      ExpressionAttributeValues: {[rValue]: ddbValue}
    })
    return this
  }

  delete<K extends keyof S, SET extends Extract<S[K], Set<TScalar>>>(path: K, value: SET) {
    return this.deleteUnsafe(path, value)
  }

  deleteUnsafe(path: string, value: Set<TScalar>) {
    const ddbValue = dynamodbValue(value)
    if (ddbValue === null) {
      return this
    }
    const rKey = this.genKey(path)
    const rValue = this.genValue()

    this.expressions.push(`DELETE ${rKey} ${rValue}`)
    this.done({
      ExpressionAttributeNames : {[rKey]: path},
      ExpressionAttributeValues: {[rValue]: ddbValue}
    })
    return this
  }
}
