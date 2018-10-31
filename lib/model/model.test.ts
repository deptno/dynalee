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
    .query('offlineContext_cognitoIdentityId')
    .range('detail')
    .beginsWith('google|')
    .project(`id, detail, loginCount`)
    .filter((and, or) => {
      and
        .between('loginCount', 2, 3)
        .ne('loginCount', 177)
        .attributeNotExists('loginCount')
//      or
//        .attributeExists('loginCount')
    })
    .run()
  await User.scan()
}()
