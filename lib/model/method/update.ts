import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import debug from 'debug'
import {Omit} from 'ramda'
import {TScalar} from '../../engine'
import {Runner} from './internal/read'
import {Write} from './internal/write'

const log = debug(['dynalee', __filename].join(':'))

export class Update<S, H extends TScalar> extends Write<S, H, DxPreUpdateInput> {
  constructor(runner: Runner<S, H>) {
    super(runner)
  }
}

type DxUpdateInput = Omit<DocumentClient.UpdateItemInput, 'TableName'>
type DxPreUpdateInput = Omit<DxUpdateInput, 'Key'>
