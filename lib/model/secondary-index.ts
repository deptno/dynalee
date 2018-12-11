import {TScalar} from '../engine'
import {ELogs, getLogger} from '../util/log'
import {Readable, ReadableParams} from './readable'

const log = getLogger(ELogs.MODEL_SECONDARY_INDEX)

export interface SecondaryIndexParams<S, H extends keyof S, RK extends keyof S> extends ReadableParams<S, H, RK> {
  index: string
}

export class SecondaryIndex<S, H extends keyof S, RK extends keyof S = never> extends Readable<S, H, RK> {
  private readonly index: string

  constructor(params: SecondaryIndexParams<S, H, RK>) {
    super(params)
    this.index = params.index
  }
}

