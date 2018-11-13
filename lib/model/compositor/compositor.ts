export class Compositor<S> {
  private compositors: CompositorTuple[]

  constructor(...compositors: CompositorTuple[]) {
    this.compositors = compositors
  }

  composite(data: S): string {
    const composition: any[] = []
    for (const key in data) {
      composition.push(data[key])
    }
    return composition.join(token)
  }

  deComposite(key: string): S {
    const deComposition = key.split(token)
    const ret = {} as S
    let index = 0

    for (const [key, parser] of this.compositors) {
      try {
        ret[key] = parser(deComposition[index++])
      } catch(e) {
        ret[key] = undefined
      }
    }

    return ret
  }
}

const token = '%%'

type CompositorTuple = [string, (name: string) => any]
