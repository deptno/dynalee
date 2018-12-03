import {DynamoDB} from 'aws-sdk'
import {date, name} from 'faker'
import {Model} from '../lib'
import {ELogs, getLogger} from '../lib/util/log'

const log = getLogger(ELogs.TEST)
const options = {
  region: 'dynamon',
  endpoint: 'http://localhost:8000'
}

const ddb = new DynamoDB(options)
interface Key {
  readonly name: string
  readonly createdAt: string
}

interface User extends Key {
  job: string
  accounts?: Account[]
}
interface Account extends Key {
}

const User = Model.define<User, string, string>({
  table: 'DynaleeTest',
  hash : 'name',
  range: 'createdAt',
})
const Pet = Model.define<Account, string, string>({
  table: 'DynaleeTest',
  hash: 'name',
  range: 'createdAt',
})

!async function () {
  try {
    const list = await ddb.listTables().promise()
    log(list)
    if (!list.TableNames || list.TableNames.length == 0) {
      await createTable()
    }

    const users = createUserData(4).map(data => User.of(data))
    const results = await Promise.all(users.map(user => user.put()))

    log(results)
  } catch (e) {
    console.log(e)
    console.error(e)
  }

}()

async function createTable() {
  const table = await ddb
    .createTable({
      AttributeDefinitions : [
        {
          AttributeName: 'name',
          AttributeType: 'N'
        },
        {
          AttributeName: 'createdAt',
          AttributeType: 'S'
        },
      ],
      KeySchema            : [
        {
          AttributeName: 'name',
          KeyType      : 'HASH'
        },
        {
          AttributeName: 'createdAt',
          KeyType      : 'RANGE'
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits : 1,
        WriteCapacityUnits: 1
      },
      TableName            : 'DynaleeTest',
    })
    .promise()
  log(table)
  return table
}

function createUserData(howmany: 4): User[] {
  return Array(howmany)
    .fill(0)
    .map((_, i) => {
      return {
        name     : name.title(),
        createdAt: date.past().toISOString(),
        job      : name.jobType(),
        accounts : []
      }
    })
}
