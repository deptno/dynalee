import {getLogger} from '../util/debug'
import {Model} from './model'

const logger = getLogger(__filename)

interface SchemaEx {
  readonly detail: string
  readonly id: string
}

describe('Model', function () {
  it('queryOne', async done => {
    const User = new Model<SchemaEx, SchemaEx['id'], SchemaEx['detail']>('dynalee', 'id', 'detail', {})
    const data = await User.queryOne('hello')
    logger(data)
    done()
  })
})