import {define} from '../model'
import debug from 'debug'

const logger = debug(['dynalee', __filename].join(':'))
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

const Model = define('Test', 'hash', 'range', {
  region: 'dynamon',
  endpoint: 'http://localhost:8000'
})

!async function main() {
//  const result = await Model.batchWrite(params.map(Item => {
//    return {
//      PutRequest: {
//        Item
//      }
//    }
//  }))
//  logger(result)
  await Promise.all(
    params.map(async i => {
      const item = Model.of(i)
      try {
        await item.put()
      } catch(e) {
        logger('error', i)
        logger(e.message.slice(0, 100))
      }
    })
  )

  console.log('start')
  logger(
    await Model
      .scan()
      .run()
  )
  console.log('end')
}()

