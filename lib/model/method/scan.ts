import {TScalar} from '../../engine'
import {Runner} from './internal/printable'
import {Read} from './internal/read'

export class Scan<S, H extends TScalar> extends Read<S, H> {
  constructor(runner: Runner<S, H>) {
    super(runner)
  }
}
