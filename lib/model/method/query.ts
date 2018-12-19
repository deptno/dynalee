import {ELogs, getLogger} from '../../util/log'
import {Runner} from './internal/printable'
import {Read} from './internal/read'

const log = getLogger(ELogs.MODEL_METHOD_QUERY)

export class Query<S, HK extends keyof S> extends Read<S> {
  constructor(runner: Runner<S>, protected hashKey: HK, protected hashVal: S[HK]) {
    super(runner)
    this.params = {
      KeyConditionExpression   : `#HSK = :HSK`,
      ExpressionAttributeNames : {
        '#HSK': this.hashKey,
      },
      ExpressionAttributeValues: {
        ':HSK': this.hashVal
      }
    }
  }

  /**
   * Set descend order
   * @returns {this<S, HK>}
   */
  desc() {
    return this.merge({ScanIndexForward: false})
  }
}
