import debug from 'debug'
import {TScalar} from '../../engine'
import {Runner} from './internal/printable'
import {Read} from './internal/read'

const log = debug(['dynalee', __filename].join(':'))

export class Scan<S, H extends TScalar> extends Read<S, H> {
  constructor(runner: Runner<S, H>) {
    super(runner)
  }
}
