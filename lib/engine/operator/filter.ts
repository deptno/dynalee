import {TExpression} from '../expression/type'
import {Condition} from './condition'

export class Filter<S = any> extends Condition<S> {
  protected readonly expression: TExpression = 'FilterExpression'
}
