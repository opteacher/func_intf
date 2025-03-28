import { gnlCpy } from '@lib/utils'

export default class Rcrd {
  key: string
  data: any

  constructor() {
    this.key = ''
    this.data = null
  }

  reset() {
    this.key = ''
    this.data = null
  }

  static copy(src: any, tgt?: Rcrd, force = false) {
    return gnlCpy(Rcrd, src, tgt, { force })
  }
}
