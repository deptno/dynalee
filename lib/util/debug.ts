import * as debug from 'debug'

export const filenameLogger = (__filename: string) => {
  const suffix = __filename.split('/').slice(-2).join('/')
  return debug(`dynalee:${suffix}`)
}
