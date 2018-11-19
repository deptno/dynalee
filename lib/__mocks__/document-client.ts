import * as AWS from 'aws-sdk'
AWS.DynamoDB.DocumentClient = class MockDocumentClient {
  private identity(params) {
    return {
      promise: () => Promise.resolve({
        params,
        __mocked: true
      })
    }
  }
  batchWrite = this.identity
  batchGet = this.identity
  createSet = this.identity
  delete = this.identity
  put = this.identity
  update = this.identity
  get = this.identity
  query = this.identity
  scan = this.identity
} as any

console.log('mocked - AWS.DynamoDB.DocumentClient')