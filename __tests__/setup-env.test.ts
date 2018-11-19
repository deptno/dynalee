import {DynamoDB} from 'aws-sdk'
import {date, name} from 'faker'
import {define} from '../dist'
import {ELogs, getLogger} from '../lib/util/log'

const log = getLogger(ELogs.TEST)
const options = {
  region: 'dynamon',
  endpoint: 'http://localhost:8000'
}

const ddb = new DynamoDB(options)
const TABLE_NAME = 'DynaleeTest'
const HASH_KEY = 'name'
const RANGE_KEY = 'createdAt'

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

const User = define<User, Key[typeof HASH_KEY], Key[typeof RANGE_KEY]>(
  TABLE_NAME,
  HASH_KEY,
  RANGE_KEY
)
const Pet = define<Account, Key[typeof HASH_KEY], Key[typeof RANGE_KEY]>(
  TABLE_NAME,
  HASH_KEY,
  RANGE_KEY
)

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
          AttributeName: HASH_KEY,
          AttributeType: 'N'
        },
        {
          AttributeName: RANGE_KEY,
          AttributeType: 'S'
        },
      ],
      KeySchema            : [
        {
          AttributeName: HASH_KEY,
          KeyType      : 'HASH'
        },
        {
          AttributeName: RANGE_KEY,
          KeyType      : 'RANGE'
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits : 1,
        WriteCapacityUnits: 1
      },
      TableName            : TABLE_NAME,
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
