import { gnlCpy } from '@lib/utils'

export default class FstImp {
  impType: 'json' | 'token'
  data: any

  constructor() {
    this.impType = 'json'
    this.data = {}
  }

  reset() {
    this.impType = 'json'
    this.data = {}
  }

  static copy(src: any, tgt?: FstImp, force = false): FstImp {
    return gnlCpy(FstImp, src, tgt, { force })
  }
}
