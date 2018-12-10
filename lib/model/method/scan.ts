import {Runner} from './internal/printable'
import {Read} from './internal/read'

export class Scan<S> extends Read<S> {
  constructor(runner: Runner<S>) {
    super(runner)
  }
}
