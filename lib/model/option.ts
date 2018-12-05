export interface ModelOptions {
  aws?: AWSOption
  document?: DocumentOptions
}

interface AWSOption {
  region: string
  endpoint: string
}
export interface DocumentOptions {
  onCreate: MapHandlerAttribute[],
  onUpdate: MapHandlerAttribute[],
}

export interface MapHandlerAttribute {
  attributeName: string
  handler(prevVal?): unknown
}

export const defaultModelOptions: ModelOptions = {
  aws: undefined,
  document: {
    onCreate: [],
    onUpdate: []
  }
}
