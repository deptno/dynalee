import day from 'dayjs'

export interface ModelOptions {
  aws?: AWSOption
  document?: DocumentOptions
}

interface AWSOption {
  region: string
  endpoint: string
}
export interface DocumentOptions {
  timestamp?: {
    createdAt: MapHandlerAttribute
    updatedAt?: MapHandlerAttribute
  }
}

interface MapHandlerAttribute {
  attributeName: string
  handler(): unknown
}

export const defaultModelOptions: ModelOptions = {
  aws: undefined,
  document: {
    timestamp: {
      createdAt: {
        attributeName: 'createdAt',
        handler() {
          return day().format()
        }
      },
      updatedAt: {
        attributeName: 'updatedAt',
        handler() {
          return day().format()
        }
      }
    }
  }
}
