import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client'
import debug from 'debug'
import {Omit} from 'ramda'
import {TScalar} from '../../engine'
import {Read, Runner} from './internal/read'

const logger = debug(['dynalee', __filename].join(':'))

export class Scan<S, H extends TScalar> extends Read<S, H, DxPreScanInput> {
  constructor(runner: Runner<S, H>) {
    super(runner)
  }
}

type DxScanInput = Omit<DocumentClient.ScanInput, 'TableName'>
type DxPreScanInput = Omit<DxScanInput, 'Key'>
