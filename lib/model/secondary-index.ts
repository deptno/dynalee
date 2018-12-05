import {TScalar} from '../engine'
import {ELogs, getLogger} from '../util/log'
import {Readable, ReadableParams} from './readable'

const log = getLogger(ELogs.MODEL_SECONDARY_INDEX)

export interface SecondaryIndexParams<S> extends ReadableParams<S> {
  index: string
}

export class SecondaryIndex<S, H extends TScalar, R extends TScalar = never> extends Readable<S, H, R> {
  private readonly index: string

  constructor(params: SecondaryIndexParams<S>) {
    super(params)
    this.index = params.index
  }
  static define<S, H extends TScalar, R extends TScalar = never>(params: SecondaryIndexParams<S>) {
    return new SecondaryIndex<S, H, R>(params)
  }
}

