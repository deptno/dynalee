import {getLogger} from '../util/debug'
import {Model} from './model'

const logger = getLogger(__filename)

interface SchemaEx {
  readonly detail: string
  readonly id: string
}

+async function () {
  const User = new Model<SchemaEx, SchemaEx['id'], SchemaEx['detail']>('dev-readish-user', 'id', 'detail')
  const data = await User
    .scan()
    .project(`id, detail, loginCount`)
    .filter((and, or) => {
      and
        .eq('id', '1223020')
    })
    .run()
  console.log('data', data)
}()
