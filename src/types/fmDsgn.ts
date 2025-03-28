import { gnlCpy } from '@lib/utils'

export default class FmDsgn {
  cstmForm: string
  edtMapper: any

  constructor() {
    this.cstmForm = ''
    this.edtMapper = {}
  }

  reset() {
    this.cstmForm = ''
    this.edtMapper = {}
  }

  static copy(src: any, tgt?: FmDsgn, force = false) {
    return gnlCpy(FmDsgn, src, tgt, { force })
  }
}
