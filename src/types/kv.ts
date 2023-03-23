import { gnlCpy } from '@lib/utils'

export default class KV {
  key: string
  secret: string
  skey: string
  svalue: string

  constructor() {
    this.key = ''
    this.secret = ''
    this.skey = ''
    this.svalue = ''
  }

  reset() {
    this.key = ''
    this.secret = ''
    this.skey = ''
    this.svalue = ''
  }

  static copy(src: any, tgt?: KV, force = false) {
    return gnlCpy(KV, src, tgt, { force })
  }
}
