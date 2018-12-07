import * as AWS from 'aws-sdk'

function promisify(fx) {
  return (params) => {
    console.log('promisify', params)
    return {
      async promise() {
        return fx(params)
      }
    }
  }
}

function identity(params) {
  console.log('identity', params)
  return {
    ...params,
    __mocked: true
  }
}

function $response(params) {
  console.log('response', params)
  return {
    $response: {
      data: identity(params)
    }
  }
}

AWS.DynamoDB.DocumentClient = class MockDocumentClient {
  batchWrite = promisify(identity)
  batchGet = promisify(identity)
  createSet = promisify(identity)
  delete = promisify(identity)
  put = promisify($response)
  update = promisify(identity)
  get = promisify(identity)
  query = promisify(identity)
  scan = promisify(identity)
} as any

console.log('mocked - AWS.DynamoDB.DocumentClient')