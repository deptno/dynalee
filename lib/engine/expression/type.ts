import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'

export type OperatorGenerator = (generator: Generator) => Operated
export type Operated = Pick<DocumentClient.QueryInput, 'KeyConditionExpression' | 'ExpressionAttributeValues'>
export type Generator = () => string
export type ComparisonOperator = '=' | '<>' | '>' | '>=' | '<' | '<='
export type TConnector = 'AND' | 'OR' | 'NOT'
export type TExpression = 'KeyConditionExpression' | 'FilterExpression' | 'UpdateExpression'
export type DDBDataType = 'S' | 'N' | 'B' | 'SS' | 'NS' | 'BS' | 'BOOL' | 'NULL' | 'M' | 'L'
export type TUpdateOperator = 'SET' | 'REMOVE' | 'ADD' | 'DELETE'
export type TAssignmentOperator = 'LIST_APPEND' | 'SET'