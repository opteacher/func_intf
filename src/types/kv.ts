import { gnlCpy } from '@lib/utils'

export default class KV {
  key: string
  secret: string
  subKey: string
  subVal: string

  constructor() {
    this.key = ''
    this.secret = ''
    this.subKey = ''
    this.subVal = ''
  }

  reset() {
    this.key = ''
    this.secret = ''
    this.subKey = ''
    this.subVal = ''
  }

  static copy(src: any, tgt?: KV, force = false) {
    return gnlCpy(KV, src, tgt, { force })
  }
}
