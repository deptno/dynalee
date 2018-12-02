import {define} from '../model'
import {ELogs, getLogger} from './log'

const log = getLogger(ELogs.UTIL_DYNAMODB_DOCUMENT)
const params = [
  {hash: 'hashkey0', validValue: 0},
  {hash: 'hashkey1', validString: '1'},
  {hash: 'hashkey2', validSet: new Set([1])},
  {hash: 'hashkey3', validList: [1]},
  {hash: 'hashkey4', emptyString: ''},
  {hash: 'hashkey5', emptySet: new Set()},
  {hash: 'hashkey6', emptyList: []},
  {hash: 'hashkey7', undefined: undefined},
  {hash: 'hashkey8', null: null},
]

const Model = define({
  table  : 'Test',
  hash   : 'hash',
  range  : 'range',
  options: {
    aws: {
      region  : 'dynamon',
      endpoint: 'http://localhost:8000'
    }
  }
})

!async function main() {
  await Promise.all(
    params.map(async (p: any) => {
      const item = Model.of(p)
      try {
        await item.put()
      } catch (e) {
        log('error', p)
        log(e.message.slice(0, 100))
      }
    })
  )

  console.log('start')
  log(
    await Model
      .scan()
      .run()
  )
  console.log('end')
}()

